import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import { ForgotPasswordSchema, ForgotPasswordInput } from '@brightloop/contracts';
import { apiClient } from '../../services/api';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err: any) {
      // Even on non-200 or network issue, display safe feedback unless fatal
      setError(err.response?.data?.message || 'Unable to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Reset Access to Your Account"
      subheading="Follow our secure recovery process to regain access to your Brightloop subscription workspace."
      type="reset"
      benefits={[
        'Automated, secure, time-limited recovery link delivery',
        'Multi-factor account protection & audit logging',
        'Encrypted credentials verification',
      ]}
    >
      <Card className="border-border/80 shadow-xl bg-card">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Forgot your password?
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Don't worry. Enter your registered email address and we'll help you reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {submitted ? (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm">
                <MailCheck className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Check your inbox</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  If an account exists with this email, you will receive a password reset link shortly.
                </p>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" className="w-full h-11 text-sm font-medium gap-2">
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground" htmlFor="email">
                  Registered Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  {...register('email')}
                  autoComplete="email"
                  className="h-10 text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-destructive font-medium">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2 mt-2"
              >
                {loading ? (
                  <span>Sending reset link...</span>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
