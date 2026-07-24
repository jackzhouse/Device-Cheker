export type AppUserRole = 'admin' | 'pic' | 'viewer';

export interface ManagedAppUser {
  _id: string;
  externalUserId: string;
  employeeId?: string;
  employeeNo?: string;
  name: string;
  email?: string;
  departmentName?: string;
  jobTitle?: string;
  isActive: boolean;
  role: AppUserRole;
  accessScopes: string[];
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  department?: string;
  status?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export interface UserSyncSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface UserSyncJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  page: number;
  size: number;
  totalPages?: number;
  summary: UserSyncSummary;
  error?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

type QueryValue = string | number | boolean | undefined;

function toQueryString(params: Array<[string, QueryValue]>) {
  const query = new URLSearchParams();
  params.forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  return query.toString();
}

async function parseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return payload?.error || fallback;
}

export async function getManagedUsers(
  params: ManagedUsersParams = {}
): Promise<APIResponse<ManagedAppUser[]>> {
  const queryString = toQueryString([
    ['page', params.page],
    ['limit', params.limit],
    ['search', params.search],
    ['role', params.role],
    ['department', params.department],
    ['status', params.status],
  ]);
  const response = await fetch(`/api/users-roles?${queryString}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch users'));
  }

  return response.json();
}

export async function updateManagedUserRole(
  id: string,
  role: AppUserRole
): Promise<APIResponse<ManagedAppUser>> {
  const response = await fetch(`/api/users-roles/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to update role'));
  }

  return response.json();
}

export async function updateManagedUser(
  id: string,
  patch: Partial<Pick<ManagedAppUser, 'name' | 'email' | 'departmentName' | 'jobTitle' | 'isActive' | 'role' | 'accessScopes'>>
): Promise<APIResponse<ManagedAppUser>> {
  const response = await fetch(`/api/users-roles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(patch),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to update user'));
  }

  return response.json();
}

export async function syncManagedUsers(credentialToken: string): Promise<APIResponse<UserSyncJob>> {
  const response = await fetch('/api/users-roles/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentialToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to sync users'));
  }

  return response.json();
}

export async function getUserSyncJob(id: string): Promise<APIResponse<UserSyncJob>> {
  const response = await fetch(`/api/users-roles/sync/${id}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch sync job'));
  }

  return response.json();
}
