# TECHNICAL DESIGN — GENERAL AUTH, DASHBOARD ACCESS, USER ROLE MANAGEMENT, AND EXTERNAL USER MIGRATION

> Version 1.0
> Tujuan: jadi acuan implementasi aplikasi lain dengan flow login → validasi user → session → dashboard → user & role management → migrasi user dari sistem eksternal.
> Sifat: general, reusable, agent-ready.

---

## 1. SCOPE

Dokumen ini menjelaskan desain teknis untuk:
- login dari aplikasi frontend ke sistem eksternal identity source
- token handoff ke backend aplikasi target
- validasi identitas dan sinkronisasi user internal
- pembentukan session aplikasi
- penentuan role, permission, navigation, dan landing dashboard
- alur user & role management
- migrasi dan sinkronisasi user/division dari sistem eksternal seperti Absensi

Dokumen ini sengaja dibuat general supaya bisa dipakai di aplikasi lain.

Yang bisa diganti per project:
- nama sistem eksternal identity source
- role names
- permission matrix
- halaman dashboard dan modul
- struktur organisasi: division/department/team
- token format dan endpoint external auth

---

## 2. DESIGN GOALS

Target desain:
- satu flow login yang konsisten untuk web app internal
- external identity tetap jadi source of truth untuk identitas dasar
- aplikasi target tetap punya local user registry untuk role dan permission domain-specific
- session frontend ringan, aman, dan mudah di-rehydrate
- role-based landing dan navigation bisa diimplementasikan tanpa hardcode berulang
- user sync bisa jalan manual, terjadwal, atau auto-sync saat login
- AI agent bisa eksekusi implementasi berdasarkan dokumen ini tanpa banyak asumsi tambahan

---

## 3. HIGH-LEVEL ARCHITECTURE

```text
[Frontend App]
    |
    | 1. Login username/password
    v
[External Identity System]
    |
    | 2. Return external access token
    v
[Frontend App]
    |
    | 3. POST token to app backend bridge
    v
[App Backend]
    |
    | 4. Decode token claims
    | 5. Validate token by calling external identity profile endpoint
    | 6. Match external account with local app user
    | 7. Load role + permissions
    v
[App Database]
    |
    | 8. Return app auth payload
    v
[Frontend App]
    |
    | 9. Persist session and route by role
    v
[Dashboard / Workspace]
```

Core principle:
- external system owns authentication truth
- target app owns authorization truth

---

## 4. CORE DOMAIN MODEL

### 4.1 External User Snapshot

Data minimal dari sistem eksternal:

```ts
interface ExternalUserSnapshot {
  external_user_id: string
  employee_no?: string
  name: string
  email?: string
  department_id?: string
  department_name?: string
  job_title?: string
  manager_external_id?: string
  is_active: boolean
}
```

### 4.2 Internal App User

Data minimal di aplikasi target:

```ts
interface AppUser {
  id: string
  external_user_id: string
  employee_no?: string
  name: string
  email?: string
  department_id?: string
  department_name?: string
  job_title?: string
  manager_external_id?: string
  is_active: boolean
  last_synced_at?: string
}
```

### 4.3 Role Assignment

```ts
type UserRole =
  | "super_admin"
  | "admin"
  | "approver"
  | "respondent"
  | "manager"

interface RoleAssignment {
  user_id: string
  role: UserRole
  assigned_by?: string
  assigned_at: string
}
```

### 4.4 Permission Model

Permission tetap domain-specific. Role hanya container.

Contoh general:

```ts
type Permission =
  | "create"
  | "view"
  | "submit"
  | "edit"
  | "publish"
  | "manage_access"
  | "view_submissions"
  | "export_submissions"
  | "manage_workflow"
  | "export_document"
  | "view_audit_logs"
```

### 4.5 Auth Payload ke Frontend

```ts
interface AuthUser {
  id: string
  external_user_id: string
  employee_no?: string
  name: string
  email?: string
  department_id?: string
  department_name?: string
  job_title?: string
  role: UserRole
  permissions: Permission[]
  exp: number
}
```

