import React, { useState } from 'react';
import { Sun, Moon, Laptop, Bell, Globe, Check } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
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
  const [timezone, setTimezone] = useState('UTC');
  const [savedMsg, setSavedMsg] = useState(false);

  const colors = [
    { name: 'Linear Purple', value: 'indigo', bg: 'bg-[#8B7CF6]' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-500' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-500' },
    { name: 'Violet', value: 'violet', bg: 'bg-purple-500' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-500' },
  ];

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
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
                  <SelectTrigger className="h-8 text-xs font-mono dark:bg-[#1C1C1F]/60 border-border/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs font-mono">
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
