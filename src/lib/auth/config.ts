export const AUTH_COOKIE = 'device_checking_session';
export const AUTH_TTL_SECONDS = 60 * 60 * 8;

export type TokenSource = 'authorization-header' | 'body.data' | 'body';
type AppRole = 'admin' | 'pic' | 'viewer';
const APP_ROLES: AppRole[] = ['admin', 'pic', 'viewer'];

async function getRuntimeValue(names: string[], fallback?: string, allowEmpty = false) {
  const { getSettingValue } = await import('@/lib/consul');
  const isProd = process.env.NODE_ENV === 'production';

  for (const name of names) {
    const value = isProd
      ? await getSettingValue(name)
      : Object.prototype.hasOwnProperty.call(process.env, name)
        ? process.env[name]?.trim() ?? ''
        : null;

    if (value !== null && (allowEmpty || value !== '')) return value;
  }

  if (fallback !== undefined) return fallback;
  throw new Error(`${names.join(' or ')} not found in ${isProd ? 'Consul' : 'environment variables for development'}`);
}

async function getDefaultAppRole(): Promise<AppRole> {
  const role = await getRuntimeValue(['APP_AUTH_DEFAULT_ROLE'], 'viewer');
  return APP_ROLES.includes(role as AppRole) ? role as AppRole : 'viewer';
}

export async function getAuthConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const authValidationBaseUrl = await getRuntimeValue(
    ['DEV_AUTH_VALIDATION_BASE_URL', 'EXTERNAL_AUTH_BASE_URL']
  );
  const attendanceBaseUrl = await getRuntimeValue(
    ['EXTERNAL_AUTH_ATTENDANCE_BASE_URL', 'EXTERNAL_ATTENDANCE_BASE_URL'],
    authValidationBaseUrl
  );
  const externalLoginBaseUrl = await getRuntimeValue(
    ['DEV_AUTH_LOGIN_BASE_URL', 'EXTERNAL_AUTH_LOGIN_BASE_URL'],
    authValidationBaseUrl
  );
  const defaultLoginPath = '/katalis/login';

  return {
    authValidationBaseUrl,
    attendanceBaseUrl,
    externalLoginBaseUrl,
    loginPath: await getRuntimeValue(['DEV_AUTH_LOGIN_PATH', 'EXTERNAL_AUTH_LOGIN_PATH'], defaultLoginPath, true),
    credentialCheckPath: await getRuntimeValue(['DEV_AUTH_CREDENTIAL_CHECK_PATH', 'EXTERNAL_AUTH_CREDENTIAL_CHECK_PATH'], '/katalis/user/credential/check'),
    loginTokenSource: await getRuntimeValue(['DEV_AUTH_LOGIN_TOKEN_SOURCE'], 'authorization-header') as TokenSource,
    credentialTokenSource: await getRuntimeValue(['DEV_AUTH_CREDENTIAL_TOKEN_SOURCE'], isProd ? 'authorization-header' : 'body') as TokenSource,
    attendanceUsersPath: await getRuntimeValue(['EXTERNAL_ATTENDANCE_USERS_PATH', 'EXTERNAL_AUTH_USERS_PATH'], '/api/v1/admin/employees'),
    profilePath: await getRuntimeValue(['EXTERNAL_AUTH_PROFILE_PATH'], '/attendance/api/v1/admin/employees/account/detail'),
    sessionSecret: await getRuntimeValue(['APP_SESSION_SECRET'], isProd ? undefined : 'device-checking-dev-secret-change-me'),
    defaultRole: await getDefaultAppRole(),
    autoSync: (await getRuntimeValue(['APP_AUTH_AUTO_SYNC'], 'false')) === 'true',
    requiredAccessScope: await getRuntimeValue(['APP_AUTH_REQUIRED_ACCESS_SCOPE'], 'devicechecking'),
  };
}

export async function getExternalBrowserAuthConfig() {
  const {
    externalLoginBaseUrl,
    loginPath,
    authValidationBaseUrl,
    credentialCheckPath,
  } = await getAuthConfig();

  return {
    loginBaseUrl: externalLoginBaseUrl,
    loginPath,
    validationBaseUrl: authValidationBaseUrl,
    credentialCheckPath,
  };
}
