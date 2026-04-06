import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
  dark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      dark: true,
      toggleTheme: () =>
        set((state) => {
          // Toggle the theme and update localStorage
          const newDarkState = !state.dark;
          document.documentElement.classList.toggle('dark', newDarkState);
          document.documentElement.setAttribute('data-theme', newDarkState ? 'dark' : 'light');
          document.documentElement.setAttribute(
            'data-ag-theme-mode',
            newDarkState ? 'dark-blue' : 'light',
          );
          return { dark: newDarkState };
        }),
      setTheme: (isDark) => set({ dark: isDark }),
    }),
    {
      name: 'theme',
    },
  ),
);
