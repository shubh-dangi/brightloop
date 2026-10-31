import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';
type Density = 'compact' | 'comfortable';

interface ThemeState {
  theme: Theme;
  accentColor: string;
  density: Density;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;

  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('brightloop-theme') : null) as Theme | null;
  const initialTheme: Theme = savedTheme || 'dark';

  return {
    theme: initialTheme,
    accentColor: (typeof window !== 'undefined' ? localStorage.getItem('brightloop-accent') : null) || 'indigo',
    density: (typeof window !== 'undefined' ? (localStorage.getItem('brightloop-density') as Density) : null) || 'comfortable',
    sidebarCollapsed: false,
    mobileMenuOpen: false,

    setTheme: (theme: Theme) => {
      localStorage.setItem('brightloop-theme', theme);
      set({ theme });

      const root = document.documentElement;
      if (
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    },

    setAccentColor: (color: string) => {
      localStorage.setItem('brightloop-accent', color);
      set({ accentColor: color });
    },

    setDensity: (density: Density) => {
      localStorage.setItem('brightloop-density', density);
      set({ density });
    },

    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),
    setMobileMenuOpen: (open: boolean) => set({ mobileMenuOpen: open }),
  };
});
