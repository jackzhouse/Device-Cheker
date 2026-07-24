import AppUser from '@/models/AppUser';
import { getAuthConfig } from './config';
import { ExternalProfile } from './external';
import { syncAppUserFromAttendanceUser } from './user-sync';
import { permissionsForRole } from './permissions';
import { AuthUser } from './types';

function validateAuthUser(user: AuthUser, requiredAccessScope: string) {
  if (!user.is_active) {
    throw new Error('User aplikasi tidak aktif');
  }
  if (!(user.access_scopes || []).includes(requiredAccessScope)) {
    throw new Error('User tidak punya akses devicechecking');
  }
  return user;
}

export async function syncAppUser(profile: ExternalProfile) {
  const { requiredAccessScope } = await getAuthConfig();
  const existing = await AppUser.findOne({ externalUserId: profile.external_user_id });

  if (!existing) {
    const result = await syncAppUserFromAttendanceUser(profile);
    return validateAuthUser(result.user, requiredAccessScope);
  }

  const appUser = existing;
  if (!appUser.isActive) {
    throw new Error('User aplikasi tidak aktif');
  }
  if (!(appUser.accessScopes || []).includes(requiredAccessScope)) {
    throw new Error('User tidak punya akses devicechecking');
  }

  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 8);
  return {
    id: appUser._id.toString(),
    external_user_id: appUser.externalUserId,
    employee_id: appUser.employeeId?.toString(),
    employee_no: appUser.employeeNo,
    name: appUser.name,
    email: appUser.email,
    department_name: appUser.departmentName,
    job_title: appUser.jobTitle,
    is_active: appUser.isActive,
    role: appUser.role,
    access_scopes: appUser.accessScopes || [],
    permissions: permissionsForRole(appUser.role),
    exp,
  };
}
