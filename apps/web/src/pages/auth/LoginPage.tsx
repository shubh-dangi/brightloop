import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { LoginSchema, LoginInput } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'owner@brightloop.local',
      password: 'Password123!',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      // Determine redirection based on authenticated state
      navigate('/dashboard');
    } catch {
      // Error is stored in authStore
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
  };

  return (
    <AuthLayout
      heading="Welcome Back to Brightloop"
      subheading="Manage your subscriptions, automate billing, and stay in control of your business."
      type="login"
    >
      <Card className="border-border/80 shadow-xl bg-card">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Sign in to your account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Welcome back! Enter your details to access your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="email">
                Email Address
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  autoComplete="current-password"
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
              {errors.password && (
                <p className="text-xs text-destructive font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <label
                htmlFor="remember"
                className="text-xs text-muted-foreground font-medium cursor-pointer select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2 mt-2"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Demo Credentials for Evaluation */}
          <div className="pt-4 border-t border-border/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <KeyRound className="h-3 w-3" /> Quick Demo Fill
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">Dev Credentials</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemo('owner@brightloop.local')}
                className="text-xs font-mono h-8 cursor-pointer"
              >
                Owner
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemo('admin@brightloop.local')}
                className="text-xs font-mono h-8 cursor-pointer"
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillDemo('member@brightloop.local')}
                className="text-xs font-mono h-8 cursor-pointer"
              >
                Staff
              </Button>
            </div>
          </div>

          {/* Signup Link */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-semibold hover:underline">
              Create an account.
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
