import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { AuthErrorMessage } from '../../components/auth/AuthErrorMessage';
import { Checkbox } from '../../components/ui/checkbox';

// Strict validation matching project requirements
const SignupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(64, 'Full name is too long'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(9, 'Password must be more than 8 characters (minimum 9)')
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

type SignupFormValues = z.infer<typeof SignupFormSchema>;

export function SignupPage() {
  const { signup, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(SignupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const passwordValue = watch('password') || '';
  const termsAccepted = watch('termsAccepted');

  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Role Security: Public signup exclusively registers Customer accounts.
      // Roles like Admin or Staff are strictly prohibited from public self-selection and are assigned securely by the backend.
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        organizationName: `${data.name}'s Workspace`,
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
        'Simplify subscription management.',
        'Automate recurring billing.',
        'Track payments and revenue.',
      ]}
    >
      <AuthFormContainer
        title="Create your Brightloop account"
        description="Get started by creating your account."
        footer={
          <div className="space-y-4">
            {/* Security Guarantee */}
            <div className="pt-2 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Public signup creates a secure Customer account with isolated data access.</span>
            </div>

            {/* Login Link */}
            <div className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        }
      >
        <AuthErrorMessage message={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <AuthInput
            id="name"
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

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

          {/* Password with Visibility Toggle */}
          <div className="space-y-1.5">
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Create a password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Live Password Strength Requirements Checklist */}
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          {/* Confirm Password */}
          <PasswordInput
            id="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Terms and Conditions Checkbox */}
          <div className="space-y-1 pt-1">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) =>
                  setValue('termsAccepted', !!checked, { shouldValidate: true })
                }
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
          <AuthSubmitButton
            label="Create Account"
            loadingLabel="Creating Account..."
            isLoading={isLoading}
          />
        </form>
      </AuthFormContainer>
    </AuthLayout>
  );
}
