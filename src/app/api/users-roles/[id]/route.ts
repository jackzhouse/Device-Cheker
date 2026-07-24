import { requirePermission } from '@/lib/auth/guards';
import { AppRole } from '@/lib/auth/types';
import connectDB from '@/lib/mongodb';
import AppUser from '@/models/AppUser';
import { isValidObjectId } from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

const ROLES: AppRole[] = ['admin', 'pic', 'viewer'];
const SELECTED_FIELDS = '_id externalUserId employeeId employeeNo name email departmentName jobTitle isActive role accessScopes lastSyncedAt createdAt updatedAt';
function serialize(user: any) {
  return user ? { ...user, _id: user._id.toString(), employeeId: user.employeeId?.toString() } : null;
}

function optionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizeScopes(scopes: unknown[]) {
  return Array.from(new Set(scopes.map(String).map((scope: string) => scope.trim()).filter(Boolean)));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requirePermission(request, 'users.manage');
  if (denied) return denied;

  await connectDB();
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, error: 'Invalid user ID' }, { status: 400 });
  }

  const user = await AppUser.findById(id).select(SELECTED_FIELDS).lean();
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: serialize(user) });
}

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
    const user = await AppUser.findById(id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if ('name' in body && optionalString(body.name)) user.name = optionalString(body.name) as string;
    if ('email' in body) user.email = optionalString(body.email);
    if ('departmentName' in body) user.departmentName = optionalString(body.departmentName);
    if ('jobTitle' in body) user.jobTitle = optionalString(body.jobTitle);

    if ('isActive' in body) {
      user.isActive = Boolean(body.isActive);
    }

    if ('role' in body) {
      if (!ROLES.includes(body.role)) {
        return NextResponse.json({ success: false, error: 'Invalid role' }, { status: 400 });
      }
      user.role = body.role;
    }

    if ('accessScopes' in body) {
      if (!Array.isArray(body.accessScopes)) {
        return NextResponse.json({ success: false, error: 'Invalid access scopes' }, { status: 400 });
      }
      user.accessScopes = normalizeScopes(body.accessScopes);
    }

    await user.save();
    const updatedUser = await AppUser.findById(id).select(SELECTED_FIELDS).lean();

    return NextResponse.json({ success: true, data: serialize(updatedUser) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
