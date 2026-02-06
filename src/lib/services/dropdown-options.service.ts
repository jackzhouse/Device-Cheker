import { APIResponse } from './employees.service';

export interface DropdownOption {
  _id: string;
  fieldName: string;
  value: string;
  category?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string;
}

export async function getDropdownOptions(
  fieldName: string,
  category?: string,
  limit = 50
): Promise<APIResponse<DropdownOption[]>> {
  const params = new URLSearchParams({
    fieldName,
    limit: limit.toString(),
  });

  if (category) {
    params.append('category', category);
  }

  const response = await fetch(`/api/dropdown-options?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch dropdown options');
  }

  return response.json();
}

export async function saveDropdownOption(
  fieldName: string,
  value: string,
  category?: string
): Promise<APIResponse<DropdownOption>> {
  const response = await fetch('/api/dropdown-options', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fieldName, value, category }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save dropdown option');
  }

  return response.json();
}