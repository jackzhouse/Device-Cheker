import Employee, { IEmployee } from '@/models/Employee';
import { ExternalProfile } from './external';

export interface EmployeeSyncSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() || name || 'Unknown';
  const lastName = parts.join(' ');
  return { firstName, lastName };
}

function getEmployeeFields(profile: ExternalProfile) {
  const employeeId = profile.employee_no || profile.external_user_id;
  const name = profile.name || employeeId || 'Unknown User';
  const { firstName, lastName } = splitName(name);

  return {
    employeeId: employeeId ? String(employeeId).toUpperCase() : '',
    externalUserId: profile.external_user_id || undefined,
    firstName,
    lastName,
    fullName: name,
    email: profile.email,
    department: profile.department_name,
    position: profile.job_title || '-',
    status: profile.is_active ? 'Active' as const : 'Inactive' as const,
  };
}

function hasEmployeeChanges(employee: IEmployee, fields: ReturnType<typeof getEmployeeFields>) {
  return employee.externalUserId !== fields.externalUserId
    || employee.firstName !== fields.firstName
    || employee.lastName !== fields.lastName
    || employee.fullName !== fields.fullName
    || employee.email !== fields.email
    || employee.department !== fields.department
    || employee.position !== fields.position
    || employee.status !== fields.status;
}

async function upsertEmployeeFromAttendanceUser(profile: ExternalProfile) {
  const fields = getEmployeeFields(profile);
  if (!fields.employeeId) {
    throw new Error(`Attendance employee ${profile.name || '-'} tidak punya NIK/accountId`);
  }

  let employee = await Employee.findOne({ employeeId: fields.employeeId });
  if (!employee && fields.externalUserId) {
    employee = await Employee.findOne({ externalUserId: fields.externalUserId });
  }

  if (!employee) {
    await Employee.create(fields);
    return 'created' as const;
  }

  if (!hasEmployeeChanges(employee, fields)) {
    return 'skipped' as const;
  }

  employee.employeeId = fields.employeeId;
  employee.externalUserId = fields.externalUserId;
  employee.firstName = fields.firstName;
  employee.lastName = fields.lastName;
  employee.fullName = fields.fullName;
  employee.email = fields.email;
  employee.department = fields.department;
  employee.position = fields.position;
  employee.status = fields.status;
  await employee.save();
  return 'updated' as const;
}

export async function syncEmployeesFromAttendanceUsers(profiles: ExternalProfile[]): Promise<EmployeeSyncSummary> {
  const summary: EmployeeSyncSummary = { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };

  for (const profile of profiles) {
    try {
      const status = await upsertEmployeeFromAttendanceUser(profile);
      summary[status] += 1;
    } catch (error: unknown) {
      summary.failed += 1;
      summary.errors.push(error instanceof Error ? error.message : 'Unknown employee sync error');
    }
  }

  return summary;
}
