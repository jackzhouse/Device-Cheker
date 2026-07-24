import { getAuthConfig, TokenSource } from './config';

export interface ExternalProfile {
  external_user_id: string;
  account_id?: string;
  attendance_user_id?: string;
  employee_no?: string;
  name: string;
  email?: string;
  department_name?: string;
  job_title?: string;
  is_active: boolean;
}

export interface DecodedCredentialToken {
  accountId: string;
  exp: number;
}

export class AuthUpstreamError extends Error {
  constructor(
    public stage: 'katalis-login' | 'katalis-credential-check' | 'attendance-users' | 'attendance-profile',
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'AuthUpstreamError';
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function normalizeBearerToken(token?: unknown) {
  return typeof token === 'string' ? token.replace(/^Bearer\s+/i, '').trim() || undefined : undefined;
}

function buildUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return new URL(path);
  return new URL(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`);
}

function readBodyPath(result: any, path: string) {
  return path.split('.').reduce((value, key) => value?.[key], result);
}

function extractToken(result: any, response: Response, source?: TokenSource): string | undefined {
  if (source === 'authorization-header') {
    return normalizeBearerToken(response.headers.get('authorization'));
  }
  if (source === 'body.data') {
    return normalizeBearerToken(readBodyPath(result, 'data'));
  }
  if (typeof result === 'string') return normalizeBearerToken(result);

  return normalizeBearerToken(
    result?.data?.token
    || result?.data?.access_token
    || result?.data?.accessToken
    || result?.data?.bearerToken
    || result?.token
    || result?.access_token
    || result?.accessToken
    || result?.bearerToken
  );
}

function decodeJwtPayload(token: string): any {
  const [, payload] = token.split('.');
  if (!payload) throw new Error('Token credential tidak valid');
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw new Error('Token credential tidak bisa dibaca');
  }
}

export function validateCredentialJwt(token: string): DecodedCredentialToken {
  const payload = decodeJwtPayload(token);
  const accountId =
    payload.accountId
    || payload.account_id
    || payload.accountID
    || payload.userId
    || payload.user_id
    || payload.userid
    || payload.uid
    || payload.employeeId
    || payload.employee_id
    || payload.sub;
  const exp = Number(payload.exp);

  if (!accountId) throw new Error('Token credential tidak memiliki accountId');
  if (!exp) throw new Error('Token credential tidak memiliki exp');
  if (exp * 1000 <= Date.now()) throw new Error('Token credential sudah expired');

  return { accountId: String(accountId), exp };
}

function extractError(result: any) {
  if (!result || typeof result !== 'object') return undefined;
  if (Array.isArray(result.errors)) return result.errors.join(', ');
  return result.errors || result.message || result.error;
}

export async function loginExternal(username: string, password: string) {
  const { externalLoginBaseUrl, loginPath, loginTokenSource } = await getAuthConfig();
  const response = await fetch(buildUrl(externalLoginBaseUrl, loginPath).toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    cache: 'no-store',
  });

  const result = await parseResponse(response);
  const token = extractToken(result, response, loginTokenSource) || extractToken(result, response);

  if (!response.ok || !token) {
    throw new AuthUpstreamError('katalis-login', response.status, extractError(result) || 'Login gagal');
  }

  return token;
}

export async function checkKatalisCredential(loginToken: string) {
  const { authValidationBaseUrl, credentialCheckPath, credentialTokenSource } = await getAuthConfig();
  const response = await fetch(buildUrl(authValidationBaseUrl, credentialCheckPath).toString(), {
    method: 'GET',
    headers: { Authorization: `Bearer ${loginToken}` },
    cache: 'no-store',
  });

  const result = await parseResponse(response);
  const token = extractToken(result, response, credentialTokenSource) || extractToken(result, response) || loginToken;

  if (!response.ok || !token) {
    throw new AuthUpstreamError('katalis-credential-check', response.status, extractError(result) || 'Gagal validasi credential');
  }

  return token;
}

function pickUserRecords(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.data?.content)) return result.data.content;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.content)) return result.content;
  if (Array.isArray(result.items)) return result.items;
  if (typeof result.data === 'object' && result.data) return [result.data];
  if (typeof result === 'object') return [result];
  return [];
}

export function mapAttendanceUserToProfile(user: any): ExternalProfile {
  const source = user?.data && typeof user.data === 'object' && !Array.isArray(user.data) ? user.data : user;
  // Paperless identity contract: accountId is external_user_id and the only
  // value allowed for SSO matching. userId belongs to Attendance only.
  const accountId = source.accountId || source.account_id || source.accountID || '';
  const attendanceUserId = source.userId || source.user_id || source.userID;
  return {
    external_user_id: String(accountId),
    account_id: String(accountId),
    attendance_user_id: attendanceUserId ? String(attendanceUserId) : undefined,
    employee_no: source.identityNumber || source.employeeNo || source.employee_no || source.employeeId || source.nik,
    name: source.accountName || source.userName || source.name || source.fullName || source.employeeName || 'Unknown User',
    email: source.email,
    department_name: source.division?.name || source.department?.name || source.departmentName || source.department,
    job_title: source.position?.name || source.jobTitle || source.position,
    is_active: source.status ? ['active', 'aktif', 'enabled'].includes(String(source.status).toLowerCase()) : true,
  };
}

function paginationFrom(result: any) {
  const meta = result?.data?.page || result?.page || result?.pagination || result?.meta || {};
  const totalPages = meta.totalPages ?? meta.total_pages ?? result?.data?.totalPages ?? result?.totalPages;
  const last = meta.last ?? result?.data?.last ?? result?.last;
  return {
    totalPages: Number.isFinite(Number(totalPages)) ? Number(totalPages) : undefined,
    last: typeof last === 'boolean' ? last : undefined,
  };
}

export async function fetchAttendanceUsersPage(credentialToken: string, page: number, size: number): Promise<{ users: ExternalProfile[]; totalPages?: number; last?: boolean }> {
  const { attendanceBaseUrl, attendanceUsersPath } = await getAuthConfig();
  const url = buildUrl(attendanceBaseUrl, attendanceUsersPath);
  url.searchParams.set('page', String(page));
  url.searchParams.set('size', String(size));

  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${credentialToken}` },
    cache: 'no-store',
  });

  const result = await parseResponse(response);
  if (!response.ok) {
    throw new AuthUpstreamError('attendance-users', response.status, extractError(result) || 'Gagal mengambil data user attendance');
  }

  const users = pickUserRecords(result).map(mapAttendanceUserToProfile).filter((user) => user.external_user_id || user.employee_no);
  return { users, ...paginationFrom(result) };
}

