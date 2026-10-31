import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, ShieldCheck } from 'lucide-react';
import { UpdateProfileSchema, ChangePasswordSchema, UpdateProfileInput, ChangePasswordInput } from '@brightloop/contracts';
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
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="My Profile"
        description="Personal workspace credentials, authentication identities, and cryptographic security settings"
      />

      {/* User Card Summary — Linear Precision Header */}
      <Card className="border-border/80 bg-card">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5">
          <Avatar className="h-16 w-16 border border-border/80">
            <AvatarImage src={user?.avatarUrl || ''} />
            <AvatarFallback className="text-base font-mono font-bold bg-primary/10 text-primary">
              {user?.name?.slice(0, 2).toUpperCase() || 'BL'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate">{user?.name}</h2>
              <Badge variant="outline" className="w-fit mx-auto sm:mx-0 gap-1 text-emerald-500 border-emerald-500/30 font-mono text-[10px]">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            </div>
            <p className="text-xs font-mono text-muted-foreground">{user?.email}</p>
            <p className="text-[11px] font-mono text-muted-foreground/70 tabular-nums">
              Member since {formatDate(user?.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile Information Form */}
        <Card className="border-border/80 bg-card">
          <form onSubmit={profileForm.handleSubmit(onUpdateProfile)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <User className="h-4 w-4 text-primary" /> Personal Details
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Display credentials across collaborative records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {profileMsg && (
                <Alert variant={profileMsg.type === 'error' ? 'destructive' : 'success'}>
                  <AlertDescription>{profileMsg.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="name">
                  Full Name
                </label>
                <Input id="name" className="h-8 text-xs bg-card border-border" {...profileForm.register('name')} />
                {profileForm.formState.errors.name && (
                  <p className="text-[11px] text-destructive font-mono">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input id="email" type="email" className="h-8 text-xs bg-card border-border" {...profileForm.register('email')} />
                {profileForm.formState.errors.email && (
                  <p className="text-[11px] text-destructive font-mono">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="avatarUrl">
                  Avatar Image URL
                </label>
                <Input
                  id="avatarUrl"
                  placeholder="https://..."
                  className="h-8 text-xs bg-card border-border"
                  {...profileForm.register('avatarUrl')}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/60">
              <Button type="submit" disabled={updatingProfile} size="sm" className="h-8 text-xs">
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Change Password Form */}
        <Card className="border-border/80 bg-card">
          <form onSubmit={passForm.handleSubmit(onChangePassword)}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Lock className="h-4 w-4 text-primary" /> Change Password
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Strengthen security with Argon2id-backed authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              {passMsg && (
                <Alert variant={passMsg.type === 'error' ? 'destructive' : 'success'}>
                  <AlertDescription>{passMsg.text}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="currentPassword">
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-8 text-xs bg-card border-border"
                  {...passForm.register('currentPassword')}
                />
                {passForm.formState.errors.currentPassword && (
                  <p className="text-[11px] text-destructive font-mono">
                    {passForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="newPassword">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  className="h-8 text-xs bg-card border-border"
                  {...passForm.register('newPassword')}
                />
                {passForm.formState.errors.newPassword && (
                  <p className="text-[11px] text-destructive font-mono">
                    {passForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/60">
              <Button type="submit" disabled={updatingPass} size="sm" className="h-8 text-xs">
                {updatingPass ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
