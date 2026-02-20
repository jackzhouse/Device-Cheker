import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'all';
    const department = searchParams.get('department') || null;

    // Calculate date filter
    const now = new Date();
    let dateFilter: any = {};

    if (timeRange !== 'all') {
      const startDate = new Date();
      switch (timeRange) {
        case '30days':
          startDate.setDate(now.getDate() - 30);
          break;
        case '6months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      dateFilter = { checkDate: { $gte: startDate } };
    }

    // Get all device checks with filters
    const filter: any = { ...dateFilter };
    if (department) {
      filter['employeeSnapshot.department'] = department;
    }

    const checks = await DeviceCheck.find(filter).sort({ checkDate: 1 });

    // Calculate statistics
    const totalChecks = checks.length;

    // Count device types
    const deviceTypes = checks.reduce(
      (acc, check) => {
        const type = check.deviceDetail.deviceType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      { PC: 0, Laptop: 0 }
    );

    // Count ownership
    const ownership = checks.reduce(
      (acc, check) => {
        const own = check.deviceDetail.ownership;
        acc[own] = (acc[own] || 0) + 1;
        return acc;
      },
      { Company: 0, Personal: 0 }
    );

    // Count suitability
    const suitability = checks.reduce(
      (acc, check) => {
        const suit = check.deviceCondition.deviceSuitability;
        acc[suit] = (acc[suit] || 0) + 1;
        return acc;
      },
      {
        Suitable: 0,
        'Limited Suitability': 0,
        'Needs Repair': 0,
        Unsuitable: 0,
      }
    );

    // Count OS types
    const osTypes = checks.reduce(
      (acc, check) => {
        const os = check.operatingSystem.osType;
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      },
      { Windows: 0, Linux: 0, Mac: 0 }
    );

    // Count OS licenses
    const osLicenses = checks.reduce(
      (acc, check) => {
        const license = check.operatingSystem.osLicense;
        acc[license] = (acc[license] || 0) + 1;
        return acc;
      },
      { Original: 0, Pirated: 0, 'Open Source': 0, Unknown: 0 }
    );

    // Count antivirus status
    const antivirusStatus = checks.reduce(
      (acc, check) => {
        const status = check.security.antivirus.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Active: 0, Inactive: 0 }
    );

    // Count VPN status
    const vpnStatus = checks.reduce(
      (acc, check) => {
        const status = check.security.vpn.status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { Available: 0, 'Not Available': 0 }
    );

    // Get unique employees
    const uniqueEmployeeIds = new Set(checks.map((check) => check.employeeId.toString()));
    const totalEmployees = uniqueEmployeeIds.size;

    // Get urgent devices (Needs Repair or Unsuitable)
    const urgentDevices = checks.filter(
      (check) =>
        check.deviceCondition.deviceSuitability === 'Needs Repair' ||
        check.deviceCondition.deviceSuitability === 'Unsuitable'
    );

    // Format urgent devices for display
    const urgentDevicesFormatted = urgentDevices.map((check) => ({
      _id: check._id,
      employeeId: check.employeeId,
      employeeName: check.employeeSnapshot.fullName,
      employeePosition: check.employeeSnapshot.position,
      deviceType: check.deviceDetail.deviceType,
      deviceBrand: check.deviceDetail.deviceBrand,
      deviceModel: check.deviceDetail.deviceModel,
      serialNumber: check.deviceDetail.serialNumber,
      suitability: check.deviceCondition.deviceSuitability,
      checkDate: check.checkDate,
      version: check.version,
    }));

    // Get checks over time (monthly)
    const checksOverTime = checks.reduce((acc, check) => {
      const date = new Date(check.checkDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear]++;
      return acc;
    }, {} as Record<string, number>);

    const monthlyData = Object.entries(checksOverTime)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Get department breakdown
    const departmentBreakdown = checks.reduce((acc, check) => {
      const dept = check.employeeSnapshot.department || 'Other';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get employees missing v2 checks
    const activeEmployees = await Employee.find({ status: 'Active' }).lean();
    const employeeIds = activeEmployees.map(e => e._id);
    
    const latestChecks = await DeviceCheck.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      { $sort: { checkDate: -1, version: -1 } },
      { $group: { 
        _id: '$employeeId', 
        latestVersion: { $first: '$version' },
        latestCheckDate: { $first: '$checkDate' }
      }}
    ]);
    
    const versionMap = new Map(
      latestChecks.map((lc: any) => [lc._id.toString(), lc.latestVersion])
    );
    
    const missingVersionEmployees = activeEmployees.filter(employee => {
      const latestVersion = versionMap.get(employee._id.toString());
      return !latestVersion || latestVersion < 2;
    }).map(employee => ({
      _id: employee._id,
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      position: employee.position,
      department: employee.department,
      latestVersion: versionMap.get(employee._id.toString()) || 0,
      lastCheckDate: employee.lastCheckDate,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalChecks,
        totalEmployees,
        deviceTypes,
        ownership,
        suitability,
        osTypes,
        osLicenses,
        antivirusStatus,
        vpnStatus,
        urgentDevices: urgentDevicesFormatted,
        monthlyData,
        departmentBreakdown,
        missingVersionV2: missingVersionEmployees,
        summary: {
          totalChecks,
          totalEmployees,
          totalPCs: deviceTypes.PC,
          totalLaptops: deviceTypes.Laptop,
          companyOwned: ownership.Company,
          personalOwned: ownership.Personal,
          urgentDevicesCount: urgentDevices.length,
          missingV2Count: missingVersionEmployees.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}