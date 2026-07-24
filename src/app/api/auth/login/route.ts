import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { AuthUpstreamError, checkKatalisCredential, fetchAttendanceUserForLogin, loginExternal, validateCredentialJwt } from '@/lib/auth/external';
import { syncAppUser } from '@/lib/auth/user';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi' }, { status: 400 });
    }

    const loginToken = await loginExternal(username, password);
    const credentialToken = await checkKatalisCredential(loginToken);
    const tokenClaims = validateCredentialJwt(credentialToken);
    const profile = await fetchAttendanceUserForLogin(credentialToken);

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
        { status: 401 }
      );
    }

    return NextResponse.json({ success: false, error: error.message || 'Login gagal' }, { status: 401 });
  }
}
