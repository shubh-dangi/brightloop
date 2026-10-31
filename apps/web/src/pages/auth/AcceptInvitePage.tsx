import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthFormContainer } from '../../components/auth/AuthFormContainer';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator';
import { AuthSubmitButton } from '../../components/auth/AuthSubmitButton';
import { AuthErrorMessage } from '../../components/auth/AuthErrorMessage';
import { toast } from 'sonner';

const AcceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(9, 'Password must be more than 8 characters (minimum 9)')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type AcceptInviteFormValues = z.infer<typeof AcceptInviteSchema>;

export function AcceptInvitePage() {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(AcceptInviteSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (data: AcceptInviteFormValues) => {
    setLoading(true);
    setError(null);
    try {
      // In production, would call POST /auth/accept-invite with token
      toast.success('Invitation accepted! Welcome to the team workspace.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Welcome to Brightloop Staff Portal"
      subheading="You have been invited by an administrator to join this subscription operations team."
      type="signup"
    >
      <AuthFormContainer
        title="Activate Your Staff Account"
        description="Set your secure password to complete workspace onboarding."
      >
        <AuthErrorMessage message={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <PasswordInput
              label="Create Password *"
              placeholder="Minimum 9 characters..."
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          <div className="space-y-1.5">
            <PasswordInput
              label="Confirm Password *"
              placeholder="Re-enter password..."
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
          </div>

          <AuthSubmitButton
            label="Activate Account & Join Team"
            isLoading={loading}
          />
        </form>
      </AuthFormContainer>
    </AuthLayout>
  );
}
