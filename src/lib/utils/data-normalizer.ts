// Utility to normalize old data format to new internal values
// This handles backward compatibility for existing records

export const normalizeDataForForm = (data: any) => {
  if (!data) return data;

  const normalized = JSON.parse(JSON.stringify(data));

  // Normalize device type
  if (normalized.deviceDetail?.deviceType) {
    const deviceTypeMap: Record<string, string> = {
      'PC': 'pc',
      'Laptop': 'laptop',
    };
    normalized.deviceDetail.deviceType = deviceTypeMap[normalized.deviceDetail.deviceType] || normalized.deviceDetail.deviceType;
  }

  // Normalize ownership
  if (normalized.deviceDetail?.ownership) {
    const ownershipMap: Record<string, string> = {
      'Company': 'company',
      'Personal': 'personal',
    };
    normalized.deviceDetail.ownership = ownershipMap[normalized.deviceDetail.ownership] || normalized.deviceDetail.ownership;
  }

  // Normalize OS type
  if (normalized.operatingSystem?.osType) {
    const osTypeMap: Record<string, string> = {
      'Windows': 'windows',
      'Linux': 'linux',
      'Mac': 'mac',
    };
    normalized.operatingSystem.osType = osTypeMap[normalized.operatingSystem.osType] || normalized.operatingSystem.osType;
  }

  // Normalize OS license
  if (normalized.operatingSystem?.osLicense) {
    const osLicenseMap: Record<string, string> = {
      'Original': 'original',
      'Pirated': 'pirated',
      'Open Source': 'openSource',
      'Unknown': 'unknown',
    };
    normalized.operatingSystem.osLicense = osLicenseMap[normalized.operatingSystem.osLicense] || normalized.operatingSystem.osLicense;
  }

  // Normalize memory type (convert old format to new storage array format)
  if (normalized.specification) {
    // If old format exists, convert to new storage array format
    const oldMemoryType = normalized.specification.memoryType;
    const oldMemoryCapacity = normalized.specification.memoryCapacity;
    
    if (oldMemoryType || oldMemoryCapacity) {
      // Convert old format to new storage array
      if (!normalized.specification.storage || normalized.specification.storage.length === 0) {
        const memoryTypeMap: Record<string, string> = {
          'HDD': 'hdd',
          'SSD': 'ssd',
        };
        normalized.specification.storage = [{
          type: memoryTypeMap[oldMemoryType] || oldMemoryType?.toLowerCase() || 'hdd',
          size: oldMemoryCapacity || '',
        }];
      }
      // Remove old fields
      delete normalized.specification.memoryType;
      delete normalized.specification.memoryCapacity;
    }
    
    // Normalize storage array items if they exist
    if (normalized.specification.storage && Array.isArray(normalized.specification.storage)) {
      const memoryTypeMap: Record<string, string> = {
        'HDD': 'hdd',
        'SSD': 'ssd',
      };
      normalized.specification.storage = normalized.specification.storage.map((item: any) => ({
        type: memoryTypeMap[item.type] || item.type?.toLowerCase() || 'hdd',
        size: item.size || '',
      }));
    }
  }

  // Normalize device suitability
  if (normalized.deviceCondition?.deviceSuitability) {
    const suitabilityMap: Record<string, string> = {
      'Suitable': 'suitable',
      'Limited Suitability': 'limitedSuitability',
      'Needs Repair': 'needsRepair',
      'Unsuitable': 'unsuitable',
    };
    normalized.deviceCondition.deviceSuitability = suitabilityMap[normalized.deviceCondition.deviceSuitability] || normalized.deviceCondition.deviceSuitability;
  }

  // Normalize application licenses (work applications)
  if (normalized.workApplications?.length > 0) {
    const licenseMap: Record<string, string> = {
      'Original': 'original',
      'Pirated': 'pirated',
      'Open Source': 'openSource',
      'Unknown': 'unknown',
    };
    normalized.workApplications.forEach((app: any) => {
      if (app.license) {
        app.license = licenseMap[app.license] || app.license;
      }
    });
  }

  // Normalize application licenses (non-work applications)
  if (normalized.nonWorkApplications?.length > 0) {
    const licenseMap: Record<string, string> = {
      'Original': 'original',
      'Pirated': 'pirated',
      'Open Source': 'openSource',
      'Unknown': 'unknown',
    };
    normalized.nonWorkApplications.forEach((app: any) => {
      if (app.license) {
        app.license = licenseMap[app.license] || app.license;
      }
    });
  }

  // Normalize security status and licenses
  if (normalized.security?.antivirus?.status) {
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Inactive': 'inactive',
      'Available': 'available',
      'Not Available': 'notAvailable',
    };
    normalized.security.antivirus.status = statusMap[normalized.security.antivirus.status] || normalized.security.antivirus.status;
  }

  if (normalized.security?.antivirus?.list?.length > 0) {
    const licenseMap: Record<string, string> = {
      'Original': 'original',
      'Pirated': 'pirated',
      'Open Source': 'openSource',
      'Unknown': 'unknown',
    };
    normalized.security.antivirus.list.forEach((app: any) => {
      if (app.license) {
        app.license = licenseMap[app.license] || app.license;
      }
    });
  }

  if (normalized.security?.vpn?.status) {
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Inactive': 'inactive',
      'Available': 'available',
      'Not Available': 'notAvailable',
    };
    normalized.security.vpn.status = statusMap[normalized.security.vpn.status] || normalized.security.vpn.status;
  }

  if (normalized.security?.vpn?.list?.length > 0) {
    const licenseMap: Record<string, string> = {
      'Original': 'original',
      'Pirated': 'pirated',
      'Open Source': 'openSource',
      'Unknown': 'unknown',
    };
    normalized.security.vpn.list.forEach((app: any) => {
      if (app.license) {
        app.license = licenseMap[app.license] || app.license;
      }
    });
  }

  // Normalize password usage
  if (normalized.additionalInfo?.passwordUsage) {
    const passwordUsageMap: Record<string, string> = {
      'Available': 'available',
      'Not Available': 'notAvailable',
    };
    normalized.additionalInfo.passwordUsage = passwordUsageMap[normalized.additionalInfo.passwordUsage] || normalized.additionalInfo.passwordUsage;
  }

  return normalized;
};

