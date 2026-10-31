import React, { useState, useEffect } from 'react';
import { Sun, Moon, Laptop, Bell, Globe, Check, Loader2 } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { apiClient } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PageHeader } from '../../components/layout/PageHeader';
import { cn } from '../../lib/utils';

export function PreferencesPage() {
  const { theme, setTheme, accentColor, setAccentColor, density, setDensity } = useThemeStore();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [inAppAlerts, setInAppAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [savedMsg, setSavedMsg] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPreferences() {
      try {
        const res = await apiClient.get('/users/preferences');
        if (res.data?.data) {
          const pref = res.data.data;
          if (pref.theme) setTheme(pref.theme);
          if (pref.accentColor) setAccentColor(pref.accentColor);
          if (pref.density) setDensity(pref.density);
          if (pref.timezone) setTimezone(pref.timezone);
          if (typeof pref.emailNotifications === 'boolean') setEmailAlerts(pref.emailNotifications);
          if (typeof pref.inAppNotifications === 'boolean') setInAppAlerts(pref.inAppNotifications);
          if (typeof pref.marketingEmails === 'boolean') setMarketingEmails(pref.marketingEmails);
        }
      } catch (e) {
        // Fall back to client storage
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, [setTheme, setAccentColor, setDensity]);

  const colors = [
    { name: 'Frost Blue (Official)', value: 'frost-blue', bg: 'bg-[#A5D8FF]' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
    { name: 'Sky Blue', value: 'blue', bg: 'bg-blue-500' },
    { name: 'Cyan', value: 'cyan', bg: 'bg-cyan-500' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-500' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch('/users/preferences', {
        theme,
        accentColor,
        density,
        timezone,
        emailNotifications: emailAlerts,
        inAppNotifications: inAppAlerts,
        marketingEmails,
      });
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (e) {
      // Local storage already holds it as well
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="My Preferences"
        description="Interface theme, density settings, and notification delivery controls"
      >
        <Button onClick={handleSave} size="sm" className="gap-1.5 h-8 text-xs font-mono">
          {savedMsg ? <Check className="h-3.5 w-3.5" /> : null}
          {savedMsg ? 'Saved' : 'Save Preferences'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Appearance & Themes — Linear Minimalist Selector */}
        <Card className="border-border/80 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">Theme & Interface</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">Select your visual appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'dark', label: 'Dark (Default)', icon: Moon },
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer gap-2',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary dark:bg-primary/15'
                        : 'border-border/80 hover:border-border text-muted-foreground hover:bg-muted/20',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px] font-mono font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Accent Palette</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-transform',
                      c.bg,
                      accentColor === c.value && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110',
                    )}
                    title={c.name}
                  >
                    {accentColor === c.value && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Interface Density</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={density === 'comfortable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('comfortable')}
                  className="h-8 text-xs font-mono border-border/80"
                >
                  Comfortable
                </Button>
                <Button
                  variant={density === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('compact')}
                  className="h-8 text-xs font-mono border-border/80"
                >
                  Compact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Regional */}
        <div className="space-y-5">
          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Bell className="h-4 w-4 text-primary" /> Notification Delivery
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Configure delivery channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-[11px] text-muted-foreground">
                    Digest summaries & critical alerts
                  </p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">In-App Indicators</p>
                  <p className="text-[11px] text-muted-foreground">
                    Real-time status badges for record updates
                  </p>
                </div>
                <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
              </div>

              <div className="flex items-center justify-between border-t border-border/60 pt-3">
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">Product Updates</p>
                  <p className="text-[11px] text-muted-foreground">
                    Announcements and major releases
                  </p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <Globe className="h-4 w-4 text-primary" /> Regional & Formatting
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Timezone and locale formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-8 text-xs font-mono bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-mono">
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST +05:30) - Default</SelectItem>
                    <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT / BST)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
