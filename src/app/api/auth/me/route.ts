import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { external_credential_token: _externalCredentialToken, ...publicUser } = user;
  return NextResponse.json({ success: true, data: publicUser });
}
