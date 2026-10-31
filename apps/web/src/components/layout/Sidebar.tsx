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
    {
      label: 'Preferences',
      items: [
        { title: 'Appearance & Theme', href: '/settings/appearance', icon: Paintbrush },
        { title: 'User Preferences', href: '/preferences', icon: Sliders },
      ],
    },
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
    {
      label: 'Account',
      items: [
        { title: 'My Profile', href: '/profile', icon: UserCircle },
        { title: 'Appearance', href: '/settings/appearance', icon: Paintbrush },
        { title: 'Preferences', href: '/preferences', icon: Sliders },
      ],
    },
  ];

  const navGroups = isCustomer ? customerNavGroups : staffNavGroups;
  const collapsed = !isMobile && sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={80}>
      <aside
        className={cn(
          'relative flex flex-col border-r border-border bg-[#FFFFFF] dark:bg-[#171719] text-foreground transition-all duration-200 z-30 select-none h-screen',
          isMobile
            ? 'w-64 fixed inset-y-0 left-0 shadow-2xl bg-[#FFFFFF] dark:bg-[#171719]'
            : collapsed
              ? 'w-[60px]'
              : 'w-60',
        )}
      >
        {/* Workspace Brand Header */}
        <div className="flex h-14 items-center justify-between border-b border-border/80 px-3.5">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group cursor-pointer"
            onClick={() => isMobile && setMobileMenuOpen(false)}
          >
            <BrightloopLogo size="sm" iconOnly={collapsed} />
            {!collapsed && (
              <div className="flex flex-col overflow-hidden text-left leading-none">
                <span className="text-[13px] font-semibold tracking-tight text-foreground truncate">
                  Brightloop
                </span>
                <span className="text-[11px] text-muted-foreground truncate pt-0.5">
                  {isCustomer ? 'Customer Portal' : currentOrganization?.name || 'Workspace'}
                </span>
              </div>
            )}
          </Link>

          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-6 w-6 items-center justify-center rounded border border-border/80 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
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

        {/* Role Switcher for Testing (Admin / Staff / Customer) */}
        {!collapsed && (
          <div className="px-3 py-2 border-t border-border/60 bg-muted/20">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 mb-1.5 font-mono flex items-center justify-between">
              <span>View As</span>
              <span className="text-[9px] text-primary font-bold">RBAC</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={cn(
                  'px-1.5 py-1 text-[10px] font-medium rounded transition-colors text-center cursor-pointer',
                  role === 'ADMIN' || role === 'OWNER'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                )}
                title="Full Admin privileges"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole('MEMBER')}
                className={cn(
                  'px-1.5 py-1 text-[10px] font-medium rounded transition-colors text-center cursor-pointer',
                  role === 'MEMBER'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                )}
                title="Internal Staff (Cost prices hidden)"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={cn(
                  'px-1.5 py-1 text-[10px] font-medium rounded transition-colors text-center cursor-pointer',
                  role === 'CUSTOMER'
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-background hover:bg-muted text-muted-foreground'
                )}
                title="Customer Portal Self-Service"
              >
                Customer
              </button>
            </div>
          </div>
        )}

        {/* Bottom User & Role Indicator */}
        <div className="border-t border-border/80 p-2.5 bg-background/30">
          <Link
            to="/profile"
            className={cn(
              'flex items-center gap-2.5 rounded-md p-1.5 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer',
              collapsed && 'justify-center p-1',
            )}
          >
            <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate flex-1 leading-none">
                <span className="font-semibold text-foreground truncate text-xs">
                  {user?.name || (isCustomer ? 'Customer User' : 'Staff User')}
                </span>
                <span className="text-[10px] text-muted-foreground truncate pt-0.5 font-mono">
                  {role || 'MEMBER'}
                </span>
              </div>
            )}
            {!collapsed && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" title="System Connected" />
            )}
          </Link>
        </div>
      </aside>
    </TooltipProvider>
  );
}
