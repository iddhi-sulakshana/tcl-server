import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/Auth.store';
import type { UserRole } from '@/types/user.types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

function Signin() {
  const { login, token } = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!token) return;
    navigate('/dashboard');
  }, [token, login]);

  const loginFn = (role: UserRole) => {
    login('asd', {
      email: 'jhon@asd.lk',
      id: '123',
      name: 'Jhone Doe',
      role,
    });
  };
  return (
    <div className='h-full w-full flex justify-center items-center gap-5'>
      <Button onClick={() => loginFn('admin')}>Sign in as Admin</Button>
      <Button onClick={() => loginFn('user')}>Sign in as User</Button>
    </div>
  );
}

export default Signin;
