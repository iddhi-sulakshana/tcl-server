import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import Logo from './Logo';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/Auth.store';

export default function Common() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { token } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  return (
    <div className='bg-gradient-to-br from-background via-background to-accent/50'>
      <nav className='bg-background/80 backdrop-blur-md border-b border-border'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Logo />

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center space-x-4'>
              <Button variant='ghost' className='text-foreground hover:text-primary'>
                Features
              </Button>
              <Button variant='ghost' className='text-foreground hover:text-primary'>
                Pricing
              </Button>
              <Button variant='ghost' className='text-foreground hover:text-primary'>
                About
              </Button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className='hidden md:flex items-center space-x-3'>
              {token ? (
                <Button
                  onClick={() => {
                    navigate('/dashboard');
                  }}
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant='ghost'
                    onClick={() => {
                      navigate('/sign-in');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => {
                      navigate('/sign-in');
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )}
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            <div className='md:hidden flex items-center space-x-2'>
              <ThemeToggle />
              <Button variant='ghost' size='icon' onClick={toggleMenu} aria-label='Toggle menu'>
                {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className='md:hidden border-t border-border bg-background/95 backdrop-blur-md'>
              <div className='px-2 pt-2 pb-3 space-y-1'>
                <Button variant='ghost' className='w-full justify-start'>
                  Features
                </Button>
                <Button variant='ghost' className='w-full justify-start'>
                  Pricing
                </Button>
                <Button variant='ghost' className='w-full justify-start'>
                  About
                </Button>
                <div className='pt-2 border-t border-border space-y-2'>
                  <Button variant='ghost' className='w-full justify-start'>
                    Sign In
                  </Button>
                  <Button className='w-full'>Sign Up</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
