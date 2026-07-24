import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';

export async function GET() {
  try {
    await connectDB();
    const [totalDevices, totalEmployees, lastChecks] = await Promise.all([
      DeviceCheck.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      DeviceCheck.find({}, 'deviceCondition.deviceSuitability employeeId').lean(),
    ]);

    const needsService = lastChecks.filter((item: any) =>
      item.deviceCondition?.deviceSuitability === 'Needs Repair' ||
      item.deviceCondition?.deviceSuitability === 'Unsuitable'
    ).length;

    const uniqueEmployees = new Set(lastChecks.map((item: any) => String(item.employeeId)));
    const lastCheckCoverage = totalEmployees > 0 ? Math.round((uniqueEmployees.size / totalEmployees) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalDevices,
        totalEmployees,
        needsService,
        urgentRepair: needsService,
        lastCheckCoverage,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Gagal memuat ringkasan login' }, { status: 500 });
  }
}
