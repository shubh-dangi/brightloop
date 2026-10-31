import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Package,
  Layers,
  FileText,
  CreditCard,
  Receipt,
  Banknote,
  Percent,
  BarChart3,
  Clock,
  Bell,
  Users,
  Shield,
  Building2,
  Paintbrush,
  Sliders,
  ChevronLeft,
  ChevronRight,
  X,
  UserCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useThemeStore } from '../../stores/themeStore';
import { useAuthStore } from '../../stores/authStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { BrightloopLogo } from '../common/BrightloopLogo';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export function Sidebar({ isMobile = false }: { isMobile?: boolean }) {
  const { sidebarCollapsed, toggleSidebar, setMobileMenuOpen } = useThemeStore();
  const { currentOrganization, user, role, setRole } = useAuthStore();
  const location = useLocation();

  const isCustomer = role === 'CUSTOMER';
  const isAdmin = role === 'ADMIN' || role === 'OWNER';

  const staffNavGroups: NavGroup[] = [
    {
      label: 'Core Workspace',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Customers', href: '/customers', icon: UserCheck },
      ],
    },
    {
      label: 'Catalog & Plans',
      items: [
        { title: 'Products', href: '/products', icon: Package },
        { title: 'Subscription Plans', href: '/plans', icon: Layers },
      ],
    },
    {
      label: 'Sales & Subscriptions',
      items: [
        { title: 'Quotations', href: '/quotations', icon: FileText },
        { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
      ],
    },
    {
      label: 'Billing & Finance',
      items: [
        { title: 'Invoices', href: '/invoices', icon: Receipt },
        { title: 'Payments', href: '/payments', icon: Banknote },
        { title: 'Discounts', href: '/discounts', icon: Percent },
      ],
    },
    {
      label: 'Analytics & Logs',
      items: [
        { title: 'Reports', href: '/reports', icon: BarChart3 },
        { title: 'Activity Ledger', href: '/activity', icon: Clock },
        { title: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    ...(isAdmin
      ? [
          {
            label: 'Administration',
            items: [
              { title: 'Team Members', href: '/settings/team', icon: Users },
              { title: 'Roles & Access', href: '/settings/roles', icon: Shield },
              { title: 'Organization Settings', href: '/settings/general', icon: Building2 },
            ],
          },
        ]
      : []),
  ];

  const customerNavGroups: NavGroup[] = [
    {
      label: 'Customer Portal',
      items: [
        { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { title: 'Notifications', href: '/notifications', icon: Bell },
      ],
    },
    {
      label: 'My Subscriptions',
      items: [
        { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
        { title: 'Quotations', href: '/quotations', icon: FileText },
      ],
    },
    {
      label: 'Billing & Invoices',
      items: [
        { title: 'My Invoices', href: '/invoices', icon: Receipt },
        { title: 'Payment History', href: '/payments', icon: Banknote },
      ],
    },
    {
      label: 'Catalog & Plans',
      items: [
        { title: 'Browse Products', href: '/products', icon: Package },
        { title: 'Plans Available', href: '/plans', icon: Layers },
      ],
    },
  ];

  const navGroups = isCustomer ? customerNavGroups : staffNavGroups;
  const collapsed = !isMobile && sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className={cn(
          'relative flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-200 z-30 select-none h-full shrink-0',
          isMobile
            ? 'w-64 fixed inset-y-0 left-0 shadow-2xl bg-sidebar'
            : collapsed
              ? 'w-[64px]'
              : 'w-64',
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-3.5 bg-sidebar">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer min-w-0"
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            {/* High-visibility Vibrant Gradient Logo */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4" />
                <path d="m4.93 10.93 2.83 2.83" />
                <path d="M2 18h4" />
                <path d="M20 18h2" />
                <path d="m19.07 4.93-2.83 2.83" />
                <circle cx="12" cy="14" r="6" strokeWidth="2.2" />
                <path d="M12 11a3 3 0 1 0 3 3" />
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col overflow-hidden text-left min-w-0">
                <span className="text-[15px] font-extrabold tracking-tight text-foreground truncate drop-shadow-xs">
                  Brightloop
                </span>
                <span className="text-[11px] font-semibold truncate pt-0.5 font-mono">
                  {isCustomer ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Customer Portal</span>
                  ) : isAdmin ? (
                    <span className="text-purple-600 dark:text-purple-400">Admin Console</span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400">Staff Operations</span>
                  )}
                </span>
              </div>
            )}
          </Link>

          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded-md border border-border/80 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors shadow-xs"
              title={collapsed ? 'Expand sidebar (Ctrl+\\)' : 'Collapse sidebar (Ctrl+\\)'}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Group Items */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {!collapsed && (
                <h4 className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5 font-mono">
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
                        'group flex items-center rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 cursor-pointer',
                        isActive
                          ? 'bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                        collapsed && 'justify-center px-0 py-2',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                          !collapsed && 'mr-2.5',
                        )}
                      />
                      {!collapsed && (
                        <span className="truncate flex-1 tracking-tight">{item.title}</span>
                      )}
                      {!collapsed && item.badge && (
                        <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 font-mono">
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
                          <p className="text-xs">{item.title}</p>
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

        {/* Bottom User & Role Indicator */}
        <div className="shrink-0 border-t border-sidebar-border p-3 bg-muted/20">
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-2.5 rounded-lg p-1.5 text-xs text-foreground hover:bg-muted/70 transition-colors cursor-pointer',
              collapsed && 'justify-center p-1',
            )}
          >
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-xs',
                isAdmin
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                  : isCustomer
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
              )}
            >
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate flex-1 min-w-0 leading-tight">
                <span className="font-semibold text-foreground truncate text-xs">
                  {user?.name || (isCustomer ? 'Customer User' : isAdmin ? 'Admin User' : 'Staff Member')}
                </span>
                <span className="text-[10px] text-muted-foreground truncate font-mono">
                  {user?.email || ''}
                </span>
              </div>
            )}
            {!collapsed && (
              <Badge
                variant="outline"
                className={cn(
                  'ml-auto text-[9px] px-1.5 py-0 font-mono uppercase tracking-wider shrink-0 font-bold',
                  isAdmin
                    ? 'border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10'
                    : isCustomer
                    ? 'border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                    : 'border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10',
                )}
              >
                {role || 'USER'}
              </Badge>
            )}
          </Link>
        </div>
      </aside>
    </TooltipProvider>
  );
}
