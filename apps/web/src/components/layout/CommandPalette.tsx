import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bell,
  Clock,
  Layers,
  Users,
  Shield,
  Settings,
  Paintbrush,
  User,
  Sliders,
  LogOut,
} from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../ui/command';
import { useAuthStore } from '../../stores/authStore';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search pages..." />
      <CommandList>
        <CommandEmpty>No matching results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => handleSelect('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/records')}>
            <Layers className="mr-2 h-4 w-4" />
            <span>Records & Items</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/activity')}>
            <Clock className="mr-2 h-4 w-4" />
            <span>Activity Timeline</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Workspace & Settings">
          <CommandItem onSelect={() => handleSelect('/settings/team')}>
            <Users className="mr-2 h-4 w-4" />
            <span>Team Members</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/settings/roles')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Roles & Permissions</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/settings/general')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>General Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/settings/appearance')}>
            <Paintbrush className="mr-2 h-4 w-4" />
            <span>Appearance & Themes</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="User Account">
          <CommandItem onSelect={() => handleSelect('/profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('/preferences')}>
            <Sliders className="mr-2 h-4 w-4" />
            <span>My Preferences</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="mr-2 h-4 w-4 text-destructive" />
            <span className="text-destructive">Log Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
