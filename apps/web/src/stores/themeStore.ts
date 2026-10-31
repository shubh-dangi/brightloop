import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable';

interface ThemeState {
  theme: Theme;
  accentColor: string;
  density: Density;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  setTheme: (theme: Theme) => void;
  cycleTheme: () => void;
  getResolvedTheme: () => 'light' | 'dark';
  setAccentColor: (color: string) => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('brightloop-theme') : null) as Theme | null;
  const initialTheme: Theme = savedTheme || 'dark';

  const applyClass = (targetTheme: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isDark =
      targetTheme === 'dark' ||
      (targetTheme === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  return {
    theme: initialTheme,
    accentColor: (typeof window !== 'undefined' ? localStorage.getItem('brightloop-accent') : null) || 'frost-blue',
    density: (typeof window !== 'undefined' ? (localStorage.getItem('brightloop-density') as Density) : null) || 'comfortable',
    sidebarCollapsed: false,
    mobileMenuOpen: false,

    setTheme: (theme: Theme) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('brightloop-theme', theme);
      }
      set({ theme });
      applyClass(theme);
    },

    cycleTheme: () => {
      const current = get().theme;
      const order: Theme[] = ['dark', 'light', 'system'];
      const nextIndex = (order.indexOf(current) + 1) % order.length;
      get().setTheme(order[nextIndex]);
    },

    getResolvedTheme: () => {
      const current = get().theme;
      if (current === 'light') return 'light';
      if (current === 'dark') return 'dark';
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    },

    setAccentColor: (color: string) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('brightloop-accent', color);
      }
      set({ accentColor: color });
    },

    setDensity: (density: Density) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('brightloop-density', density);
      }
      set({ density });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
    setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
  };
});
