import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { SessionSkeleton } from '../components/SessionSkeleton';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loading, user, profile } = useAuth();

  if (loading) return <SessionSkeleton />;
  if (!user) return <Navigate to="/login" replace />;

  if (profile && profile.role !== 'warehouse_manager' && profile.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-md border border-border bg-card p-8 text-center shadow-soft">
          <ShieldAlert className="mx-auto h-10 w-10 text-danger" />
          <h1 className="mt-4 text-2xl font-bold">Access restricted</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard is available only to warehouse managers.
          </p>
        </div>
      </main>
    );
  }

  return children;
}
