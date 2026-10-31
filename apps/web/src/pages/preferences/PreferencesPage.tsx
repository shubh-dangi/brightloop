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
    { name: 'Indigo', value: 'indigo', bg: 'bg-indigo-600' },
    { name: 'Emerald', value: 'emerald', bg: 'bg-emerald-600' },
    { name: 'Blue', value: 'blue', bg: 'bg-blue-600' },
    { name: 'Violet', value: 'violet', bg: 'bg-violet-600' },
    { name: 'Amber', value: 'amber', bg: 'bg-amber-600' },
  ];

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="My Preferences"
        description="Customize your interface appearance, density, and notification channels"
      >
        <Button onClick={handleSave} size="sm" className="gap-1.5">
          {savedMsg ? <Check className="h-4 w-4" /> : null}
          {savedMsg ? 'Preferences Saved' : 'Save Preferences'}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appearance & Themes */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Theme Mode</CardTitle>
            <CardDescription>Select your preferred color theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={cn(
                      'flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all cursor-pointer gap-2',
                      isSelected
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border/60 hover:border-border text-muted-foreground',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium">Accent Color</label>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccentColor(c.value)}
                    className={cn(
                      'h-7 w-7 rounded-full flex items-center justify-center cursor-pointer transition-transform',
                      c.bg,
                      accentColor === c.value && 'ring-2 ring-primary ring-offset-2 scale-110',
                    )}
                    title={c.name}
                  >
                    {accentColor === c.value && (
                      <Check className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium">Interface Density</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={density === 'comfortable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('comfortable')}
                >
                  Comfortable
                </Button>
                <Button
                  variant={density === 'compact' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDensity('compact')}
                >
                  Compact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications & Regional */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notification Alerts
              </CardTitle>
              <CardDescription>Configure which updates you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Receive summary digests and critical security updates
                  </p>
                </div>
                <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Display bell indicators for record assignments & mentions
                  </p>
                </div>
                <Switch checked={inAppAlerts} onCheckedChange={setInAppAlerts} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Product Announcements</p>
                  <p className="text-xs text-muted-foreground">
                    Periodic feature announcements & starter kit updates
                  </p>
                </div>
                <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" /> Regional & Localization
              </CardTitle>
              <CardDescription>Timezone and locale formatting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Timezone</label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
