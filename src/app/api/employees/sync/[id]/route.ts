import { requirePermission } from '@/lib/auth/guards';
import { cancelEmployeeSyncJob, getEmployeeSyncJob } from '@/lib/auth/employee-sync-job';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requirePermission(request, 'employees.manage');
  if (denied) return denied;

  const { id } = await params;
  const job = getEmployeeSyncJob(id);
  if (!job) {
    return NextResponse.json({ success: false, error: 'Sync job tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requirePermission(request, 'employees.manage');
  if (denied) return denied;

  const { id } = await params;
  const job = cancelEmployeeSyncJob(id);
  if (!job) {
    return NextResponse.json({ success: false, error: 'Sync job tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}