---

## 5. LOGIN FLOW — END TO END

## 5.1 Step-by-Step Summary

```text
1. User submit username + password di frontend
2. Frontend call external auth login endpoint
3. External system return external token
4. Frontend kirim token ke backend app via auth bridge endpoint
5. Backend decode token claim minimum: account id + exp
6. Backend call external profile endpoint untuk validasi token
7. Backend pastikan account id token cocok dengan external profile
8. Backend cari local app user by external_user_id
9. Jika belum ada dan auto-sync login aktif: upsert user + assign default role
10. Backend pastikan user aktif dan role sudah ada
11. Backend return auth payload + set secure app session cookie
12. Frontend simpan user session ringan dan redirect ke landing page role
```

---

## 5.2 Frontend Login Flow

### Input
- username
- password

### API sequence

```text
Frontend -> External Auth API: POST /auth/login
External Auth API -> Frontend: access_token
Frontend -> App Backend: POST /auth/sso { external_token }
App Backend -> Frontend: { access_token, expires_at, user }
```

### Recommended frontend logic

```ts
async function login(username: string, password: string) {
  const externalToken = await externalAuthLogin(username, password)
  const authPayload = await appBridgeLogin(externalToken)

  persistSession({
    user: authPayload.user,
    externalToken: authPayload.access_token,
    expiresAt: authPayload.expires_at,
  })

  redirect(getRoleLandingPath(authPayload.user.role))
}
```

### Frontend persistence

Simpan minimal:
- serialized user session
- external access token bila app masih perlu panggil backend dengan bearer token
- app session cookie bila backend pakai cookie-based bridge

Recommended browser storage:
- `HttpOnly cookie` untuk token utama bila memungkinkan
- `sessionStorage` untuk cached user payload
- `localStorage` hanya untuk non-sensitive UX preference

Jangan simpan:
- password
- raw refresh token di storage publik bila tidak wajib

---

## 5.3 Backend Auth Bridge Flow

Bridge endpoint general:

```http
POST /api/v1/auth/sso
Content-Type: application/json

{
  "external_token": "<token-from-external-system>"
}
```

Response general:

```json
{
  "access_token": "<normalized-token-or-app-token>",
  "expires_at": "2026-05-15T18:00:00Z",
  "user": {
    "id": "uuid",
    "external_user_id": "ext-001",
    "employee_no": "EMP001",
    "name": "User Name",
    "department_id": "ops",
    "department_name": "Operations",
    "job_title": "Manager",
    "role": "manager",
    "permissions": ["view", "submit", "view_submissions"],
    "exp": 1770000000
  }
}
```

### Backend validation stages

#### Stage 1 — Normalize token
- trim bearer prefix bila ada
- reject malformed token

#### Stage 2 — Decode basic claims
Ambil minimal:
- `accountId` atau subject identifier sejenis
- `exp`

Reject bila:
- token invalid
- token missing subject id
- token expired

#### Stage 3 — Validate token against external profile endpoint
Backend wajib cross-check token ke external source.

Tujuan:
- cegah token palsu / stale
- ambil latest employee snapshot
- validasi user status dan data org terbaru

#### Stage 4 — Match token subject with returned profile

```text
if token.accountId != externalProfile.external_user_id:
    reject 401
```

#### Stage 5 — Resolve internal app user
Cari by `external_user_id`.

Possible result:
- user found
- user not found + auto-sync enabled
- user not found + auto-sync disabled

#### Stage 6 — Resolve role assignment
Possible result:
- role found
- role missing

#### Stage 7 — Build auth user payload
Inject:
- role
- permission list
- exp from token

---

## 5.4 Auth Error Matrix