// Normalize form data before submission to match database enum values
export const normalizeDataForSubmission = (data: any) => {
  if (!data) return data;

  const normalized = JSON.parse(JSON.stringify(data));

  // Normalize device type
  if (normalized.deviceDetail?.deviceType) {
    const deviceTypeMap: Record<string, string> = {
      'pc': 'PC',
      'laptop': 'Laptop',
    };
    normalized.deviceDetail.deviceType = deviceTypeMap[normalized.deviceDetail.deviceType.toLowerCase()] || normalized.deviceDetail.deviceType;
  }

  // Normalize ownership
  if (normalized.deviceDetail?.ownership) {
    const ownershipMap: Record<string, string> = {
      'company': 'Company',
      'personal': 'Personal',
    };
    normalized.deviceDetail.ownership = ownershipMap[normalized.deviceDetail.ownership.toLowerCase()] || normalized.deviceDetail.ownership;
  }

  // Normalize OS type
  if (normalized.operatingSystem?.osType) {
    const osTypeMap: Record<string, string> = {
      'windows': 'Windows',
      'linux': 'Linux',
      'mac': 'Mac',
    };
    normalized.operatingSystem.osType = osTypeMap[normalized.operatingSystem.osType.toLowerCase()] || normalized.operatingSystem.osType;
  }

  // Normalize OS license
  if (normalized.operatingSystem?.osLicense) {
    const osLicenseMap: Record<string, string> = {
      'original': 'Original',
      'pirated': 'Pirated',
      'opensource': 'Open Source',
      'openSource': 'Open Source',
      'unknown': 'Unknown',
    };
    normalized.operatingSystem.osLicense = osLicenseMap[normalized.operatingSystem.osLicense.toLowerCase()] || normalized.operatingSystem.osLicense;
  }

  // Normalize storage array items
  if (normalized.specification?.storage && Array.isArray(normalized.specification.storage)) {
    const memoryTypeMap: Record<string, string> = {
      'hdd': 'HDD',
      'ssd': 'SSD',
    };
    normalized.specification.storage = normalized.specification.storage.map((item: any) => ({
      type: memoryTypeMap[item.type?.toLowerCase()] || 'HDD',
      size: item.size || '',
    }));
    // Remove empty storage entries
    normalized.specification.storage = normalized.specification.storage.filter((item: any) => item.size);
  }

  // Normalize device suitability
  if (normalized.deviceCondition?.deviceSuitability) {
    const suitabilityMap: Record<string, string> = {
      'suitable': 'Suitable',
      'limitedsuitability': 'Limited Suitability',
      'limitedSuitability': 'Limited Suitability',
      'needsrepair': 'Needs Repair',
      'needsRepair': 'Needs Repair',
      'unsuitable': 'Unsuitable',
    };
    normalized.deviceCondition.deviceSuitability = suitabilityMap[normalized.deviceCondition.deviceSuitability.toLowerCase()] || normalized.deviceCondition.deviceSuitability;
  }

  // Helper to normalize license
  const normalizeLicense = (license: string) => {
    const licenseMap: Record<string, string> = {
      'original': 'Original',
      'pirated': 'Pirated',
      'opensource': 'Open Source',
      'openSource': 'Open Source',
      'unknown': 'Unknown',
    };
    return licenseMap[license.toLowerCase()] || license;
  };

  // Normalize application licenses (work applications)
  if (normalized.workApplications?.length > 0) {
    normalized.workApplications.forEach((app: any) => {
      if (app.license) {
        app.license = normalizeLicense(app.license);
      }
    });
  }

  // Normalize application licenses (non-work applications)
  if (normalized.nonWorkApplications?.length > 0) {
    normalized.nonWorkApplications.forEach((app: any) => {
      if (app.license) {
        app.license = normalizeLicense(app.license);
      }
    });
  }

  // Normalize security status and licenses
  if (normalized.security?.antivirus?.status) {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'available': 'Available',
      'notavailable': 'Not Available',
      'notAvailable': 'Not Available',
    };
    normalized.security.antivirus.status = statusMap[normalized.security.antivirus.status.toLowerCase()] || normalized.security.antivirus.status;
  }

  if (normalized.security?.antivirus?.list?.length > 0) {
    normalized.security.antivirus.list.forEach((app: any) => {
      if (app.license) {
        app.license = normalizeLicense(app.license);
      }
    });
  }

  if (normalized.security?.vpn?.status) {
    const statusMap: Record<string, string> = {
      'active': 'Active',
      'inactive': 'Inactive',
      'available': 'Available',
      'notavailable': 'Not Available',
      'notAvailable': 'Not Available',
    };
    normalized.security.vpn.status = statusMap[normalized.security.vpn.status.toLowerCase()] || normalized.security.vpn.status;
  }

  if (normalized.security?.vpn?.list?.length > 0) {
    normalized.security.vpn.list.forEach((app: any) => {
      if (app.license) {
        app.license = normalizeLicense(app.license);
      }
    });
  }

  // Normalize password usage
  if (normalized.additionalInfo?.passwordUsage) {
    const passwordUsageMap: Record<string, string> = {
      'available': 'Available',
      'notavailable': 'Not Available',
      'notAvailable': 'Not Available',
    };
    normalized.additionalInfo.passwordUsage = passwordUsageMap[normalized.additionalInfo.passwordUsage.toLowerCase()] || normalized.additionalInfo.passwordUsage;
  }

  if (Array.isArray(normalized.mobileDevices)) {
    normalized.mobileDevices = normalized.mobileDevices
      .map((device: any) => ({
        deviceName: device.deviceName?.trim() || '',
        macAddress: device.macAddress?.trim().toUpperCase() || '',
      }))
      .filter((device: any) => device.deviceName || device.macAddress);
  }

  return normalized;
};
