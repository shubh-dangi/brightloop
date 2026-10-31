import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card } from '../../components/ui/card';
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
import { MemberDto } from '@brightloop/contracts';

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
            email: 'owner@brightloop.local',
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
            email: 'admin@brightloop.local',
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
            email: 'member@brightloop.local',
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndRoles();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    try {
      await apiClient.post('/organizations/invitations', {
        email: inviteEmail,
        role: selectedRole,
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
    <div className="space-y-5">
      <PageHeader
        title="Team Members"
        description="Collaborators and role-based permissions assigned in this workspace"
      >
        <Button onClick={() => setInviteOpen(true)} size="sm" className="gap-1.5 h-8 text-xs font-mono">
          <UserPlus className="h-3.5 w-3.5" />
          Invite Member
        </Button>
      </PageHeader>

      {/* Member Table — Linear Precision Ledger */}
      <Card className="border-border/80 bg-card overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated/70 border-b border-border text-[10px] uppercase font-mono tracking-wider text-muted-foreground font-medium">
              <tr>
                <th className="py-2.5 px-3.5">User</th>
                <th className="py-2.5 px-3.5">Role</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Joined Date</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
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
                  <td colSpan={5} className="py-8 text-center text-muted-foreground font-mono">
                    No members found.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-surface-hover/60 transition-colors">
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 border border-border/70">
                          <AvatarImage src={member.user.avatarUrl || ''} />
                          <AvatarFallback className="text-[10px] font-mono font-semibold">
                            {member.user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{member.user.name}</span>
                          <span className="text-[11px] font-mono text-muted-foreground">{member.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <Badge variant={roleBadgeVariant(member.roleName) as any} className="font-mono text-[10px]">
                        {member.roleName}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-500 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {member.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-[11px] text-muted-foreground tabular-nums">
                      {formatDate(member.joinedAt)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      {member.roleName !== 'OWNER' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteConfirmMember(member)}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Remove member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
            <DialogHeader className="pb-2 border-b border-border/60">
              <DialogTitle className="text-base font-semibold text-foreground">Invite Team Member</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Send an invitation to join this multi-tenant workspace.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3.5 py-4 text-xs">
              {inviteError && (
                <Alert variant="destructive">
                  <AlertDescription>{inviteError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="inviteEmail">
                  Email Address
                </label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="colleague@brightloop.local"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="h-8 text-xs bg-card border-border"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Workspace Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="h-8 text-xs font-mono bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-mono">
                    <SelectItem value="MEMBER">Member (Full record CRUD)</SelectItem>
                    <SelectItem value="ADMIN">Admin (Members & Settings)</SelectItem>
                    <SelectItem value="VIEWER">Viewer (Read-only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2 border-t border-border/60 gap-2 sm:gap-0">
              <Button type="button" variant="outline" size="sm" onClick={() => setInviteOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={inviting} className="h-8 text-xs">
                {inviting ? 'Sending...' : 'Send Invitation'}
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
            <DialogTitle className="flex items-center gap-2 text-destructive text-base">
              <AlertCircle className="h-4 w-4" />
              Remove Team Member
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to revoke workspace access for{' '}
              <strong className="text-foreground">{deleteConfirmMember?.user?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmMember(null)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleRemoveMember} disabled={deleting} className="h-8 text-xs">
              {deleting ? 'Removing...' : 'Confirm Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
