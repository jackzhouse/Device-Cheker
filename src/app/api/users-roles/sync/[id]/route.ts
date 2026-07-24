import { requirePermission } from '@/lib/auth/guards';
import { getUserSyncJob } from '@/lib/auth/sync-job';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = requirePermission(request, 'users.manage');
  if (denied) return denied;

  const { id } = await params;
  const job = getUserSyncJob(id);
  if (!job) {
    return NextResponse.json({ success: false, error: 'Sync job tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: job });
}
