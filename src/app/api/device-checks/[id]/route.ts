import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';

// GET /api/device-checks/[id] - Get device check by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid device check ID' },
        { status: 400 }
      );
    }

    // Find device check with employee data
    const check = await DeviceCheck.findById(id)
      .populate('employeeId', 'fullName position status department email phoneNumber')
      .lean();

    if (!check) {
      return NextResponse.json(
        { success: false, error: 'Device check not found' },
        { status: 404 }
      );
    }

    // Transform to include employee data
    const transformedCheck = {
      ...check,
      employee: check.employeeId,
    };

    return NextResponse.json({
      success: true,
      data: transformedCheck,
    });
  } catch (error: any) {
    console.error('Error fetching device check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch device check' },
      { status: 500 }
    );
  }
}

// PUT /api/device-checks/[id] - Update device check
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid device check ID' },
        { status: 400 }
      );
    }

    // Prevent changing employeeId
    if (body.employeeId) {
      return NextResponse.json(
        { success: false, error: 'Cannot change employeeId after creation' },
        { status: 400 }
      );
    }

    // Find and update device check
    const check = await DeviceCheck.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!check) {
      return NextResponse.json(
        { success: false, error: 'Device check not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: check,
    });
  } catch (error: any) {
    console.error('Error updating device check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update device check' },
      { status: 500 }
    );
  }
}

// DELETE /api/device-checks/[id] - Delete device check
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid device check ID' },
        { status: 400 }
      );
    }

    // Find and delete device check
    const check = await DeviceCheck.findByIdAndDelete(id);

    if (!check) {
      return NextResponse.json(
        { success: false, error: 'Device check not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Device check deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting device check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete device check' },
      { status: 500 }
    );
  }
}