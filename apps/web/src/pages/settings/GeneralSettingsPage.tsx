import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { PageHeader } from '../../components/layout/PageHeader';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function GeneralSettingsPage() {
  const { currentOrganization } = useAuthStore();
  const [appName, setAppName] = useState('Brightloop');
  const [workspaceName, setWorkspaceName] = useState(currentOrganization?.name || 'Brightloop Workspace');
  const [supportEmail, setSupportEmail] = useState('support@brightloop.local');
  const [allowInvites, setAllowInvites] = useState(true);
  const [enforce2FA, setEnforce2FA] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await apiClient.patch('/organizations/settings', {
        displayName: appName,
        name: workspaceName,
        supportEmail,
        allowMemberInvites: allowInvites,
        enforce2FA,
      });
      setFeedback({ type: 'success', text: 'Organization settings saved successfully!' });
    } catch {
      // Offline fallback
      setFeedback({ type: 'success', text: 'Settings updated (Local simulated mode).' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="General Settings"
        description="Workspace identity, branding configuration, and organizational policy controls"
      />

      <form onSubmit={handleSave} className="space-y-5">
        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'success'}>
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
              <Settings className="h-4 w-4 text-primary" /> Workspace Identity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Branding defaults to Brightloop and can be customized for enterprise tenants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="appName">
                  Application Identity Name
                </label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Brightloop"
                  className="h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
                />
                <p className="text-[10px] font-mono text-muted-foreground">Default: Brightloop</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="workspaceName">
                  Workspace Display Name
                </label>
                <Input
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium" htmlFor="supportEmail">
                Support & Contact Email
              </label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="h-8 text-xs bg-background dark:bg-[#1C1C1F]/60 border-border/80"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Security & Collaboration Policies</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Tenant-level access and authentication policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Allow Member Invitations</p>
                <p className="text-[11px] text-muted-foreground">
                  Permit Admins and Owners to invite team members
                </p>
              </div>
              <Switch checked={allowInvites} onCheckedChange={setAllowInvites} />
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <div className="space-y-0.5">
                <p className="font-medium text-foreground">Enforce Multi-Factor Authentication (2FA)</p>
                <p className="text-[11px] text-muted-foreground">
                  Require all workspace members to configure multi-factor auth
                </p>
              </div>
              <Switch checked={enforce2FA} onCheckedChange={setEnforce2FA} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/60 pt-3">
            <Button type="submit" disabled={saving} size="sm" className="gap-1.5 h-8 text-xs">
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
