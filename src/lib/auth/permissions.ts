import { AppRole, Permission } from './types';

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  admin: [
    'dashboard.view','checks.view','checks.create','checks.edit','checks.delete',
    'reports.view','employees.view','employees.manage','users.manage','docs.view'
  ],
  pic: [
    'dashboard.view','checks.view','checks.create','checks.edit',
    'reports.view','employees.view','docs.view'
  ],
  viewer: [
    'dashboard.view','checks.view','reports.view','employees.view','docs.view'
  ],
};

export function permissionsForRole(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.viewer;
}

export function hasPermission(permissions: Permission[], permission: Permission) {
  return permissions.includes(permission);
}
