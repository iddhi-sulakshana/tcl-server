import { useAuthStore } from '@/stores/Auth.store';
import type { UserRole } from '@/types/user.types';
import type { ReactNode } from 'react';

interface ProtectedItemProps {
  roles: UserRole[];
  children: ReactNode;
}

function ProtectedItem({ children, roles }: ProtectedItemProps): ReactNode | null {
  const { user } = useAuthStore();

  if (!user) return null;

  if (!roles.includes(user.role)) {
    return null;
  }
  return children;
}

export default ProtectedItem;
