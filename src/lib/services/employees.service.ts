export interface Employee {
  _id: string;
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employees');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to search employees');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to create employee');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employee');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to update employee');
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
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete employee');
  }

  return response.json();
}