export type AppRole = 'admin' | 'pic' | 'viewer';

export type Permission =
  | 'dashboard.view'
  | 'checks.view'
  | 'checks.create'
  | 'checks.edit'
  | 'checks.delete'
  | 'reports.view'
  | 'employees.view'
  | 'employees.manage'
  | 'users.manage'
  | 'docs.view';

export interface AuthUser {
  id: string;
  external_user_id: string;
  employee_id?: string;
  employee_no?: string;
  name: string;
  email?: string;
  department_name?: string;
  job_title?: string;
  is_active: boolean;
  role: AppRole;
  access_scopes: string[];
  permissions: Permission[];
  exp: number;
}

/** Server-only session shape. Never return external credential to browser. */
export interface SessionUser extends AuthUser {
  external_credential_token?: string;
}

export interface LoginResponse {
  user: AuthUser;
  expires_at: string;
}

export interface LoginSummary {
  totalDevices: number;
  totalEmployees: number;
  needsService: number;
  urgentRepair: number;
  lastCheckCoverage: number;
}
