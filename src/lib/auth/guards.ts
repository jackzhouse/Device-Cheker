import { NextRequest, NextResponse } from 'next/server';
import { decodeSession } from './session';
import { AUTH_COOKIE } from './config';
import { Permission } from './types';
import { hasPermission } from './permissions';

export const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/login-summary', '/api/auth/external-config', '/api/auth/sso'];

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function getRequestUser(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export function requirePermission(request: NextRequest, permission: Permission) {
  const user = getRequestUser(request);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!hasPermission(user.permissions, permission)) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return null;
}
