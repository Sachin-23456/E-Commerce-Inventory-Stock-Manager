import { Boxes, LogOut, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

export function AuthHeader() {
  const { profile, user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const initials = (profile?.full_name ?? user?.email ?? 'WM')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground shadow-soft">
            <Boxes className="h-6 w-6" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                {profile?.store_name ?? 'Store'}
              </p>
              <span className="inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-bold text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Manager
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Inventory Dashboard
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:bg-muted"
            aria-label="Toggle dark mode"
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <div className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-background px-3 py-2 shadow-sm">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="hidden max-w-[220px] sm:block">
              <p className="truncate text-sm font-semibold">{profile?.full_name ?? 'Manager'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <button type="button" onClick={() => void signOut()} className="btn-secondary">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
