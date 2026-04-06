import { useAuthStore } from '@/stores/Auth.store';
import type { UserRole } from '@/types/user.types';
import { Navigate } from 'react-router';
import NotAuthorized from './NotAuthorized';

interface PermissionRouteProps {
  roles: UserRole[];
  children: React.ReactNode;
}

export default function PermissionRoute({ roles, children }: PermissionRouteProps) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to='/sign-in' replace />;
  }

  if (!roles.includes(user.role)) {
    return <NotAuthorized />;
  }

  return children;
}
