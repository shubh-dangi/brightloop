import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UpdateProfileSchema, ChangePasswordSchema, UpdateProfileInput, ChangePasswordInput } from '@subpulse/contracts';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { PageHeader } from '../../components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { formatDate } from '../../lib/utils';

export function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passMsg, setPassMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    },
  });

  const passForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const onUpdateProfile = async (data: UpdateProfileInput) => {
    setUpdatingProfile(true);
    setProfileMsg(null);
    try {
      const res = await apiClient.patch('/users/profile', data);
      if (res.data?.data) {
        setUser(res.data.data);
      }
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordInput) => {
    setUpdatingPass(true);
    setPassMsg(null);
    try {
      await apiClient.post('/users/change-password', data);
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      passForm.reset();
    } catch (err: any) {
      setPassMsg({
        type: 'error',
        text: err.response?.data?.message || 'Incorrect current password or validation error.',
      });
    } finally {
      setUpdatingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="My Profile"
        description="Manage your personal information, security credentials, and identity"
      />

      {/* User Card Summary */}
      <Card className="shadow-xs">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarImage src={user?.avatarUrl || ''} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {user?.name?.slice(0, 2).toUpperCase() || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
              <Badge variant="outline" className="w-fit mx-auto sm:mx-0 gap-1 text-emerald-600 border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" />
                Verified Account
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground/80">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Information Form */}
        <Card className="shadow-xs">
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Details
              </CardTitle>
              <CardDescription>Update your display name and email address</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMsg && (
                <Alert variant={profileMsg.type === 'error' ? 'destructive' : 'success'}>
                  <AlertDescription>{profileMsg.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="name">
                  Full Name
                </label>
                <Input id="name" {...profileForm.register('name')} />
                {profileForm.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input id="email" type="email" {...profileForm.register('email')} />
                {profileForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="avatarUrl">
                  Avatar Image URL
                </label>
                <Input
                  id="avatarUrl"
                  placeholder="https://..."
                  {...profileForm.register('avatarUrl')}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={updatingProfile} size="sm">
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="shadow-xs">
          <form onSubmit={passForm.handleSubmit(onChangePassword)}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> Change Password
              </CardTitle>
              <CardDescription>
                Ensure your account uses a strong, unique password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passMsg && (
                <Alert variant={passMsg.type === 'error' ? 'destructive' : 'success'}>
                  <AlertDescription>{passMsg.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="currentPassword">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passForm.register('currentPassword')}
                />
                {passForm.formState.errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="newPassword">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  {...passForm.register('newPassword')}
                />
                {passForm.formState.errors.newPassword && (
                  <p className="text-xs text-destructive">
                    {passForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={updatingPass} size="sm">
                {updatingPass ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
