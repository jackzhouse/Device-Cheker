import { cookies } from 'next/headers';
import { AUTH_COOKIE, AUTH_TTL_SECONDS } from './config';
import { AuthUser, SessionUser } from './types';

export function encodeSession(user: SessionUser) {
  return Buffer.from(JSON.stringify(user)).toString('base64url');
}

export function decodeSession(token: string): SessionUser | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as SessionUser;
    if (!parsed.exp || parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function setSessionCookie(user: AuthUser, externalCredentialToken?: string) {
  const store = await cookies();
  const session: SessionUser = {
    ...user,
    ...(externalCredentialToken ? { external_credential_token: externalCredentialToken } : {}),
  };
  store.set(AUTH_COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: AUTH_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(AUTH_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
