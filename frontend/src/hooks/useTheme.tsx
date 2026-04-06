import { useEffect } from 'react';
import { useThemeStore } from '@/stores/Theme.store';

export default function useTheme() {
  const { setTheme, dark: isDark } = useThemeStore();

  useEffect(() => {
    // Apply the theme to the document
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-ag-theme-mode', 'dark-blue');
    document.documentElement.setAttribute('data-ag-theme-mode', isDark ? 'dark-blue' : 'light');
  }, [setTheme]); // Run once when the component mounts
}
