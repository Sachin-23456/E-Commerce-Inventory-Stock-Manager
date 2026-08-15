import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../providers/AuthProvider';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required.'),
    storeName: z.string().min(2, 'Store name is required.'),
    email: z.string().email('Enter a valid email.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(6, 'Confirm your password.')
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  });

type SignUpValues = z.infer<typeof signupSchema>;

export function SignUpPage() {
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      storeName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function submit(values: SignUpValues) {
    await signUp(values);
    navigate('/login', { replace: true });
  }

  return (
    <AuthLayout
      title="Create Manager Account"
      subtitle="Create a warehouse manager profile and store workspace."
      footerText="Already have access?"
      footerLinkText="Sign in"
      footerHref="/login"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        <label className="space-y-2 block">
          <span className="label">Full name</span>
          <input className="input" autoComplete="name" {...register('fullName')} />
          {errors.fullName ? <p className="error-text">{errors.fullName.message}</p> : null}
        </label>

        <label className="space-y-2 block">
          <span className="label">Store name</span>
          <input className="input" placeholder="Downtown Fulfillment" {...register('storeName')} />
          {errors.storeName ? <p className="error-text">{errors.storeName.message}</p> : null}
        </label>

        <label className="space-y-2 block">
          <span className="label">Email</span>
          <input className="input" type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <p className="error-text">{errors.email.message}</p> : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 block">
            <span className="label">Password</span>
            <input className="input" type="password" autoComplete="new-password" {...register('password')} />
            {errors.password ? <p className="error-text">{errors.password.message}</p> : null}
          </label>

          <label className="space-y-2 block">
            <span className="label">Confirm</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="error-text">{errors.confirmPassword.message}</p>
            ) : null}
          </label>
        </div>

        <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
          <UserPlus className="h-4 w-4" />
          {isSubmitting ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
