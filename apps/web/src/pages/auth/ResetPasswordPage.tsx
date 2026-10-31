import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { apiClient } from '../../services/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { AuthErrorMessage } from '../../components/auth/AuthErrorMessage';
import { Button } from '../../components/ui/button';

const ResetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(9, 'Password must be more than 8 characters (minimum 9)')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof ResetPasswordFormSchema>;

export function ResetPasswordPage() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError('Password reset token is missing. Please use the link provided in your email.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', {
        token,
        password: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Password reset token has expired or is invalid. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create a New Secure Password"
      subheading="Safeguard your workspace access with encrypted enterprise credentials."
      type="reset"
      benefits={[
        'Argon2id cryptographic hashing with enterprise-grade salt generation',
        'Automatic revocation of previous active sessions',
        'Direct multi-tenant audit trail logging',
      ]}
    >
      <AuthFormContainer
        title="Create a New Password"
        description="Choose a strong password to secure your Brightloop account."
      >
        <AuthErrorMessage message={error} />

        {success ? (
          <div className="space-y-5 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Password updated successfully!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                Your credentials have been updated. You can now sign in with your new password.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <PasswordInput
                id="password"
                label="New Password"
                placeholder="Enter new password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Live Password Strength Requirements */}
              <PasswordStrengthIndicator password={passwordValue} />
            </div>

            {/* Confirm New Password */}
            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {/* Submit Button */}
            <AuthSubmitButton
              label="Set New Password"
              loadingLabel="Saving new password..."
              isLoading={loading}
            />

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              >
                Return to Sign In
              </Link>
            </div>
          </form>
        )}
      </AuthFormContainer>
    </AuthLayout>
  );
}
