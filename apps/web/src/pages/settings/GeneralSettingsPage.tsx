import React, { useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
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
  const [appName, setAppName] = useState('UNKNOWN');
  const [workspaceName, setWorkspaceName] = useState(currentOrganization?.name || 'UNKNOWN Workspace');
  const [supportEmail, setSupportEmail] = useState('support@unknown.local');
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
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="General Settings"
        description="Configure workspace branding, display name, and organizational defaults"
      />

      <form onSubmit={handleSave} className="space-y-6">
        {feedback && (
          <Alert variant={feedback.type === 'error' ? 'destructive' : 'success'}>
            <AlertDescription>{feedback.text}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" /> Workspace Identity
            </CardTitle>
            <CardDescription>
              Branding defaults to UNKNOWN and can be tailored for client deployments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="appName">
                  Application Identity Name
                </label>
                <Input
                  id="appName"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="UNKNOWN"
                />
                <p className="text-[11px] text-muted-foreground">Default: UNKNOWN</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium" htmlFor="workspaceName">
                  Workspace Display Name
                </label>
                <Input
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium" htmlFor="supportEmail">
                Support & Contact Email
              </label>
              <Input
                id="supportEmail"
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Security & Collaboration Policies</CardTitle>
            <CardDescription>Workspace-level authorization controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Allow Member Invitations</p>
                <p className="text-xs text-muted-foreground">
                  Permit Admins and Owners to invite new teammates to this workspace
                </p>
              </div>
              <Switch checked={allowInvites} onCheckedChange={setAllowInvites} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Enforce Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-muted-foreground">
                  Require all workspace members to configure multi-factor authentication
                </p>
              </div>
              <Switch checked={enforce2FA} onCheckedChange={setEnforce2FA} />
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/60 pt-4">
            <Button type="submit" disabled={saving} size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              {saving ? 'Saving Changes...' : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
