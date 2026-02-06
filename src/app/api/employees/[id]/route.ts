import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import DeviceCheck from '@/models/DeviceCheck';

// GET /api/employees/[id] - Get employee by ID
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
        { success: false, error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Find employee
    const employee = await Employee.findById(id).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Get recent device checks (latest 5)
    const deviceChecks = await DeviceCheck.find({ employeeId: id })
      .sort({ checkDate: -1 })
      .limit(5)
      .lean();

    // Convert ObjectIds to strings
    const employeeData = {
      ...employee,
      _id: employee._id.toString(),
    };

    const checksWithStringId = deviceChecks.map((check) => ({
      ...check,
      _id: check._id.toString(),
      employeeId: check.employeeId.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        ...employeeData,
        deviceChecks: checksWithStringId,
      },
    });
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT /api/employees/[id] - Update employee
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
        { success: false, error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Find and update employee
    const employee = await Employee.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Convert ObjectId to string
    const employeeData = {
      ...employee,
      _id: employee._id.toString(),
    };

    return NextResponse.json({
      success: true,
      data: employeeData,
    });
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE /api/employees/[id] - Delete employee
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
        { success: false, error: 'Invalid employee ID' },
        { status: 400 }
      );
    }

    // Check if employee exists
    const employee = await Employee.findById(id);

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Check if employee has device checks
    const checkCount = await DeviceCheck.countDocuments({ employeeId: id });

    if (checkCount > 0) {
      // Soft delete: update status to 'Resigned'
      employee.status = 'Resigned';
      await employee.save();

      // Convert to plain object with string ID
      const employeeData: any = employee.toObject();
      employeeData._id = employee._id.toString();

      return NextResponse.json({
        success: true,
        message: 'Employee status updated to Resigned (soft delete)',
        data: employeeData,
      });
    } else {
      // Hard delete: no device checks exist
      await Employee.findByIdAndDelete(id);

      return NextResponse.json({
        success: true,
        message: 'Employee deleted successfully',
      });
    }
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}