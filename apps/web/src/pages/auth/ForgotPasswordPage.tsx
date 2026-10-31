import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hexagon, ArrowLeft, MailCheck } from 'lucide-react';
import { ForgotPasswordSchema, ForgotPasswordInput } from '@subpulse/contracts';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
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
      setError(err.response?.data?.message || 'Failed to dispatch reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Hexagon className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot password?</h1>
          <p className="text-sm text-muted-foreground">
            We will send you password reset instructions
          </p>
        </div>

        <Card className="border-border/80 shadow-lg">
          {submitted ? (
            <CardContent className="pt-6 space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <MailCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                If an account exists with that address, we have sent password reset instructions to your inbox.
              </p>
              <div className="pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </Button>
              </div>
            </CardContent>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-xl">Reset Password</CardTitle>
                <CardDescription>
                  Enter your email address to receive a secure password reset link
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-foreground" htmlFor="email">
                    Account Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@unknown.local"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending link...' : 'Send Reset Link'}
                </Button>
                <div className="text-center text-xs">
                  <Link to="/login" className="text-muted-foreground hover:text-foreground inline-flex items-center">
                    <ArrowLeft className="mr-1 h-3 w-3" /> Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