export async function fetchAttendanceUsers(credentialToken: string): Promise<ExternalProfile[]> {
  const page = await fetchAttendanceUsersPage(credentialToken, 0, 100);
  if (page.users.length === 0) {
    throw new AuthUpstreamError('attendance-users', 200, 'Data user attendance tidak ditemukan');
  }
  return page.users;
}

export async function fetchAttendanceUserForLogin(credentialToken: string): Promise<ExternalProfile> {
  return fetchExternalProfile(credentialToken);
}

export async function fetchExternalProfile(token: string): Promise<ExternalProfile> {
  const { attendanceBaseUrl, profilePath } = await getAuthConfig();
  const profileUrl = buildUrl(attendanceBaseUrl, profilePath);
  let response = await fetch(profileUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  // Katalis Dev exposes employee detail below `/attendance`. Keep an explicitly
  // configured non-attendance path working for deployments that provide it,
  // while recovering from the legacy path when that upstream returns 404.
  if (response.status === 404 && !profileUrl.pathname.startsWith('/attendance/')) {
    const attendanceProfileUrl = new URL(profileUrl);
    attendanceProfileUrl.pathname = `/attendance${profileUrl.pathname}`;
    response = await fetch(attendanceProfileUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
  }

  const result = await parseResponse(response);
  if (!response.ok) {
    throw new AuthUpstreamError('attendance-profile', response.status, extractError(result) || 'Gagal validasi profil user');
  }

  return mapAttendanceUserToProfile(result);
}
