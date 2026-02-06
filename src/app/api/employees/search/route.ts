import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/models/Employee';

// GET /api/employees/search - Search employees for autocomplete
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'Active';

    // Build query
    const query: any = {};

    // Search by name (fuzzy search)
    if (q) {
      query.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Execute query with lean for performance
    const employees = await Employee.find(query)
      .select('fullName firstName lastName position department totalDeviceChecks lastCheckDate')
      .sort({ fullName: 1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: employees,
    });
  } catch (error: any) {
    console.error('Error searching employees:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search employees' },
      { status: 500 }
    );
  }
}