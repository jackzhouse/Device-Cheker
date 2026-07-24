import AppUser, { IAppUser } from '@/models/AppUser';
import Employee from '@/models/Employee';
import { AuthUser } from './types';
import { ExternalProfile } from './external';
import { getAuthConfig } from './config';
import { permissionsForRole } from './permissions';

export interface AppUserSyncResult {
  user: AuthUser;
  status: 'created' | 'updated' | 'skipped';
}

export interface AppUsersSyncSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

function toAuthUser(appUser: IAppUser): AuthUser {
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

async function getSyncRuntimeConfig() {
  const { defaultRole, requiredAccessScope } = await getAuthConfig();
  return { defaultRole, requiredAccessScope };
}

function getSyncFields(profile: ExternalProfile) {
  return {
    externalUserId: profile.external_user_id,
    attendanceUserId: profile.attendance_user_id,
    employeeNo: profile.employee_no,
    name: profile.name || profile.employee_no || 'Unknown User',
    email: profile.email,
    departmentName: profile.department_name,
    jobTitle: profile.job_title,
    isActive: profile.is_active,
  };
}

function hasChanges(appUser: IAppUser, fields: ReturnType<typeof getSyncFields>, employeeId?: unknown) {
  return appUser.externalUserId !== fields.externalUserId
    || String(appUser.employeeId || '') !== String(employeeId || '')
    || appUser.employeeNo !== fields.employeeNo
    || appUser.attendanceUserId !== fields.attendanceUserId
    || appUser.name !== fields.name
    || appUser.email !== fields.email
    || appUser.departmentName !== fields.departmentName
    || appUser.jobTitle !== fields.jobTitle
    || appUser.isActive !== fields.isActive;
}

async function findExistingEmployeeForProfile(profile: ExternalProfile) {
  const fields = getSyncFields(profile);
  let employee = fields.employeeNo
    ? await Employee.findOne({ employeeId: String(fields.employeeNo).toUpperCase() })
    : null;

  if (!employee && fields.externalUserId) {
    employee = await Employee.findOne({ externalUserId: fields.externalUserId });
  }

  return employee;
}

export async function syncAppUserFromAttendanceUser(profile: ExternalProfile): Promise<AppUserSyncResult> {
  const fields = getSyncFields(profile);
  if (!fields.externalUserId) {
    throw new Error(`Attendance user ${fields.employeeNo || fields.name} tidak punya accountId`);
  }

  const employee = await findExistingEmployeeForProfile(profile);
  const { defaultRole, requiredAccessScope } = await getSyncRuntimeConfig();
  let appUser = await AppUser.findOne({ externalUserId: fields.externalUserId });

  if (!appUser) {
    appUser = await AppUser.create({
      ...fields,
      employeeId: employee?._id,
      attendanceUserId: fields.attendanceUserId,
      role: defaultRole,
      accessScopes: [requiredAccessScope],
      lastSyncedAt: new Date(),
    });
    return { user: toAuthUser(appUser), status: 'created' };
  }

  if (!hasChanges(appUser, fields, employee?._id)) {
    return { user: toAuthUser(appUser), status: 'skipped' };
  }

  appUser.externalUserId = fields.externalUserId;
  appUser.employeeId = employee?._id;
  appUser.attendanceUserId = fields.attendanceUserId;
  appUser.employeeNo = fields.employeeNo;
  appUser.name = fields.name;
  appUser.email = fields.email;
  appUser.departmentName = fields.departmentName;
  appUser.jobTitle = fields.jobTitle;
  appUser.isActive = fields.isActive;
  appUser.lastSyncedAt = new Date();
  await appUser.save();

  return { user: toAuthUser(appUser), status: 'updated' };
}

export async function syncAppUsersFromAttendanceUsers(profiles: ExternalProfile[]): Promise<AppUsersSyncSummary> {
  const summary: AppUsersSyncSummary = { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };

  for (const profile of profiles) {
    try {
      const result = await syncAppUserFromAttendanceUser(profile);
      summary[result.status] += 1;
    } catch (error: unknown) {
      summary.failed += 1;
      summary.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    }
  }

  return summary;
}
