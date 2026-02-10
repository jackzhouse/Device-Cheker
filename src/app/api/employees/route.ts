import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';
import { isValidObjectId } from 'mongoose';

// GET /api/employees - Get all employees with pagination, search, and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'fullName';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Employee.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Convert ObjectId to string
    const employeesWithStringId = employees.map((emp) => ({
      ...emp,
      _id: emp._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: employeesWithStringId,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      employeeId,
      firstName,
      lastName,
      position,
      department,
      email,
      phoneNumber,
      status = 'Active',
    } = body;

    // Validation
    if (!firstName || !lastName || !position) {
      return NextResponse.json(
        { success: false, error: 'First name, last name, and position are required' },
        { status: 400 }
      );
    }

    // Generate employeeId if not provided (backward compatibility)
    let finalEmployeeId = employeeId;
    if (!employeeId) {
      // Generate from first letters of first name + random 4-digit number
      const letters = (firstName.substring(0, 2) + lastName.substring(0, 1)).toUpperCase().padEnd(2, 'X');
      const number = Math.floor(1000 + Math.random() * 9000);
      finalEmployeeId = `${letters}-${number}`;
    }

    // Check for duplicate employeeId
    const existingEmployee = await Employee.findOne({ employeeId: finalEmployeeId });
    if (existingEmployee) {
      return NextResponse.json(
        { success: false, error: 'Employee ID already exists' },
        { status: 409 }
      );
    }

    // Create employee (normalize position and department to uppercase)
    const employee = await Employee.create({
      employeeId: finalEmployeeId.toUpperCase(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      position: position.trim().toUpperCase(),
      department: department ? department.trim().toUpperCase() : undefined,
      email,
      phoneNumber,
      status,
    });

    // Convert to plain object with string ID
    const employeeData: any = employee.toObject();
    employeeData._id = employee._id.toString();

    return NextResponse.json(
      {
        success: true,
        data: employeeData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create employee' },
      { status: 500 }
    );
  }
}