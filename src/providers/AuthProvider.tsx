import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type { Profile } from '../types/database';
import { useToast } from './ToastProvider';

type SignUpPayload = {
  fullName: string;
  storeName: string;
  email: string;
  password: string;
};

type AuthContextValue = {
  session: Session | null;
  user: Pick<User, 'id' | 'email'> | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const demoAuthKey = 'inventory-demo-auth';
const demoUsersKey = 'inventory-demo-users';

type DemoAuthState = {
  user: { id: string; email: string };
  profile: Profile;
};

type DemoUserRecord = DemoAuthState & {
  password: string;
};

function readDemoAuth() {
  const value = localStorage.getItem(demoAuthKey);
  return value ? (JSON.parse(value) as DemoAuthState) : null;
}

function readDemoUsers() {
  const value = localStorage.getItem(demoUsersKey);
  return value ? (JSON.parse(value) as DemoUserRecord[]) : [];
}

function saveDemoUsers(users: DemoUserRecord[]) {
  localStorage.setItem(demoUsersKey, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [demoUser, setDemoUser] = useState<Pick<User, 'id' | 'email'> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useToast();

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) {
        notify({
          title: 'Could not load your profile',
          description: error.message,
          variant: 'error'
        });
        setProfile(null);
        return;
      }
      setProfile(data);
    },
    [notify]
  );

  useEffect(() => {
    let active = true;

    async function initializeSession() {
      if (!isSupabaseConfigured) {
        const demoAuth = readDemoAuth();
        if (demoAuth) {
          setDemoUser(demoAuth.user);
          setProfile(demoAuth.profile);
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error) {
        notify({ title: 'Session check failed', description: error.message, variant: 'error' });
      }

      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      if (active) setLoading(false);
    }

    initializeSession();

    const {
      data: { subscription }
    } = isSupabaseConfigured
      ? supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
        })
      : { data: { subscription: { unsubscribe: () => undefined } } };

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, notify]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isSupabaseConfigured) {
        const demoUser = readDemoUsers().find(
          (record) => record.user.email.toLowerCase() === email.toLowerCase()
        );

        if (!demoUser || demoUser.password !== password) {
          const error = new Error('No account found with these credentials. Please sign up first.');
          notify({
            title: 'Login failed',
            description: error.message,
            variant: 'error'
          });
          throw error;
        }

        localStorage.setItem(
          demoAuthKey,
          JSON.stringify({ user: demoUser.user, profile: demoUser.profile })
        );
        setDemoUser(demoUser.user);
        setProfile(demoUser.profile);
        notify({
          title: 'Signed in',
          description: 'Demo mode is using the account created in this browser.',
          variant: 'info'
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        notify({ title: 'Login failed', description: error.message, variant: 'error' });
        throw error;
      }
    },
    [notify]
  );

  const signUp = useCallback(
    async ({ fullName, storeName, email, password }: SignUpPayload) => {
      if (!isSupabaseConfigured) {
        const users = readDemoUsers();
        const accountExists = users.some(
          (record) => record.user.email.toLowerCase() === email.toLowerCase()
        );

        if (accountExists) {
          const error = new Error('An account with this email already exists. Please sign in.');
          notify({
            title: 'Sign up failed',
            description: error.message,
            variant: 'error'
          });
          throw error;
        }

        const user = { id: crypto.randomUUID(), email };
        const demoProfile: Profile = {
          id: user.id,
          full_name: fullName,
          role: 'warehouse_manager',
          store_id: crypto.randomUUID(),
          store_name: storeName,
          created_at: new Date().toISOString()
        };

        saveDemoUsers([...users, { user, profile: demoProfile, password }]);
        localStorage.removeItem(demoAuthKey);
        setDemoUser(null);
        setProfile(null);
        notify({
          title: 'Account created',
          description: 'Please sign in with your email and password to access the dashboard.',
          variant: 'success'
        });
        return;
      }

      const storeId = crypto.randomUUID();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            store_name: storeName,
            store_id: storeId,
            role: 'warehouse_manager'
          }
        }
      });

      if (error) {
        notify({ title: 'Sign up failed', description: error.message, variant: 'error' });
        throw error;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role: 'warehouse_manager',
          store_id: storeId,
          store_name: storeName
        });

        if (profileError) {
          notify({
            title: 'Profile creation failed',
            description: profileError.message,
            variant: 'error'
          });
          throw profileError;
        }
      }

      notify({
        title: 'Account created',
        description: 'Please sign in with your email and password to access the dashboard.',
        variant: 'success'
      });

      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
    },
    [notify]
  );

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(demoAuthKey);
      setDemoUser(null);
      setProfile(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      notify({ title: 'Sign out failed', description: error.message, variant: 'error' });
      throw error;
    }
  }, [notify]);

  const refreshProfile = useCallback(async () => {
    if (!isSupabaseConfigured) {
      const demoAuth = readDemoAuth();
      setProfile(demoAuth?.profile ?? null);
      return;
    }

    if (session?.user) await loadProfile(session.user.id);
  }, [loadProfile, session?.user]);

  const value = useMemo(
    () => ({
      session,
      user: isSupabaseConfigured ? session?.user ?? null : demoUser,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      refreshProfile
    }),
    [demoUser, loading, profile, refreshProfile, session, signIn, signOut, signUp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
