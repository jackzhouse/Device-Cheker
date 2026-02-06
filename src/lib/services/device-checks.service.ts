import { APIResponse, PaginationParams } from './employees.service';

export interface DeviceCheck {
  _id: string;
  employeeId: string;
  employeeSnapshot: {
    fullName: string;
    position: string;
    department?: string;
  };
  employee?: {
    _id: string;
    fullName: string;
    status: string;
  };
  deviceDetail: {
    deviceType: 'PC' | 'Laptop';
    ownership: 'Company' | 'Personal';
    deviceBrand: string;
    deviceModel: string;
    serialNumber: string;
  };
  operatingSystem: {
    osType: 'Windows' | 'Linux' | 'Mac';
    osVersion: string;
    osLicense: 'Original' | 'Pirated' | 'Open Source' | 'Unknown';
    osRegularUpdate: boolean;
  };
  specification?: {
    ramCapacity?: string;
    memoryType?: 'HDD' | 'SSD';
    memoryCapacity?: string;
    processor?: string;
  };
  deviceCondition: {
    deviceSuitability: 'Suitable' | 'Limited Suitability' | 'Needs Repair' | 'Unsuitable';
    batterySuitability: string;
    keyboardCondition: string;
    touchpadCondition: string;
    monitorCondition: string;
    wifiCondition: string;
  };
  workApplications: Array<{
    applicationName: string;
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  nonWorkApplications: Array<{
    applicationName: string;
    license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
    notes?: string;
  }>;
  security: {
    antivirus: {
      status: 'Active' | 'Inactive';
      list: Array<{
        applicationName: string;
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
    vpn: {
      status: 'Available' | 'Not Available';
      list: Array<{
        vpnName: string;
        license: 'Original' | 'Pirated' | 'Unknown' | 'Open Source';
        notes?: string;
      }>;
    };
  };
  additionalInfo: {
    passwordUsage: 'Available' | 'Not Available';
    otherNotes?: string;
    inspectorPICName?: string;
  };
  checkDate: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceCheckParams extends PaginationParams {
  employeeId?: string;
  suitability?: string;
  ownership?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getDeviceChecks(
  params: DeviceCheckParams = {}
): Promise<APIResponse<DeviceCheck[]>> {
  const queryString = new URLSearchParams(
    params as any
  ).toString();
  const response = await fetch(`/api/device-checks?${queryString}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch device checks');
  }

  return response.json();
}

export async function createDeviceCheck(
  data: Partial<DeviceCheck>
): Promise<APIResponse<DeviceCheck>> {
  const response = await fetch('/api/device-checks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create device check');
  }

  return response.json();
}

export async function getDeviceCheckById(
  id: string
): Promise<APIResponse<DeviceCheck>> {
  const response = await fetch(`/api/device-checks/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch device check');
  }

  return response.json();
}

export async function updateDeviceCheck(
  id: string,
  data: Partial<DeviceCheck>
): Promise<APIResponse<DeviceCheck>> {
  const response = await fetch(`/api/device-checks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update device check');
  }

  return response.json();
}

export async function deleteDeviceCheck(
  id: string
): Promise<APIResponse<any>> {
  const response = await fetch(`/api/device-checks/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete device check');
  }

  return response.json();
}

export async function getEmployeeChecks(
  employeeId: string,
  params: PaginationParams = {}
): Promise<
  APIResponse<{
    employee: any;
    checks: DeviceCheck[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    summary: {
      totalChecks: number;
      latestCheckDate: string | null;
      deviceTypes: {
        PC: number;
        Laptop: number;
      };
      ownership: {
        Company: number;
        Personal: number;
      };
    };
  }>
> {
  const queryString = new URLSearchParams(
    params as any
  ).toString();
  const response = await fetch(
    `/api/device-checks/employee/${employeeId}?${queryString}`,
    { cache: 'no-store' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch employee checks');
  }

  return response.json();
}