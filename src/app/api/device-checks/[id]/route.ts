import { requirePermission } from '@/lib/auth/guards';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';

// GET /api/device-checks/[id] - Get device check by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requirePermission(request, 'checks.view');
  if (denied) return denied;

  try {
    await connectDB();
    const { id } = await params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: 'Invalid device check ID' }, { status: 400 });
    }

    const check = await DeviceCheck.findById(id).lean();
    if (!check) {
      return NextResponse.json({ success: false, error: 'Device check not found' }, { status: 404 });
    }

    const employeeId = check.employeeId?.toString();
    const employee = await Employee.findById(employeeId).lean();

    return NextResponse.json({
      success: true,
      data: {
        ...check,
        _id: check._id.toString(),
        employeeId,
        employee,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch device check';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/device-checks/[id] - Update device check
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requirePermission(request, 'checks.edit');
  if (denied) return denied;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: 'Invalid device check ID' }, { status: 400 });
    }

    if (body.employeeId) {
      return NextResponse.json({ success: false, error: 'Cannot change employeeId after creation' }, { status: 400 });
    }

    const check = await DeviceCheck.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!check) {
      return NextResponse.json({ success: false, error: 'Device check not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...check,
        _id: check._id.toString(),
        employeeId: check.employeeId?.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update device check';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/device-checks/[id] - Delete device check
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = requirePermission(request, 'checks.delete');
  if (denied) return denied;

  try {
    await connectDB();
    const { id } = await params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ success: false, error: 'Invalid device check ID' }, { status: 400 });
    }

    const check = await DeviceCheck.findByIdAndDelete(id);
    if (!check) {
      return NextResponse.json({ success: false, error: 'Device check not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Device check deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete device check';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
