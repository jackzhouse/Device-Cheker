export interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  department?: string;
  email?: string;
  phoneNumber?: string;
  status: 'Active' | 'Inactive' | 'Resigned';
  totalDeviceChecks: number;
  lastCheckDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
  status?: string;
  hasChecks?: 'true' | 'false';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export interface EmployeeSyncSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export interface EmployeeSyncJob {
  id: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  page: number;
  size: number;
  totalPages?: number;
  summary: EmployeeSyncSummary;
  error?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}

async function parseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  return payload?.error || fallback;
}

export async function getEmployees(
  params: PaginationParams = {}
): Promise<APIResponse<Employee[]>> {
  const queryString = new URLSearchParams(
    params as any
  ).toString();
  const response = await fetch(`/api/employees?${queryString}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch employees'));
  }

  return response.json();
}

export async function searchEmployees(
  query: string,
  limit = 10
): Promise<APIResponse<Employee[]>> {
  const response = await fetch(
    `/api/employees/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to search employees'));
  }

  return response.json();
}

export async function createEmployee(
  data: Partial<Employee>
): Promise<APIResponse<Employee>> {
  const response = await fetch('/api/employees', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to create employee'));
  }

  return response.json();
}

export async function getEmployeeById(
  id: string
): Promise<APIResponse<Employee>> {
  const response = await fetch(`/api/employees/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch employee'));
  }

  return response.json();
}

export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<APIResponse<Employee>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to update employee'));
  }

  return response.json();
}

export async function deleteEmployee(
  id: string
): Promise<APIResponse<any>> {
  const response = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to delete employee'));
  }

  return response.json();
}

export async function syncEmployees(credentialToken: string): Promise<APIResponse<EmployeeSyncJob>> {
  const response = await fetch('/api/employees/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${credentialToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to sync employees'));
  }

  return response.json();
}

export async function getEmployeeSyncJob(id: string): Promise<APIResponse<EmployeeSyncJob>> {
  const response = await fetch(`/api/employees/sync/${id}`, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to fetch employee sync job'));
  }

  return response.json();
}

export async function cancelEmployeeSyncJob(id: string): Promise<APIResponse<EmployeeSyncJob>> {
  const response = await fetch(`/api/employees/sync/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error(await parseError(response, 'Failed to cancel employee sync'));
  }

  return response.json();
}
