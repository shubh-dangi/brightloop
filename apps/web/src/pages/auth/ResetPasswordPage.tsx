import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

const ResetPasswordClientSchema = z
  .object({
    password: z
      .string()
      .min(9, 'Password must be at least 9 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordClientInput = z.infer<typeof ResetPasswordClientSchema>;

export function ResetPasswordPage() {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const token = routeToken || searchParams.get('token') || '';

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordClientInput>({
    resolver: zodResolver(ResetPasswordClientSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: ResetPasswordClientInput) => {
    if (!token) {
      setError('Password reset token is missing or malformed.');
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
          'Password reset token is expired or invalid. Please request a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Secure Your Workspace Access"
      subheading="Create a compliant, robust credential to safeguard your subscription data and financial records."
      type="reset"
      benefits={[
        'Argon2id cryptographic hashing with enterprise-grade salt generation',
        'Automatic termination of previous active sessions for compromised tokens',
        'Direct multi-tenant audit trail validation',
      ]}
    >
      <Card className="border-border/80 shadow-xl bg-card">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create a New Password
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Choose a strong password to secure your Brightloop account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

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
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    {...register('password')}
                    autoComplete="new-password"
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Checklist */}
                <PasswordStrengthIndicator password={passwordValue} />

                {errors.password && (
                  <p className="text-xs text-destructive font-medium pt-0.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    {...register('confirmPassword')}
                    autoComplete="new-password"
                    className="h-10 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2 mt-2"
              >
                {loading ? (
                  <span>Saving new password...</span>
                ) : (
                  <>
                    <span>Set New Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Return to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