| Condition | HTTP | Message Recommendation |
|---|---:|---|
| malformed token | 401 | Token external tidak valid |
| expired token | 401 | Token external kedaluwarsa |
| token/profile mismatch | 401 | Token tidak cocok dengan data profile |
| external validation unavailable | 503 | Layanan validasi identity sedang bermasalah |
| user not synced | 403 | User belum tersinkron, hubungi admin |
| user inactive | 403 | User tidak aktif |
| role not assigned | 403 | Role aplikasi belum ditetapkan |
| role manager forbidden | 403 | Tidak punya akses kelola role |

Frontend behavior:
- 401: force logout / kembali ke login
- 403: tampilkan access problem message
- 503: tampilkan retry-friendly service unavailable state

---

## 6. SESSION DESIGN

## 6.1 Recommended Session Contract

App session bisa memakai salah satu:

### Option A — External token passthrough
Backend menerima dan mengembalikan token external yang sudah tervalidasi.

Cocok bila:
- app backend tidak perlu issue JWT sendiri
- external token cukup untuk semua auth context
- durasi token sudah sesuai

### Option B — App token wrapping external identity
Backend issue app JWT sendiri setelah validasi external identity.

Cocok bila:
- app butuh claims internal tambahan
- app butuh session revocation sendiri
- app butuh guard antarmodule lebih ketat

Dokumen ini kompatibel untuk dua model.

## 6.2 Minimal session data

```ts
interface AppSession {
  user: AuthUser
  token: string
  expires_at: string
}
```

## 6.3 Session lifecycle

```text
login -> persist session -> access dashboard -> refresh/revalidate me endpoint -> logout -> clear cookie/storage/cache
```

Logout wajib clear:
- auth cookie
- in-memory auth state
- query cache
- account-scoped tab/filter state bila app mensyaratkan reset penuh

---

## 7. DASHBOARD ACCESS FLOW

## 7.1 Landing Page Resolution

Setelah login sukses, route user ke landing page berdasarkan role.

Contoh mapping general:

```ts
const roleLandingPaths = {
  super_admin: "/dashboard",
  admin: "/workspace",
  approver: "/approvals",
  respondent: "/dashboard",
  manager: "/submissions"
}
```

Rule:
- landing role harus dekat dengan pekerjaan utama role
- jangan selalu lempar semua user ke satu dashboard bila kebutuhan role beda jauh

## 7.2 Navigation Resolution

Navigation item ditentukan oleh:
- role allowlist
- permission allowlist

Model general:

```ts
interface NavItem {
  href: string
  label: string
  roles?: UserRole[]
  permission?: Permission
}
```

Evaluation:

```ts
function getAllowedNavItems(user: AuthUser, items: NavItem[]) {
  return items.filter(item => {
    const roleAllowed = !item.roles || item.roles.includes(user.role)
    const permissionAllowed = !item.permission || user.permissions.includes(item.permission)
    return roleAllowed && permissionAllowed
  })
}
```

## 7.3 Path Access Guard

Frontend guard tidak cukup. Backend authorization tetap wajib.

Layers:
- router/layout guard di frontend
- button/action visibility di UI
- backend endpoint permission check

Flow:

```text
1. User buka path
2. Frontend cek session exist
3. Frontend cek canAccessPath(user, path)
4. Jika gagal -> redirect no-access atau landing role
5. Jika lolos -> render page
6. Saat API dipanggil, backend cek role/permission lagi
```

## 7.4 Dashboard Data Loading

Dashboard API idealnya role-aware.

Contoh:
- respondent: my submissions, available forms, revision requests
- approver: pending approvals, SLA alerts
- manager: team submissions, bottlenecks
- admin: app health, usage, forms, approvals

Jangan pakai satu payload raksasa untuk semua role jika datanya jauh berbeda.

---

## 8. `GET /auth/me` FLOW

Endpoint ini penting untuk:
- session rehydration saat refresh browser
- backend trust check
- silent recovery setelah login

Recommended behavior:

```text
1. Read bearer token atau secure cookie
2. Validate token shape and expiry
3. Validate token against external profile endpoint
4. Resolve local app user
5. Resolve role assignment
6. Return AuthUser payload
```

