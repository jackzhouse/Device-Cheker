const mongoose = require('mongoose');

const DEFAULT_ATTENDANCE_USERS_PATH = '/attendance/api/v1/user/employees?page=0&size=1';
const ROLES = ['admin', 'pic', 'viewer'];

const AppUserSchema = new mongoose.Schema({
  externalUserId: { type: String, required: true, unique: true, index: true },
  employeeNo: { type: String, trim: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  departmentName: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ROLES, default: 'viewer', index: true },
  lastSyncedAt: { type: Date },
}, { timestamps: true });

const AppUser = mongoose.models.AppUser || mongoose.model('AppUser', AppUserSchema);

function normalizeBearerToken(token) {
  return token?.replace(/^Bearer\s+/i, '').trim() || undefined;
}

function getDefaultAppRole() {
  const role = process.env.APP_AUTH_DEFAULT_ROLE?.trim();
  return ROLES.includes(role) ? role : 'viewer';
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractError(result) {
  if (!result || typeof result !== 'object') return undefined;
  if (Array.isArray(result.errors)) return result.errors.join(', ');
  return result.errors || result.message || result.error;
}

function pickUserRecords(result) {
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

function mapAttendanceUser(user) {
  return {
    externalUserId: String(user.accountId || user.identityId || user.userId || user.id || user.employeeId || user.identityNumber || ''),
    employeeNo: user.identityNumber || user.employeeNo || user.employee_no || user.employeeId || user.nik,
    name: user.accountName || user.userName || user.name || user.fullName || user.employeeName || 'Unknown User',
    email: user.email,
    departmentName: user.division?.name || user.department?.name || user.departmentName || user.department,
    jobTitle: user.position?.name || user.jobTitle || user.position,
    isActive: user.status ? ['active', 'aktif', 'enabled'].includes(String(user.status).toLowerCase()) : true,
  };
}

function hasChanges(appUser, fields) {
  return appUser.externalUserId !== fields.externalUserId
    || appUser.employeeNo !== fields.employeeNo
    || appUser.name !== fields.name
    || appUser.email !== fields.email
    || appUser.departmentName !== fields.departmentName
    || appUser.jobTitle !== fields.jobTitle
    || appUser.isActive !== fields.isActive;
}

async function fetchAttendanceUsers(credentialToken) {
  const baseUrl = process.env.EXTERNAL_AUTH_BASE_URL || 'https://api.teknologikartu.com';
  const usersPath = process.env.EXTERNAL_AUTH_USERS_PATH || DEFAULT_ATTENDANCE_USERS_PATH;
  const response = await fetch(`${baseUrl}${usersPath}`, {
    headers: { Authorization: `Bearer ${credentialToken}` },
    cache: 'no-store',
  });

  const result = await parseResponse(response);
  if (!response.ok) {
    throw new Error(`attendance-users failed (${response.status}): ${extractError(result) || 'Gagal mengambil data user attendance'}`);
  }

  return pickUserRecords(result).map(mapAttendanceUser).filter((user) => user.externalUserId || user.employeeNo);
}

async function syncUser(profile) {
  const defaultRole = getDefaultAppRole();
  const fields = {
    externalUserId: profile.externalUserId || profile.employeeNo || profile.name,
    employeeNo: profile.employeeNo,
    name: profile.name || profile.employeeNo || 'Unknown User',
    email: profile.email,
    departmentName: profile.departmentName,
    jobTitle: profile.jobTitle,
    isActive: profile.isActive,
  };

  let appUser = await AppUser.findOne({ externalUserId: fields.externalUserId });
  if (!appUser && fields.employeeNo) {
    appUser = await AppUser.findOne({ employeeNo: fields.employeeNo });
  }

  if (!appUser) {
    await AppUser.create({
      ...fields,
      role: defaultRole,
      lastSyncedAt: new Date(),
    });
    return 'created';
  }

  if (!hasChanges(appUser, fields)) {
    return 'skipped';
  }

  Object.assign(appUser, fields, { lastSyncedAt: new Date() });
  await appUser.save();
  return 'updated';
}

async function main() {
  const credentialToken = normalizeBearerToken(process.env.ATTENDANCE_CREDENTIAL_TOKEN);
  const mongoUri = process.env.MONGODB_URI;
  const mongoDbName = process.env.MONGODB_DB_NAME?.trim();

  if (!credentialToken) {
    throw new Error('ATTENDANCE_CREDENTIAL_TOKEN wajib diisi');
  }

  if (!mongoUri) {
    throw new Error('MONGODB_URI wajib diisi');
  }

  await mongoose.connect(mongoUri, mongoDbName ? { dbName: mongoDbName } : undefined);
  const users = await fetchAttendanceUsers(credentialToken);
  const summary = { created: 0, updated: 0, skipped: 0, failed: 0, errors: [] };

  for (const user of users) {
    try {
      const status = await syncUser(user);
      summary[status] += 1;
    } catch (error) {
      summary.failed += 1;
      summary.errors.push(error instanceof Error ? error.message : 'Unknown sync error');
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
