import React from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useThemeStore, Theme } from '../../stores/themeStore';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

export interface ThemeSwitcherProps {
  variant?: 'dropdown' | 'segmented' | 'toggle';
  size?: 'sm' | 'default' | 'icon';
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export function ThemeSwitcher({
  variant = 'dropdown',
  size = 'icon',
  className,
  align = 'end',
}: ThemeSwitcherProps) {
  const { theme, setTheme, cycleTheme, getResolvedTheme } = useThemeStore();
  const resolved = getResolvedTheme();

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

  if (variant === 'toggle') {
    return (
      <Button
        type="button"
        variant="ghost"
        size={size === 'icon' ? 'icon' : 'sm'}
        onClick={cycleTheme}
        className={cn(
          'h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer',
          className,
        )}
        title={`Current theme: ${theme} (Click to cycle)`}
        aria-label={`Toggle theme (currently ${theme})`}
      >
        {resolved === 'dark' ? (
          <Moon className="h-4 w-4 text-primary transition-transform" />
        ) : (
          <Sun className="h-4 w-4 text-primary transition-transform" />
        )}
      </Button>
    );
  }

  // Default: Dropdown Menu with Light, Dark, System
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={size === 'icon' ? 'icon' : 'sm'}
          className={cn(
            'h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer transition-colors',
            className,
          )}
          title={`Appearance: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          aria-label={`Select visual theme (currently ${theme})`}
        >
          {theme === 'system' ? (
            <Laptop className="h-4 w-4 text-primary" />
          ) : resolved === 'dark' ? (
            <Moon className="h-4 w-4 text-primary" />
          ) : (
            <Sun className="h-4 w-4 text-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-40 text-xs shadow-lg border-border/80 bg-card">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between cursor-pointer py-1.5 px-2.5"
        >
          <div className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-primary" />
            <span>Light</span>
          </div>
          {theme === 'light' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between cursor-pointer py-1.5 px-2.5"
        >
          <div className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-primary" />
            <span>Dark</span>
          </div>
          {theme === 'dark' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center justify-between cursor-pointer py-1.5 px-2.5"
        >
          <div className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-primary" />
            <span>System</span>
          </div>
          {theme === 'system' && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