Contoh response:

```json
{
  "id": "uuid",
  "external_user_id": "ext-001",
  "employee_no": "EMP001",
  "name": "User Name",
  "department_id": "ops",
  "department_name": "Operations",
  "job_title": "Manager",
  "role": "manager",
  "permissions": ["view", "submit", "view_submissions"],
  "exp": 1770000000
}
```

Frontend rehydrate flow:

```ts
async function resolveCurrentSessionUserFromToken() {
  const response = await fetch('/api/v1/auth/me', { credentials: 'include' })
  if (!response.ok) return null
  const user = await response.json()
  persistUserCache(user)
  return user
}
```

---

## 9. USER & ROLE MANAGEMENT FLOW

## 9.1 Purpose

Sistem eksternal mengelola identitas dasar.
Aplikasi target mengelola otorisasi aplikasi.

Maka user management di aplikasi target bukan untuk:
- membuat password baru
- mengubah username external
- mengubah data identitas master external

User management di aplikasi target dipakai untuk:
- melihat directory user sinkron
- menetapkan role aplikasi
- bulk assign role per division/department
- audit perubahan role
- filter user by role/division/job

---

## 9.2 Directory Listing Flow

Endpoint general:

```http
GET /api/v1/users
Authorization: Bearer <token>
```

Response:

```json
{
  "users": [
    {
      "id": "uuid",
      "external_user_id": "ext-001",
      "employee_no": "EMP001",
      "name": "User Name",
      "department_id": "ops",
      "department_name": "Operations",
      "job_title": "Manager",
      "is_active": true,
      "last_synced_at": "2026-05-15T10:00:00Z",
      "role": "manager"
    }
  ]
}
```

Frontend UI pattern:
- search by name, employee id, department, job
- filter by division
- filter by job title
- filter by role
- pagination bila directory besar

---

## 9.3 Update Single User Role Flow

Endpoint general:

```http
PUT /api/v1/users/{user_id}/role
Content-Type: application/json

{
  "role": "approver"
}
```

Rules:
- hanya role manager tertentu boleh akses
- non-super admin tidak boleh assign `super_admin`
- perubahan role harus tercatat di audit log

Backend flow:

```text
1. Authenticate caller
2. Check caller allowed as role manager
3. Check target role assignment allowed
4. Check target user exists
5. Read previous role
6. Save new role assignment
7. Write audit log
8. Return ok
```

Audit log minimal:
- actor id
- actor role
- target user id
- target user label
- previous role
- next role
- timestamp

---

## 9.4 Bulk Role Update by Division Flow

Endpoint general:

```http
PUT /api/v1/users/roles/by-division
Content-Type: application/json

{
  "department_id": "ops",
  "role": "approver"
}
```

Use case:
- satu divisi baru perlu akses approver
- onboarding besar setelah migration

Backend flow:

```text
1. Authenticate caller
2. Check caller role manager
3. Check requested role allowed
4. Query all users with department_id
5. Assign role to all matched users
6. Write bulk audit log
7. Return updated count
```

Response:

```json
{
  "updated": 42,
  "role": "approver"
}
```

---

## 10. ROLE GOVERNANCE MODEL

## 10.1 Recommended separation

Pisahkan:
- identity data
- role assignment
- permission resolver

Jangan embed seluruh permission manual ke setiap row user.

Recommended:
- table `users`
- table `role_assignments`
- function `permissions_for_role(role)`

## 10.2 Why
- permission change cukup update mapping role
- lebih mudah audit dan test
- lebih kecil risiko drift data

## 10.3 Example permission resolution

```ts
const rolePermissions = {
  super_admin: ["*"],
  admin: ["create", "view", "submit", "edit", "publish", "manage_access", "view_submissions", "export_submissions", "manage_workflow", "export_document"],
  approver: ["view", "submit", "view_submissions", "export_document"],
  respondent: ["view", "submit"],
  manager: ["view", "submit", "view_submissions", "export_submissions", "export_document"],
}
```

