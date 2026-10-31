import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useThemeStore, Theme } from '../../stores/themeStore';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface ThemeSwitcherProps {
  variant?: 'toggle' | 'segmented';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function ThemeSwitcher({
  variant = 'toggle',
  size = 'icon',
  className,
}: ThemeSwitcherProps) {
  const { theme, setTheme, getResolvedTheme } = useThemeStore();
  const resolved = getResolvedTheme();
  const isDark = resolved === 'dark';

  // Instant 1-click toggle between Light and Dark mode (no dropdown)
  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  if (variant === 'segmented') {
    const options: { id: Theme; label: string; icon: React.ElementType }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="Theme selection"
        className={cn(
          'inline-flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 text-xs select-none',
          className,
        )}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${opt.label} theme`}
              onClick={() => setTheme(opt.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer',
                isActive
                  ? 'bg-card text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
              )}
            >
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 1-Click Direct Theme Toggle (No Dropdown)
  return (
    <Button
      type="button"
      variant="ghost"
      size={size === 'icon' ? 'icon' : 'sm'}
      onClick={handleToggle}
      className={cn(
        'relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer rounded-md',
        className,
      )}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-primary transition-all duration-200 rotate-0 scale-100 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-primary transition-all duration-200 rotate-0 scale-100 hover:-rotate-12" />
      )}
    </Button>
  );
}
