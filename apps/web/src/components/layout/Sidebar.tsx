import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Clock,
  Layers,
  Users,
  Shield,
  Settings,
  Paintbrush,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Hexagon,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  permission?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { sidebarCollapsed, toggleSidebar, setMobileMenuOpen } = useThemeStore();
  const { currentOrganization, role } = useAuthStore();
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      label: 'Core',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Records & Items', href: '/records', icon: Layers },
        { title: 'Notifications', href: '/notifications', icon: Bell },
        { title: 'Activity', href: '/activity', icon: Clock },
      ],
    },
    {
      label: 'Workspace',
      items: [
        { title: 'Team Members', href: '/settings/team', icon: Users },
        { title: 'Roles & Permissions', href: '/settings/roles', icon: Shield },
      ],
    },
    {
      label: 'Settings',
      items: [
        { title: 'General', href: '/settings/general', icon: Settings },
        { title: 'Appearance', href: '/settings/appearance', icon: Paintbrush },
        { title: 'Preferences', href: '/preferences', icon: Sliders },
      ],
    },
  ];

  const collapsed = !isMobile && sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          'relative flex flex-col border-r border-border bg-card/60 backdrop-blur-md transition-all duration-300 z-30 select-none h-screen',
          isMobile
            ? 'w-72 fixed inset-y-0 left-0 shadow-2xl bg-card'
            : collapsed
              ? 'w-16'
              : 'w-64',
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-sm">
              <Hexagon className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden text-left">
                <span className="text-sm font-semibold tracking-tight text-foreground truncate">
                  Brightloop
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {currentOrganization?.name || 'Workspace'}
                </span>
              </div>
            )}
          </div>

          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
                  {group.label}
                </h4>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/dashboard'
                      ? location.pathname === '/dashboard'
                      : location.pathname.startsWith(item.href);

                  const linkContent = (
                    <NavLink
                      to={item.href}
                      onClick={() => isMobile && setMobileMenuOpen(false)}
                      className={cn(
                        'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        collapsed && 'justify-center px-2',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground',
                          !collapsed && 'mr-3',
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1">{item.title}</span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </NavLink>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Role Indicator */}
        <div className="border-t border-border/60 p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground',
              collapsed && 'justify-center p-1.5',
            )}
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-medium text-foreground">Role: {role || 'Viewer'}</span>
                <span className="text-[10px] text-muted-foreground">Tenant Isolated</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
