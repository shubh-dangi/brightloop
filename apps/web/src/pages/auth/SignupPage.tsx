import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

// Form validation schema adhering to strict project specification
const ClientSignupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(64, 'Full name is too long'),
    email: z.string().trim().email('Please enter a valid email address'),
    organizationName: z.string().trim().optional(),
    password: z
      .string()
      .min(9, 'Password must be at least 9 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ClientSignupInput = z.infer<typeof ClientSignupSchema>;

export function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientSignupInput>({
    resolver: zodResolver(ClientSignupSchema),
    defaultValues: {
      name: '',
      email: '',
      organizationName: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const passwordValue = watch('password') || '';
  const termsAccepted = watch('termsAccepted');

  const onSubmit = async (data: ClientSignupInput) => {
    try {
      // Role is guaranteed customer on backend; frontend never specifies administrative roles
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName || `${data.name}'s Workspace`,
      });
      navigate('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  return (
    <AuthLayout
      heading="Start Managing Smarter with Brightloop"
      subheading="Bring your customers, subscriptions, recurring invoices, and payments together in one organized platform."
      type="signup"
      benefits={[
        'Simplify subscription management and plan variations',
        'Automate recurring billing cycles and proration calculations',
        'Track payments, aging invoices, and real-time revenue metrics',
      ]}
    >
      <Card className="border-border/80 shadow-xl bg-card">
        <CardHeader className="space-y-1.5 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Create your Brightloop account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Get started by creating your account and provisioning your workspace.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {error && (
            <Alert variant="destructive" className="py-2.5">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="name">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                {...register('name')}
                autoComplete="name"
                className="h-10 text-sm"
              />
              {errors.name && (
                <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
              )}
            </div>

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

            {/* Workspace / Org Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="orgName">
                Workspace / Organization Name (Optional)
              </label>
              <Input
                id="orgName"
                type="text"
                placeholder="e.g. Acme SaaS Operations"
                {...register('organizationName')}
                className="h-10 text-sm"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
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

              {/* Live Password Strength Indicator */}
              <PasswordStrengthIndicator password={passwordValue} />

              {errors.password && (
                <p className="text-xs text-destructive font-medium pt-0.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
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
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="space-y-1 pt-1">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setValue('termsAccepted', !!checked, { shouldValidate: true })}
                  className="mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
                >
                  I agree to the{' '}
                  <span className="text-primary hover:underline font-medium">Terms of Service</span> and{' '}
                  <span className="text-primary hover:underline font-medium">Privacy Policy</span>.
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-xs text-destructive font-medium">{errors.termsAccepted.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-sm font-semibold shadow-sm hover:shadow cursor-pointer gap-2 mt-2"
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Public registration secures a customer account with encrypted credentials.</span>
          </div>

          {/* Login Link */}
          <div className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