---

## 11. EXTERNAL USER MIGRATION DESIGN

## 11.1 Migration Modes

### Mode A — Full bootstrap sync
Dipakai saat aplikasi baru go-live.

Flow:
- sync semua divisions
- sync semua users
- assign default role ke semua user
- admin review dan refine role setelah bootstrap

### Mode B — Incremental scheduled sync
Dipakai setelah sistem jalan.

Flow:
- scheduler jalan setiap X menit/jam
- update user master fields dari external source
- jangan overwrite role assignment lokal

### Mode C — Auto-sync on login
Dipakai untuk mengurangi friction user baru.

Flow:
- user login
- local user belum ada
- backend auto-create internal user dari external profile
- assign default role, misal `respondent`

Best practice:
- bootstrap sync + scheduled sync = baseline
- auto-sync login = optional convenience layer

---

## 11.2 Data Ownership Rules

### External source owns
- external_user_id
- employee_no
- name
- email
- department_id
- department_name
- job_title
- manager_external_id
- is_active

### App owns
- internal user id
- role assignment
- permission resolution
- app-specific flags jika ada
- audit history

Rule penting:
- sync dari external source tidak boleh overwrite role assignment app
- role assignment hanya berubah lewat admin action atau role policy engine internal

---

## 11.3 Migration Script Contract

Script general:

```text
sync_external_users
```

Input support:
- `EXTERNAL_SYNC_TOKEN`, atau
- `EXTERNAL_SYNC_USERNAME` + `EXTERNAL_SYNC_PASSWORD`

Flow:

```text
1. Load app config
2. Build DB connection
3. Resolve external access token
4. Sync divisions first
5. Sync users second
6. Upsert by external_user_id
7. Ensure default role for users without role
8. Print summary counts
```

Pseudo-code:

```py
async def run_sync():
    token = get_external_token()
    sync_divisions(token)
    users = sync_users(token)
    print_summary(users)
```

---

## 11.4 Upsert Rules

User upsert key:
- `external_user_id`

Division upsert key:
- `department_id` atau external division id

On user upsert:
- update identity fields
- update active status
- update latest org info
- set `last_synced_at`
- do not overwrite app role

On default role:
- only assign bila user belum punya role
- default role umum: `respondent`

---

## 11.5 Migration Failure Handling

Failure classes:
- external login gagal
- external API timeout
- malformed external payload
- DB unavailable
- duplicate identity data aneh

Recommended behavior:
- fail fast untuk bootstrap
- partial retry untuk scheduled sync
- log ringkas tapi cukup investigasi
- jangan silently skip banyak user tanpa summary

Minimal sync summary:
- total divisions fetched
- total users fetched
- total created
- total updated
- total default-role-assigned
- total failed

---

## 12. RECOMMENDED DATABASE TABLES

## 12.1 `users`

```sql
users (
  id uuid primary key,
  external_user_id varchar unique not null,
  employee_no varchar null,
  name varchar not null,
  email varchar null,
  department_id varchar null,
  department_name varchar null,
  job_title varchar null,
  manager_external_id varchar null,
  is_active boolean not null default true,
  last_synced_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

## 12.2 `divisions`

```sql
divisions (
  id varchar primary key,
  name varchar not null,
  description varchar null,
  company_id varchar null,
  last_synced_at timestamptz null,
  created_at timestamptz not null,
  updated_at timestamptz not null
)
```

## 12.3 `role_assignments`

```sql
role_assignments (
  user_id uuid primary key references users(id),
  role varchar not null,
  assigned_by uuid null,
  assigned_at timestamptz not null
)
```

## 12.4 `audit_logs`

```sql
audit_logs (
  id uuid primary key,
  actor_user_id uuid null,
  module varchar not null,
  action varchar not null,
  resource_type varchar not null,
  resource_id varchar not null,
  resource_label varchar null,
  metadata jsonb null,
  diff jsonb null,
  created_at timestamptz not null
)
```

---

## 13. API DESIGN REFERENCE

## 13.1 Auth APIs

### `POST /api/v1/auth/sso`
Purpose:
- terima external token
- validasi identity
- return auth payload aplikasi

### `GET /api/v1/auth/me`
Purpose:
- session rehydration
- trust check
- refresh identity snapshot flow

### `POST /api/v1/auth/logout`
Purpose:
- clear app cookie/session

---

## 13.2 User Directory APIs

### `GET /api/v1/users`
Purpose:
- load user directory untuk role managers

### `GET /api/v1/users/divisions`
Purpose:
- load division reference untuk filter dan bulk role update

### `PUT /api/v1/users/{user_id}/role`
Purpose:
- update role satu user

### `PUT /api/v1/users/roles/by-division`
Purpose:
- assign role massal by division

---

## 14. CONFIGURATION MODEL

Recommended config keys:

```yaml
app:
  name: Generic Internal App
  api_prefix: /api/v1

