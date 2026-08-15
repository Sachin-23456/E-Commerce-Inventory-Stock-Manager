import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../providers/AuthProvider';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [navigate, user]);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function submit(values: LoginValues) {
    await signIn(values.email, values.password);
    navigate('/dashboard', { replace: true });
  }

  return (
    <AuthLayout
      title="Manager Login"
      subtitle="Sign in to access your protected inventory dashboard."
      footerText="New warehouse manager?"
      footerLinkText="Create an account"
      footerHref="/signup"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <label className="space-y-2 block">
          <span className="label">Email</span>
          <input className="input" type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
        </label>

        <label className="space-y-2 block">
          <span className="label">Password</span>
          <input className="input" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
        </label>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          <LogIn className="h-4 w-4" />
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
