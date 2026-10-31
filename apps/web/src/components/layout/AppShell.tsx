import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { useThemeStore } from '../../stores/themeStore';
import { PageMotion } from '../../lib/motion';

export function AppShell() {
  const { mobileMenuOpen, setMobileMenuOpen } = useThemeStore();
  const location = useLocation();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex select-none">
      {/* Desktop Persistent Fixed Sidebar */}
      <aside className="hidden lg:flex shrink-0 h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar isMobile />
        </div>
      )}

      {/* Main Content Area: Fixed Header + Smoothly Scrollable Main */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 select-text">
          <div className="max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
            <PageMotion key={location.pathname}>
              <Outlet />
            </PageMotion>
          </div>
        </main>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />
    </div>
  );
}