public:
  frontend_base_url: http://localhost:3000
  backend_cors_origins:
    - http://localhost:3000
    - http://127.0.0.1:3000

external_identity:
  base_url: https://identity.example.com
  jwt_secret: change-me
  jwt_algorithm: HS256

app_auth:
  auto_sync_login: false
  access_token_minutes: 480

external_sync:
  username: null
  password: null

database:
  url: postgresql://...
```

Rules:
- `auto_sync_login=false` lebih aman untuk production awal
- aktifkan auto-sync hanya bila governance user onboarding sudah jelas
- CORS harus isi origin browser frontend, bukan nama service container internal

---

## 15. SECURITY NOTES

### Required
- backend tetap validate token ke external profile endpoint, jangan percaya decode local saja
- jangan percaya frontend role claim
- backend endpoint role management harus cek permission internal
- logout wajib clear cookie/session/cache
- audit log wajib untuk perubahan role
- jangan overwrite role assignment saat sync user external

### Strongly recommended
- rate limit login bridge
- structured logging untuk external validation failure
- redact token dari logs
- timeouts untuk external API
- retry terbatas hanya untuk read endpoint, bukan role write endpoint

### Optional hardening
- app-issued JWT wrapper
- session revocation list
- admin approval untuk privilege escalation role
- SCIM-style sync bila external system support

---

## 16. OBSERVABILITY

Minimal log event yang disarankan:
- `external_login_failed`
- `external_validation_failed`
- `external_validation_unavailable`
- `user_auto_synced_on_login`
- `user_role_changed`
- `user_role_changed_bulk`
- `sync_external_users_completed`
- `sync_external_users_failed`

Metrics yang berguna:
- login success rate
- login 401/403/503 count
- external validation latency
- sync duration
- users created/updated per sync
- role changes per day

---

## 17. AI AGENT IMPLEMENTATION CHECKLIST

## 17.1 Backend checklist
- [ ] buat module auth bridge
- [ ] buat endpoint `POST /auth/sso`
- [ ] buat endpoint `GET /auth/me`
- [ ] implement token normalize + decode + expiry check
- [ ] implement external profile validation client
- [ ] implement local user repository by `external_user_id`
- [ ] implement role assignment repository
- [ ] implement `permissions_for_role(role)`
- [ ] implement `GET /users`
- [ ] implement `GET /users/divisions`
- [ ] implement `PUT /users/{id}/role`
- [ ] implement `PUT /users/roles/by-division`
- [ ] implement audit log for role changes
- [ ] implement sync service for divisions and users
- [ ] implement bootstrap sync script
- [ ] add tests for auth and role guard cases

## 17.2 Frontend checklist
- [ ] buat login page
- [ ] call external auth login endpoint
- [ ] call app bridge login endpoint
- [ ] persist session safely
- [ ] implement auth provider/context
- [ ] implement role landing path resolver
- [ ] implement navigation resolver
- [ ] implement path access guard
- [ ] implement session rehydrate via `/auth/me`
- [ ] implement users & roles page
- [ ] implement single role update action
- [ ] implement bulk role update by division
- [ ] implement logout full clear flow

## 17.3 Migration checklist
- [ ] define source external endpoints for login, profile, list users, list divisions
- [ ] map external payload ke `ExternalUserSnapshot`
- [ ] create user/division tables
- [ ] run bootstrap sync
- [ ] verify default role assignment
- [ ] verify admin can refine role after sync
- [ ] schedule periodic sync
- [ ] decide auto-sync-on-login on/off

---

## 18. TEST SCENARIOS

### Auth tests
- valid token + synced user + role exists -> 200
- malformed token -> 401
- expired token -> 401
- token/profile mismatch -> 401
- unsynced user + auto-sync off -> 403
- unsynced user + auto-sync on -> 200 + default role
- inactive user -> 403
- user without role -> 403
- external validation down -> 503

### Role tests
- non-role-manager update role -> 403
- admin assign non-super role -> 200
- admin assign super_admin -> 403
- super_admin assign super_admin -> 200
- bulk division role update -> updated count benar

### Migration tests
- sync divisions then users -> data inserted
- re-run sync -> upsert, not duplicate
- existing role not overwritten after sync
- new user gets default role

---

## 19. IMPLEMENTATION VARIANTS

## Variant A — Closest to current repo flow
- frontend login ke external auth directly
- frontend kirim token ke app backend bridge
- backend validasi token dan return same token normalized
- backend set cookie session
- frontend cache user + token

Kelebihan:
- cepat implementasi
- cocok untuk internal app dengan external auth existing

Kekurangan:
- app token lifecycle mengikuti external token penuh

## Variant B — More enterprise-friendly
- frontend login ke backend app saja
- backend yang call external auth
- backend issue app JWT sendiri
- frontend hanya pegang app session

Kelebihan:
- kontrol session lebih besar
- lebih rapi untuk multi-module app

Kekurangan:
- backend lebih kompleks

---

## 20. ADAPTATION GUIDE

Saat pakai di project lain, ganti item ini dulu:
- `external_identity` -> nama sistem nyata, misal Absensi, HRIS, SSO, LDAP bridge
- `UserRole` -> nama role business project baru
- `Permission` -> permission domain project baru
- landing path -> route aplikasi baru
- dashboard module list -> menu aplikasi baru
- sync source endpoints -> endpoint provider baru
- default role -> role paling aman untuk onboarding awal

Jangan ganti prinsip inti ini:
- external system owns identity
- app owns authorization
- sync user jangan overwrite role lokal
- backend validate token ke upstream source

---

## 21. CONCRETE MAPPING FOR ABSENSI-LIKE SOURCE

Jika source system mirip Absensi, mapping praktisnya:
- external login endpoint: `POST /api/v1/auth/login`
- external profile endpoint: `GET /api/v1/admin/employees/account/detail`
- external user list endpoint: `GET /api/v1/admin/employees`
- external division list endpoint: `GET /api/v1/admin/divisions`
- external subject claim: `accountId`

Bootstrap migration script environment:
- `ABSENSI_SYNC_TOKEN`, atau
- `ABSENSI_SYNC_USERNAME` + `ABSENSI_SYNC_PASSWORD`

Default onboarding policy yang aman:
- sync all users
- assign default role `respondent`
- role manager review elevated roles setelah bootstrap

---

## 22. FINAL RECOMMENDATION

Untuk aplikasi baru yang ingin meniru flow repo ini:
- pakai external-token bridge pattern dulu
- simpan local user registry + role assignment terpisah
- jalankan bootstrap migration dari external source sebelum go-live
- aktifkan scheduled sync
- auto-sync login optional, default off lebih aman
- buat users & roles page sejak awal supaya admin tidak tergantung DB manual

Dokumen ini cukup untuk dijadikan prompt acuan AI agent implementasi fullstack.
