import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceCheck from '@/models/DeviceCheck';
import Employee from '@/models/Employee';
import DropdownOption from '@/models/DropdownOption';

// Helper function to save dropdown option
async function saveDropdownOption(fieldName: string, value: string, category?: string) {
  try {
    await DropdownOption.findOneAndUpdate(
      { fieldName, value },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error saving dropdown option:', error);
  }
}

// Helper function to save multiple dropdown options
async function saveDropdownOptions(
  data: any,
  options: { field: string; category?: string; isArray?: boolean }[]
) {
  const promises: Promise<any>[] = [];

  options.forEach((opt) => {
    const value = opt.field.split('.').reduce((obj, key) => obj?.[key], data);

    if (opt.isArray && Array.isArray(value)) {
      value.forEach((item: any) => {
        const itemValue = item.applicationName || item.vpnName || item;
        if (itemValue && typeof itemValue === 'string') {
          promises.push(saveDropdownOption(opt.field, itemValue, opt.category));
        }
      });
    } else if (value && typeof value === 'string') {
      promises.push(saveDropdownOption(opt.field, value, opt.category));
    }
  });

  await Promise.all(promises);
}

// GET /api/device-checks - Get all device checks with pagination and filters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const employeeId = searchParams.get('employeeId') || '';
    const department = searchParams.get('department') || '';
    const suitability = searchParams.get('suitability') || '';
    const ownership = searchParams.get('ownership') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'checkDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { 'employeeSnapshot.fullName': { $regex: search, $options: 'i' } },
        { 'deviceDetail.deviceBrand': { $regex: search, $options: 'i' } },
        { 'deviceDetail.deviceModel': { $regex: search, $options: 'i' } },
        { 'deviceDetail.serialNumber': { $regex: search, $options: 'i' } },
      ];
    }

    if (employeeId && employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      query.employeeId = employeeId;
    }

    if (department) {
      query['employeeSnapshot.department'] = { $regex: department, $options: 'i' };
    }

    if (suitability) {
      query['deviceCondition.deviceSuitability'] = suitability;
    }

    if (ownership) {
      query['deviceDetail.ownership'] = ownership;
    }

    if (dateFrom || dateTo) {
      query.checkDate = {};
      if (dateFrom) {
        query.checkDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.checkDate.$lte = new Date(dateTo);
      }
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query with employee population
    const checks = await DeviceCheck.find(query)
      .populate('employeeId', 'fullName position status')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to include employee data
    const transformedChecks = checks.map((check: any) => ({
      ...check,
      employee: check.employeeId,
    }));

    const total = await DeviceCheck.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: transformedChecks,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching device checks:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch device checks' },
      { status: 500 }
    );
  }
}

// POST /api/device-checks - Create new device check
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate employeeId
    if (!body.employeeId || !body.employeeId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Valid employee ID is required' },
        { status: 400 }
      );
    }

    // Fetch employee data for snapshot
    const employee = await Employee.findById(body.employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Create employee snapshot
    const employeeSnapshot = {
      fullName: employee.fullName,
      position: employee.position,
      department: employee.department,
    };

    // Create device check
    const deviceCheck = await DeviceCheck.create({
      ...body,
      employeeSnapshot,
      checkDate: body.checkDate ? new Date(body.checkDate) : new Date(),
    });

    // Save dropdown options asynchronously
    const dropdownOptions = [
      { field: 'deviceDetail.deviceBrand' },
      { field: 'operatingSystem.osVersion' },
      { field: 'specification.ramCapacity' },
      { field: 'specification.memoryCapacity' },
      { field: 'specification.processor' },
      { field: 'workApplications', category: 'workApps', isArray: true },
      { field: 'nonWorkApplications', category: 'nonWorkApps', isArray: true },
      { field: 'security.antivirus.list', category: 'antivirus', isArray: true },
      { field: 'security.vpn.list', category: 'vpn', isArray: true },
      { field: 'additionalInfo.inspectorPICName' },
    ];

    saveDropdownOptions(deviceCheck.toObject(), dropdownOptions).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        data: deviceCheck,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating device check:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create device check' },
      { status: 500 }
    );
  }
}