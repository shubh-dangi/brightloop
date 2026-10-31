import React, { useState, useEffect } from 'react';
import { Shield, Plus, Check, Trash2, Key, Info } from 'lucide-react';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/spinner';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface RoleItem {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  memberCount: number;
  permissions: string[];
}

const ALL_SYSTEM_PERMISSIONS = [
  { key: 'org:read', name: 'View Organization', module: 'Organization' },
  { key: 'org:update', name: 'Update Organization', module: 'Organization' },
  { key: 'org:delete', name: 'Delete Organization', module: 'Organization' },
  { key: 'members:read', name: 'View Members', module: 'Members' },
  { key: 'members:invite', name: 'Invite Members', module: 'Members' },
  { key: 'members:update', name: 'Update Member Roles', module: 'Members' },
  { key: 'members:remove', name: 'Remove Members', module: 'Members' },
  { key: 'roles:manage', name: 'Manage Roles & Permissions', module: 'Roles' },
  { key: 'records:read', name: 'View Records', module: 'Records' },
  { key: 'records:create', name: 'Create Records', module: 'Records' },
  { key: 'records:update', name: 'Update Records', module: 'Records' },
  { key: 'records:delete', name: 'Delete Records', module: 'Records' },
  { key: 'settings:update', name: 'Update System Settings', module: 'Settings' },
  { key: 'audit:read', name: 'View Activity Audit Logs', module: 'Audit' },
];

export function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/roles');
      setRoles(res.data?.data || []);
    } catch {
      // Fallback demo roles
      setRoles([
        {
          id: 'r-1',
          name: 'OWNER',
          description: 'Full workspace ownership and control',
          isSystem: true,
          memberCount: 1,
          permissions: ALL_SYSTEM_PERMISSIONS.map((p) => p.key),
        },
        {
          id: 'r-2',
          name: 'ADMIN',
          description: 'Administrative access over members and records',
          isSystem: true,
          memberCount: 1,
          permissions: ALL_SYSTEM_PERMISSIONS.filter((p) => p.key !== 'org:delete').map((p) => p.key),
        },
        {
          id: 'r-3',
          name: 'MEMBER',
          description: 'Standard member with record creation and editing rights',
          isSystem: true,
          memberCount: 1,
          permissions: ['records:read', 'records:create', 'records:update', 'records:delete', 'members:read', 'audit:read'],
        },
        {
          id: 'r-4',
          name: 'VIEWER',
          description: 'Read-only access across workspace records',
          isSystem: true,
          memberCount: 0,
          permissions: ['records:read', 'members:read', 'audit:read'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleTogglePerm = (key: string) => {
    setSelectedPerms((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;

    setSaving(true);
    setCreateError(null);
    try {
      await apiClient.post('/roles', {
        name: roleName.toUpperCase(),
        description: roleDesc,
        permissions: selectedPerms,
      });
      setCreateOpen(false);
      setRoleName('');
      setRoleDesc('');
      setSelectedPerms([]);
      fetchRoles();
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create custom role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;
    try {
      await apiClient.delete(`/roles/${roleId}`);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not delete role');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permissions"
        description="Enterprise RBAC permission matrix and custom workspace role configuration"
      >
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Create Custom Role
        </Button>
      </PageHeader>

      {/* Role Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-8 flex justify-center">
            <Spinner />
          </div>
        ) : (
          roles.map((role) => (
            <Card key={role.id} className="shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant={role.isSystem ? 'default' : 'secondary'} className="text-[10px]">
                    {role.isSystem ? 'System' : 'Custom'}
                  </Badge>
                  {!role.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                      title="Delete role"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <CardTitle className="text-base font-bold mt-2">{role.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {role.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/60 pt-2">
                  <span>{role.permissions.length} Permissions</span>
                  <span>{role.memberCount} Member(s)</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Permission Matrix */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" /> Permission Matrix
          </CardTitle>
          <CardDescription>
            System privileges assigned to roles within this organization
          </CardDescription>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="py-3 px-4">Permission Key</th>
                <th className="py-3 px-4">Module</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-3 px-4 text-center">
                    {r.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {ALL_SYSTEM_PERMISSIONS.map((perm) => (
                <tr key={perm.key} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{perm.name}</span>
                      <code className="text-[11px] text-muted-foreground">{perm.key}</code>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="text-[10px]">
                      {perm.module}
                    </Badge>
                  </td>
                  {roles.map((r) => {
                    const hasPerm =
                      r.name === 'OWNER' || r.permissions.includes(perm.key);
                    return (
                      <td key={r.id} className="py-3 px-4 text-center">
                        {hasPerm ? (
                          <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <span className="text-muted-foreground/30 text-xs">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Role Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreateRole}>
            <DialogHeader>
              <DialogTitle>Create Custom Workspace Role</DialogTitle>
              <DialogDescription>
                Define a tailored role with specific permission access flags.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {createError && (
                <Alert variant="destructive">
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="roleName">
                  Role Identifier Name
                </label>
                <Input
                  id="roleName"
                  placeholder="ANALYST"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="roleDesc">
                  Description
                </label>
                <Textarea
                  id="roleDesc"
                  placeholder="Can view analytics and read workspace records..."
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Select Permissions</label>
                <div className="border border-border/80 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto">
                  {ALL_SYSTEM_PERMISSIONS.map((perm) => (
                    <div
                      key={perm.key}
                      onClick={() => handleTogglePerm(perm.key)}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/40 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedPerms.includes(perm.key)}
                          onCheckedChange={() => handleTogglePerm(perm.key)}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">{perm.name}</span>
                          <span className="text-[10px] text-muted-foreground">{perm.key}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {perm.module}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
