import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AuthUpstreamError, fetchAttendanceUserForLogin, validateCredentialJwt } from '@/lib/auth/external';
import { syncAppUser } from '@/lib/auth/user';
import { setSessionCookie } from '@/lib/auth/session';

function normalizeBearerToken(token?: string | null) {
  return token?.replace(/^Bearer\s+/i, '').trim() || '';
}

async function readExternalToken(request: NextRequest) {
  const headerToken = normalizeBearerToken(request.headers.get('authorization'));
  if (headerToken) return headerToken;

  const body = await request.json().catch(() => null);
  return normalizeBearerToken(body?.external_token || body?.access_token || body?.token);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const credentialToken = await readExternalToken(request);
    if (!credentialToken) {
      return NextResponse.json({ success: false, error: 'Token external wajib diisi' }, { status: 400 });
    }

    const tokenClaims = validateCredentialJwt(credentialToken);
    const profile = await fetchAttendanceUserForLogin(credentialToken);

    if (!profile.external_user_id) {
      return NextResponse.json({ success: false, error: 'User tidak terdaftar di employee external' }, { status: 401 });
    }

    if (profile.external_user_id !== tokenClaims.accountId) {
      return NextResponse.json(
        { success: false, error: 'Employee detail tidak cocok dengan accountId token' },
        { status: 401 }
      );
    }

    const user = await syncAppUser(profile);
    await setSessionCookie(user, credentialToken);

    return NextResponse.json({
      success: true,
      data: {
        user,
        expires_at: new Date(user.exp * 1000).toISOString(),
      },
    });
  } catch (error: any) {
    if (error instanceof AuthUpstreamError) {
      return NextResponse.json(
        { success: false, error: `${error.stage} failed (${error.status}): ${error.message}` },
        { status: error.stage === 'attendance-profile' ? 401 : 503 }
      );
    }

    return NextResponse.json({ success: false, error: error.message || 'SSO gagal' }, { status: 401 });
  }
}
