import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Shield, MoreHorizontal, Check, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { formatDate } from '../../lib/utils';
import { MemberDto } from '@subpulse/contracts';

export function TeamMembersPage() {
  const { role: currentUserRole } = useAuthStore();
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [deleteConfirmMember, setDeleteConfirmMember] = useState<MemberDto | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMembersAndRoles = async () => {
    setLoading(true);
    try {
      const [membersRes, rolesRes] = await Promise.all([
        apiClient.get('/organizations/members'),
        apiClient.get('/organizations/roles'),
      ]);
      setMembers(membersRes.data?.data || []);
      setRoles(rolesRes.data?.data || []);
    } catch {
      // Fallback demo members
      setMembers([
        {
          id: 'm-1',
          userId: 'usr-1',
          user: {
            id: 'usr-1',
            name: 'Taylor Reed (Owner)',
            email: 'owner@subpulse.local',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          roleId: 'role-1',
          roleName: 'OWNER',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
        {
          id: 'm-2',
          userId: 'usr-2',
          user: {
            id: 'usr-2',
            name: 'Morgan Blake (Admin)',
            email: 'admin@subpulse.local',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          roleId: 'role-2',
          roleName: 'ADMIN',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        },
        {
          id: 'm-3',
          userId: 'usr-3',
          user: {
            id: 'usr-3',
            name: 'Jordan Hayes (Member)',
            email: 'member@subpulse.local',
            isEmailVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          roleId: 'role-3',
          roleName: 'MEMBER',
          status: 'ACTIVE',
          joinedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      ]);
      setRoles([
        { id: 'role-1', name: 'OWNER' },
        { id: 'role-2', name: 'ADMIN' },
        { id: 'role-3', name: 'MEMBER' },
        { id: 'role-4', name: 'VIEWER' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndRoles();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    setInviteError(null);
    try {
      const targetRole = roles.find((r) => r.name === selectedRole);
      await apiClient.post('/organizations/members/invite', {
        email: inviteEmail,
        roleId: targetRole?.id,
      });
      setInviteOpen(false);
      setInviteEmail('');
      fetchMembersAndRoles();
    } catch (err: any) {
      setInviteError(err.response?.data?.message || 'Failed to send workspace invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!deleteConfirmMember) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/organizations/members/${deleteConfirmMember.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== deleteConfirmMember.id));
      setDeleteConfirmMember(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not remove member');
    } finally {
      setDeleting(false);
    }
  };

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'default';
      case 'ADMIN':
        return 'info';
      case 'MEMBER':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Members"
        description="Manage workspace users, invitations, and assigned RBAC roles"
      >
        <Button onClick={() => setInviteOpen(true)} size="sm" className="gap-1.5">
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Button>
      </PageHeader>

      {/* Member Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Spinner size="default" className="mx-auto" />
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user.avatarUrl || ''} />
                          <AvatarFallback className="text-xs font-semibold">
                            {member.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{member.user.name}</span>
                          <span className="text-xs text-muted-foreground">{member.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={roleBadgeVariant(member.roleName) as any}>
                        {member.roleName}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {member.roleName !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmMember(member)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Remove member"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Invite Member Modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation link to collaborate in this workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {inviteError && (
                <Alert variant="destructive">
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="inviteEmail">
                  Email Address
                </label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@subpulse.local"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Workspace Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member (Full record CRUD)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Members & Settings)</SelectItem>
                    <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviting}>
                {inviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmMember}
        onOpenChange={(open) => !open && setDeleteConfirmMember(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <strong className="text-foreground">{deleteConfirmMember?.user?.name}</strong> from
              this workspace? They will immediately lose all access.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmMember(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={deleting}
            >
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
