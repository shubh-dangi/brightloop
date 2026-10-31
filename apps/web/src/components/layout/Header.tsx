import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  Sliders,
  Paintbrush,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ThemeSwitcher } from './ThemeSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export function Header() {
  const { setMobileMenuOpen } = useThemeStore();
  const { user, currentOrganization, role, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Generate dynamic breadcrumb
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = pathParts.map((part, index) => {
    const url = `/${pathParts.slice(0, index + 1).join('/')}`;
    const formatted = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
    return { name: formatted, url, isLast: index === pathParts.length - 1 };
  });

  const getInitials = (name?: string) => {
    if (!name) return 'BL';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-topbar-border bg-topbar/90 px-4 md:px-6 backdrop-blur-md select-none transition-colors">
      {/* Left: Mobile trigger & Linear-style Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            to="/dashboard"
            className="hover:text-foreground font-medium transition-colors flex items-center gap-1 text-muted-foreground/80"
          >
            <Building2 className="h-3 w-3" />
            <span>{currentOrganization?.name || 'Brightloop'}</span>
          </Link>
          {breadcrumbItems.map((item) => (
            <React.Fragment key={item.url}>
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
              {item.isLast ? (
                <span className="font-semibold text-foreground tracking-tight">{item.name}</span>
              ) : (
                <Link
                  to={item.url}
                  className="hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Search, Notifications, Theme Toggle, User Menu */}
      <div className="flex items-center gap-2">
        {/* Command Palette Trigger - Linear Style */}
        <button
          type="button"
          onClick={() => {
            const event = new KeyboardEvent('keydown', {
              key: 'k',
              ctrlKey: true,
              bubbles: true,
            });
            document.dispatchEvent(event);
          }}
          className="hidden md:flex items-center gap-2 rounded-md border border-border/80 bg-muted/40 hover:bg-muted/70 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-48 lg:w-56 justify-between"
          aria-label="Open search command palette"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">Search commands...</span>
          </span>
          <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Notifications Shortcut */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/notifications')}
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/70 cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        {/* Global Theme Switcher */}
        <ThemeSwitcher />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 cursor-pointer border border-border/80">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || 'User'} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs font-mono">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 text-xs">
            <DropdownMenuLabel className="font-normal py-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-semibold leading-none text-foreground">{user?.name || 'User'}</p>
                <p className="text-[11px] leading-none text-muted-foreground truncate">{user?.email || 'user@brightloop.local'}</p>
                <span className="text-[10px] font-mono text-primary font-medium pt-1">
                  Role: {role || 'MEMBER'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
              <User className="mr-2 h-3.5 w-3.5" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/appearance')} className="cursor-pointer">
              <Paintbrush className="mr-2 h-3.5 w-3.5" />
              <span>Appearance & Theme</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/preferences')} className="cursor-pointer">
              <Sliders className="mr-2 h-3.5 w-3.5" />
              <span>User Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings/general')} className="cursor-pointer">
              <Sliders className="mr-2 h-3.5 w-3.5" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
