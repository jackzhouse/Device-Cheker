import { requirePermission } from '@/lib/auth/guards';
import { AppRole } from '@/lib/auth/types';
import connectDB from '@/lib/mongodb';
import AppUser from '@/models/AppUser';
import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const ROLES: AppRole[] = ['admin', 'pic', 'viewer'];
const SELECTED_FIELDS = '_id externalUserId employeeId employeeNo name email departmentName jobTitle isActive role accessScopes lastSyncedAt createdAt updatedAt';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requirePermission(request, 'users.manage');
  if (denied) return denied;

  try {
    await connectDB();

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const role = body.role as AppRole;

    if (!ROLES.includes(role)) {
      return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
    }

    const user = await AppUser.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    const updatedUser = await AppUser.findById(id).select(SELECTED_FIELDS).lean();

    return NextResponse.json({
      success: true,
      data: updatedUser ? { ...updatedUser, _id: updatedUser._id.toString() } : null,
      audit: {
        targetUserId: id,
        previousRole,
        nextRole: role,
        changedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update role';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
