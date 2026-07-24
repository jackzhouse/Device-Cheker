This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Create local development env first:

```bash
cp .env.example .env.local
```

Minimum local values for Dev SSO:
- `MONGODB_URI`
- `EXTERNAL_AUTH_BASE_URL`

Browser requests use same-origin `/api/...`; no `NEXT_PUBLIC_API_BASE_URL` is required.

Production reads application configuration from Consul prefix
`new-config/support-device-checker/setting/`. Required keys: `MONGODB_URI`,
`APP_SESSION_SECRET`, and `DEV_AUTH_VALIDATION_BASE_URL` (or
`EXTERNAL_AUTH_BASE_URL`). The same key labels are used in `.env.local` for
development and Consul for production. Supported optional keys:

```text
MONGODB_DB_NAME
DEV_AUTH_VALIDATION_BASE_URL
DEV_AUTH_LOGIN_BASE_URL
DEV_AUTH_LOGIN_PATH
DEV_AUTH_CREDENTIAL_CHECK_PATH
DEV_AUTH_LOGIN_TOKEN_SOURCE
DEV_AUTH_CREDENTIAL_TOKEN_SOURCE
EXTERNAL_AUTH_LOGIN_BASE_URL
EXTERNAL_AUTH_LOGIN_PATH
EXTERNAL_AUTH_CREDENTIAL_CHECK_PATH
EXTERNAL_AUTH_ATTENDANCE_BASE_URL
EXTERNAL_ATTENDANCE_BASE_URL
EXTERNAL_ATTENDANCE_USERS_PATH
EXTERNAL_AUTH_USERS_PATH
EXTERNAL_AUTH_PROFILE_PATH
APP_AUTH_DEFAULT_ROLE
APP_AUTH_AUTO_SYNC
APP_AUTH_REQUIRED_ACCESS_SCOPE
```

Only `NODE_ENV` plus Consul connection bootstrap (`CONSUL_HOST`, `CONSUL_PORT`,
`CONSUL_TOKEN`) stay in container environment variables.

If Dev login must hit root host directly, keep:
- `DEV_AUTH_LOGIN_PATH=`

Auth host rule:
- Development login uses `DEV_AUTH_LOGIN_BASE_URL`, then `EXTERNAL_AUTH_LOGIN_BASE_URL`, then `EXTERNAL_AUTH_BASE_URL`
- Development credential validation uses `EXTERNAL_AUTH_BASE_URL`
- Development employee detail and user sync use `DEV_ATTENDANCE_BASE_URL` when set, otherwise `EXTERNAL_AUTH_ATTENDANCE_BASE_URL`, `EXTERNAL_ATTENDANCE_BASE_URL`, then auth validation base
- Production login uses login auth base URL from Consul/env when set, otherwise falls back to validation auth base URL
- Attendance employee detail uses `/attendance/api/v1/admin/employees/account/detail` by default. For Dev Katalis, set `DEV_AUTH_PROFILE_PATH` or `EXTERNAL_AUTH_PROFILE_PATH` to this path.
- If legacy config still uses `/api/v1/admin/employees/account/detail`, SSO retries once with `/attendance` prefix after external `404`.

Login token source:
- Default login token source is `Authorization` header

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Internal User/Auth APIs

- `POST /api/auth/login` runs external login, credential check, Attendance employee detail, JWT `accountId`/`exp` validation, local AppUser active/access validation, then creates the app session.
- `GET /api/auth/external-config` returns non-secret external login and credential-check URLs for browser external-first login.
- `POST /api/auth/sso` accepts final external Bearer token, validates employee detail and matching `accountId`, then creates the app session cookie.

SSO identity key: JWT `accountId` must equal employee-detail `accountId`, stored locally as `AppUser.externalUserId`. Employee-detail `userId` is stored only as `AppUser.attendanceUserId`; it is never used for SSO matching.

Data ownership:
- `appusers` owns login identity, role, access scopes, active policy, and Attendance `userId`.
- `employees` owns karyawan/device-check directory data used by forms, autocomplete, and check history.
- `AppUser.employeeId` is optional. SSO and user sync link it to an existing Employee by NIK/employee number or `accountId`; they do not create Employee records.

SSO provisioning: if `AppUser.externalUserId` is missing, SSO creates only the local AppUser with `APP_AUTH_DEFAULT_ROLE` (`admin`, `pic`, or `viewer`; empty/invalid falls back to `viewer`) and default access, links an existing Employee when found, then creates the session. Existing AppUser continues after local active/access validation without role overwrite.
- `GET /api/users-roles` lists AppUser records for Pengelolaan User with search, role, department, and status filters.
- `GET /api/users-roles/:id` returns one AppUser detail.
- `PATCH /api/users-roles/:id` updates selected local fields: `name`, `email`, `departmentName`, `jobTitle`, `isActive`, `role`, and `accessScopes`.
- `PATCH /api/users-roles/:id/role` remains for backward-compatible role-only updates.
- `POST /api/users-roles/sync` starts a protected Attendance AppUser sync job from User & Role. Frontend automatically sends Katalis credential/check token as `Authorization: Bearer <token>`; HTTP-only session is fallback. Body may include `{ "size": 100 }`. It validates token identity upstream, writes `appusers` only, uses `APP_AUTH_DEFAULT_ROLE` only for new AppUser rows, preserves existing roles, and does not change Employee directory data.
- `GET /api/users-roles/sync/:id` returns AppUser sync progress and safe summary counts.
- `POST /api/employees/sync` starts a protected Attendance Employee sync job from Karyawan. Frontend automatically sends Katalis credential/check token as `Authorization: Bearer <token>`; HTTP-only session is fallback. Body may include `{ "size": 100 }`. It validates token identity upstream, then writes `employees` only and does not change login role/access.
- `GET /api/employees/sync/:id` returns Employee sync progress and safe summary counts.
