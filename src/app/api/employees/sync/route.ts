import { getRequestUser, requirePermission } from '@/lib/auth/guards';
import { startEmployeeSyncJob } from '@/lib/auth/employee-sync-job';
import { AuthUpstreamError, fetchAttendanceUserForLogin, validateCredentialJwt } from '@/lib/auth/external';
import connectDB from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const denied = requirePermission(request, 'employees.manage');
  if (denied) return denied;

  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const sessionUser = getRequestUser(request);
    const headerToken = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
    const credentialToken = headerToken || sessionUser?.external_credential_token;

    if (!credentialToken) {
      return NextResponse.json(
        { success: false, error: 'Token sesi external tidak tersedia. Silakan login ulang.' },
        { status: 401 }
      );
    }

    const tokenClaims = validateCredentialJwt(credentialToken);
    const profile = await fetchAttendanceUserForLogin(credentialToken);
    if (profile.external_user_id !== tokenClaims.accountId) {
      return NextResponse.json({ success: false, error: 'Identity token Katalis tidak cocok' }, { status: 401 });
    }

    const size = Math.min(Math.max(Number(body.size || 100), 1), 500);
    const job = startEmployeeSyncJob(credentialToken, size);

    return NextResponse.json({ success: true, data: job }, { status: 202 });
  } catch (error: unknown) {
    if (error instanceof AuthUpstreamError) {
      const status = error.status === 401 || error.status === 403 ? 401 : 503;
      return NextResponse.json({ success: false, error: `${error.stage} gagal` }, { status });
    }
    const message = error instanceof Error ? error.message : 'Gagal sinkronisasi employee';
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}
