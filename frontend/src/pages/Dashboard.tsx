import ErrorDisplay from '@/components/layout/ErrorDisplay';
import ProtectedItem from '@/components/layout/ProtectedItem';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/Auth.store';
import { Navigate, NavLink, Outlet, useRouteError } from 'react-router';

export default function Dashboard() {
  const error = useRouteError();
  const { logout, token } = useAuthStore();

  if (!token) return <Navigate to='/sign-in' replace />;

  return (
    <div className='h-full'>
      <h1>Dashboard</h1>
      <Button onClick={logout}>Sign out</Button>
      <ProtectedItem roles={['admin']}>
        <NavLink to='/dashboard/admin-only'>Admin Only</NavLink>
      </ProtectedItem>
      <NavLink to='/dashboard/anyone'>Anyone</NavLink>
      <div className='bg-accent h-full w-full'>
        {error ? <ErrorDisplay error={error} /> : <Outlet />}
      </div>
    </div>
  );
}
