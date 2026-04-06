import { Moon, Sun } from 'lucide-react';
import { Button } from './button';
import { useThemeStore } from '@/stores/Theme.store';

export function ThemeToggle() {
  const { dark, toggleTheme } = useThemeStore();

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={toggleTheme}
      className='h-9 w-9'
      aria-label='Toggle theme'
    >
      {dark ? (
        <Sun className='h-4 w-4 transition-all' />
      ) : (
        <Moon className='h-4 w-4 transition-all' />
      )}
    </Button>
  );
}
