import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { LoginSchema, LoginInput } from '@brightloop/contracts';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { AuthErrorMessage } from '../../components/auth/AuthErrorMessage';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';

export function LoginPage() {
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
      email: 'admin@gmail.com',
      password: 'admin@123',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      // Role-based navigation: Admin/Owner, Staff, or Customer
      const authState = useAuthStore.getState();
      const userRole = authState.role?.toUpperCase();

      if (userRole === 'ADMIN' || userRole === 'OWNER') {
        navigate('/dashboard');
      } else if (userRole === 'MEMBER' || userRole === 'STAFF') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // Error handled by store
    }
  };

  const fillDemo = async (email: string, password = 'admin@123') => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
    await onSubmit({ email, password });
  };

  return (
    <AuthLayout
      heading="Welcome Back to Brightloop"
      subheading="Manage your subscriptions, automate billing, and stay in control of your business."
      type="login"
    >
      <AuthFormContainer
        title="Sign in to your account"
        description="Welcome back! Enter your details to access your workspace."
        footer={
          <div className="space-y-4">
            {/* Quick Demo Credentials for Fast Evaluation */}
            <div className="pt-3 border-t border-border/60 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Quick Demo Fill
                </span>
                <span className="font-mono">Dev Accounts</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('admin@gmail.com', 'admin@123')}
                  className="text-xs font-mono h-8 cursor-pointer px-1"
                >
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('staff@gmail.com', 'staff@123')}
                  className="text-xs font-mono h-8 cursor-pointer px-1"
                >
                  Staff
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('customer1@gmail.com', 'customer@123')}
                  className="text-xs font-mono h-8 cursor-pointer px-1"
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemo('owner@gmail.com', 'owner@123')}
                  className="text-xs font-mono h-8 cursor-pointer px-1"
                >
                  Owner
                </Button>
              </div>
            </div>

            {/* Signup Navigation Link */}
            <div className="text-center text-xs text-muted-foreground pt-1">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create an account.
              </Link>
            </div>
          </div>
        }
      >
        <AuthErrorMessage message={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Address */}
          <AuthInput
            id="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Password with Visibility Toggle & Forgot Password Link */}
          <PasswordInput
            id="password"
            label="Password"
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            actionRight={
              <Link
                to="/forgot-password"
                className="text-xs text-primary font-medium hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            }
            {...register('password')}
          />

          {/* Remember Me */}
          <div className="flex items-center space-x-2 pt-0.5">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
            />
            <label
              htmlFor="remember"
              className="text-xs text-muted-foreground font-medium cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <AuthSubmitButton
            label="Sign In"
            loadingLabel="Signing in..."
            isLoading={isLoading}
          />
        </form>
      </AuthFormContainer>
    </AuthLayout>
  );
}
