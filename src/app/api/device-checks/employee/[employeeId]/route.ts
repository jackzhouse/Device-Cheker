import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';

// GET /api/device-checks/employee/[employeeId] - Get all checks for specific employee
export async function GET(
  request: NextRequest,
  { params }: { params: { employeeId: string } }
) {
  try {
    await connectDB();

    const { employeeId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'checkDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate ObjectId
    if (!employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Get all checks for this employee
    const checks = await DeviceCheck.find({ employeeId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await DeviceCheck.countDocuments({ employeeId });
    const totalPages = Math.ceil(total / limit);

    // Calculate summary statistics
    const allChecks = await DeviceCheck.find({ employeeId }).lean();

    const summary = {
      totalChecks: total,
      latestCheckDate: allChecks.length > 0 ? allChecks[0]?.checkDate : null,
      deviceTypes: {
        PC: allChecks.filter((c) => c.deviceDetail.deviceType === 'PC').length,
        Laptop: allChecks.filter((c) => c.deviceDetail.deviceType === 'Laptop').length,
      },
      ownership: {
        Company: allChecks.filter((c) => c.deviceDetail.ownership === 'Company').length,
        Personal: allChecks.filter((c) => c.deviceDetail.ownership === 'Personal').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        employee,
        checks,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        summary,
      },
    });
  } catch (error: any) {
    console.error('Error fetching employee checks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employee checks' },
      { status: 500 }
    );
  }
}