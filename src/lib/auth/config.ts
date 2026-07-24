export const AUTH_COOKIE = 'device_checking_session';
export const AUTH_TTL_SECONDS = 60 * 60 * 8;

export type TokenSource = 'authorization-header' | 'body.data' | 'body';
type AppRole = 'admin' | 'pic' | 'viewer';
const APP_ROLES: AppRole[] = ['admin', 'pic', 'viewer'];

function env(name: string, fallback?: string) {
  return process.env[name] || fallback || '';
}

function envAllowEmpty(name: string, fallback?: string) {
  if (Object.prototype.hasOwnProperty.call(process.env, name)) {
    return process.env[name] ?? '';
  }
  return fallback || '';
}

async function getRuntimeValue(name: string, fallback?: string) {
  const { getSettingValue } = await import('@/lib/consul');
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const value = process.env[name]?.trim();
    if (value) return value;
    if (fallback !== undefined) return fallback;
    throw new Error(`${name} not found in environment variables for development`);
  }

  const consulValue = await getSettingValue(name);
  if (consulValue) return consulValue;

  const envValue = process.env[name]?.trim();
  if (envValue) return envValue;
  if (fallback !== undefined) return fallback;

  throw new Error(`${name} not found in Consul or environment variables`);
}

function getDefaultAppRole(): AppRole {
  const role = process.env.APP_AUTH_DEFAULT_ROLE?.trim();
  return APP_ROLES.includes(role as AppRole) ? role as AppRole : 'viewer';
}

export async function getAuthConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  const prefix = isProd ? 'PRODUCTION' : 'DEV';
  const authValidationBaseUrl = await getRuntimeValue(
    `${prefix}_AUTH_VALIDATION_BASE_URL`,
    await getRuntimeValue('EXTERNAL_AUTH_BASE_URL')
  );
  const attendanceBaseUrl = await getRuntimeValue(
    `${prefix}_ATTENDANCE_BASE_URL`,
    await getRuntimeValue(
      'EXTERNAL_AUTH_ATTENDANCE_BASE_URL',
      await getRuntimeValue('EXTERNAL_ATTENDANCE_BASE_URL', authValidationBaseUrl)
    )
  );
  const externalLoginBaseUrl = await getRuntimeValue(
    `${prefix}_AUTH_LOGIN_BASE_URL`,
    await getRuntimeValue('EXTERNAL_AUTH_LOGIN_BASE_URL', authValidationBaseUrl)
  );
  const defaultLoginPath = '/katalis/login';

  return {
    authValidationBaseUrl,
    attendanceBaseUrl,
    externalLoginBaseUrl,
    loginPath: envAllowEmpty(`${prefix}_AUTH_LOGIN_PATH`, envAllowEmpty('EXTERNAL_AUTH_LOGIN_PATH', defaultLoginPath)),
    credentialCheckPath: env(`${prefix}_AUTH_CREDENTIAL_CHECK_PATH`, env('EXTERNAL_AUTH_CREDENTIAL_CHECK_PATH', isProd ? '/katalis/user/credential/check' : '/katalis/user/credential/check')),
    loginTokenSource: env(`${prefix}_AUTH_LOGIN_TOKEN_SOURCE`, 'authorization-header') as TokenSource,
    credentialTokenSource: env(`${prefix}_AUTH_CREDENTIAL_TOKEN_SOURCE`, isProd ? 'authorization-header' : 'body') as TokenSource,
    attendanceUsersPath: env('EXTERNAL_ATTENDANCE_USERS_PATH', '/api/v1/admin/employees'),
    profilePath: env(
      `${prefix}_AUTH_PROFILE_PATH`,
      env('EXTERNAL_AUTH_PROFILE_PATH', '/attendance/api/v1/admin/employees/account/detail')
    ),
    sessionSecret: process.env.APP_SESSION_SECRET || 'device-checking-dev-secret-change-me',
    defaultRole: getDefaultAppRole(),
    autoSync: (process.env.APP_AUTH_AUTO_SYNC || 'false') === 'true',
    requiredAccessScope: process.env.APP_AUTH_REQUIRED_ACCESS_SCOPE || 'devicechecking',
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
