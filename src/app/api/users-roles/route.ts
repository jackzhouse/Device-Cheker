import { requirePermission } from '@/lib/auth/guards';
import connectDB from '@/lib/mongodb';
import AppUser from '@/models/AppUser';
import { NextRequest, NextResponse } from 'next/server';

interface AppUserQuery {
  $or?: Array<Record<string, { $regex: string; $options: string }>>;
  role?: string;
  departmentName?: { $regex: string; $options: string };
  isActive?: boolean;
}

const SELECTED_FIELDS = '_id externalUserId employeeId employeeNo name email departmentName jobTitle isActive role accessScopes lastSyncedAt createdAt updatedAt';

export async function GET(request: NextRequest) {
  const denied = requirePermission(request, 'users.manage');
  if (denied) return denied;

  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const query: AppUserQuery = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeNo: { $regex: search, $options: 'i' } },
        { departmentName: { $regex: search, $options: 'i' } },
        { jobTitle: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (department) {
      query.departmentName = { $regex: department, $options: 'i' };
    }

    if (status === 'active') {
      query.isActive = true;
    }

    if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;
    const users = await AppUser.find(query)
      .select(SELECTED_FIELDS)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await AppUser.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: users.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
