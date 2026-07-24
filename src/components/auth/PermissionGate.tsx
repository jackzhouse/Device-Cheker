'use client';

import { useAuth } from './AuthProvider';
import { hasPermission } from '@/lib/auth/permissions';
import type { Permission } from '@/lib/auth/types';

export default function PermissionGate({ permission, children, fallback = null }: { permission: Permission; children: React.ReactNode; fallback?: React.ReactNode; }) {
  const { user } = useAuth();
  if (!user) return fallback;
  return hasPermission(user.permissions, permission) ? <>{children}</> : <>{fallback}</>;
}
