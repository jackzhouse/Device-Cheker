# External Login, App Session, User Role, and Employee Sync Template

Dokumen ini menjelaskan alur yang dipakai Paperless, tapi untuk aplikasi lain tanpa konsumsi API Paperless. Aplikasi baru membuat backend endpoint sendiri, lalu consume external dev/prod API Katalis/Absensi untuk login, credential check, employee list, dan division list.

## 1. Endpoint External Katalis/Absensi

Endpoint external yang dikonsumsi:

| Kebutuhan | Method + Path | Pemakai | Catatan |
| --- | --- | --- | --- |
| Dev/direct login | `POST /api/v1/auth/login` | FE atau backend app | Body `{ "username": "...", "password": "..." }`, token dari JSON `data`. |
| Dev current employee detail | `GET /attendance/api/v1/admin/employees/account/detail` | Backend app | Header `Authorization: Bearer <token>`, detail employee jadi source of truth. |
| Dev employee list | `GET /api/v1/admin/employees?page=&size=` | Backend app | Dipakai sync employee. |
| Dev division list | `GET /api/v1/admin/divisions?page=&size=` | Backend app | Dipakai sync divisi/departemen. |
| Prod login | `POST /katalis/login` | FE atau backend app | Token login dibaca dari header `Authorization`. |
| Prod credential check | `GET /katalis/user/credential/check` | FE atau backend app | Header `Authorization: Bearer <login_token>`, token final dibaca dari header `Authorization`. |

Base URL ditentukan per environment:

- Dev: `<DEV_BASE_URL>`
- Production: `<PROD_BASE_URL>`

Jangan tulis token, password, atau secret ke log. Jika perlu referensi credential, tulis "lihat .env/config deployment".

## 2. Endpoint Backend Aplikasi Baru

Aplikasi baru wajib membuat endpoint sendiri. Nama path bebas, tapi kontrak minimal disarankan seperti ini:

| Endpoint | Fungsi |
| --- | --- |
| `POST /<app-api>/auth/sso` | Tukar token external menjadi session aplikasi. |
| `GET /<app-api>/auth/me` | Ambil current user aplikasi dari session/cookie atau Bearer token. |
| `POST /<app-api>/auth/logout` | Hapus session aplikasi. |
| `GET /<app-api>/users` | Data menu `Users & Roles`. |
| `PUT /<app-api>/users/{user_id}/role` | Update role lokal user. |
| `POST /<app-api>/users/sync-employees` | Mulai sync employee dari external source. |
| `GET /<app-api>/tasks/{task_id}` | Baca progress sync employee. |

Paperless API tidak perlu dipanggil oleh aplikasi baru. Paperless hanya contoh implementasi alur.

## 3. Login Flow

### Dev/direct flow

1. FE call `POST <DEV_BASE_URL>/api/v1/auth/login`.
2. External API return token di JSON `data`.
3. FE call `POST /<app-api>/auth/sso` dengan token external.
4. Backend app decode token minimal untuk `accountId` dan `exp`.
5. Backend app validate token ke `GET <DEV_BASE_URL>/attendance/api/v1/admin/employees/account/detail`.
6. Backend app cocokkan `accountId` token dengan `accountId` employee detail.
7. Backend app cari user lokal by `external_user_id = userId`.
8. Jika user belum ada, backend app auto-create user lokal dengan role default paling rendah (`ROLE_USER`).
9. Jika user sudah ada, backend app refresh field profil employee dari `account/detail` tanpa overwrite role lokal dan status aktif lokal.
10. Backend app reject hanya jika token invalid, user lokal inactive, atau external auth bermasalah.
11. Backend app set session cookie aplikasi dan return auth payload.

### Production/Katalis flow

1. FE call `POST <PROD_BASE_URL>/katalis/login`.
2. FE ambil login token dari header `Authorization`.
3. FE call `GET <PROD_BASE_URL>/katalis/user/credential/check` dengan header `Authorization: Bearer <login_token>`.
4. FE ambil final token dari header `Authorization`.
5. FE call `POST /<app-api>/auth/sso` dengan final token.
6. Backend app validate token, auto-register jika user belum ada, lalu login seperti dev flow.

## 4. Endpoint Detail

### `POST /<app-api>/auth/sso`

Fungsi: tukar token external menjadi session aplikasi.

Request header:

```http
Authorization: Bearer <external_token>
Content-Type: application/json
```

Request body:

```json
{
  "external_token": "<external_token>"
}
```

Backend behavior:

- normalize token; kalau ada prefix `Bearer `, simpan token mentah tanpa prefix
- decode claim minimal `accountId` dan `exp`
- reject token expired
- validate token ke external credential-check bila token masih login token
- validate token ke external `account/detail` endpoint
- reject jika `accountId` token tidak sama dengan employee `accountId`
- cari local user by `external_user_id = userId`
- jika user belum ada, create user lokal default dari snapshot employee detail
- jika user sudah ada, refresh field profil employee yang aman
- reject user inactive
- set session cookie aplikasi
- return auth payload

Response `200`:

```json
{
  "access_token": "<external_token>",
  "token_type": "bearer",
  "expires_at": "2026-07-07T12:00:00Z",
  "user": {
    "id": "uuid",
    "external_user_id": "userId",
    "account_id": "accountId",
    "employee_no": "EMP001",
    "name": "Nama User",
    "email": null,
    "department_id": "div-1",
    "department_name": "IT",
    "job_title": "Staff",
    "role": "ROLE_USER",
    "permissions": [],
    "exp": 9999999999
  }
}
```

### `GET /<app-api>/auth/me`

Fungsi: current user aplikasi.

Request:

```http
Authorization: Bearer <external_token>
```

Response `200`: object `user` seperti response `/auth/sso`.

Error penting:

- `401` token invalid atau expired
- `403` user inactive
- `403` role lokal belum ditetapkan
- `503` external credential/current employee endpoint bermasalah

### `POST /<app-api>/auth/logout`

Fungsi: hapus session aplikasi.

Response:

```json
{ "ok": true }
```

### `GET /<app-api>/users`

Fungsi: source data menu `Users & Roles`.

Query:

```text
page=1
page_size=10
search=nama/employee/divisi/jabatan
department=<department_id_or_name>
job=<job_title>
role=<role>
```

Response `200`:

```json
{
  "users": [
    {
      "id": "uuid",
      "external_user_id": "accountId",
      "employee_no": "EMP001",
      "name": "Nama User",
      "department_id": "div-1",
      "department_name": "IT",
      "job_title": "Staff",
      "is_active": true,
      "role": "employee",
      "last_synced_at": "2026-07-07T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 10,
  "total": 100,
  "total_pages": 10
}
```

### `PUT /<app-api>/users/{user_id}/role`

Fungsi: update role lokal. Endpoint ini tidak call external API.

Request body:

```json
{
  "role": "admin"
}
```

Backend behavior:

- hanya role manager/admin boleh update
- role disimpan di DB aplikasi
- sync employee berikutnya tidak boleh overwrite role ini
- tulis audit log jika aplikasi punya audit module

Response:

```json
{ "ok": true }
```

### `POST /<app-api>/users/sync-employees`

Fungsi: mulai sync employee dari external Katalis/Absensi.

Request header:

```http
Authorization: Bearer <external_token>
```

Backend behavior:

- validate requester dari token/session
- buat async task `employee_sync`
- pakai Bearer token request untuk call external source
- call `GET <BASE_URL>/api/v1/admin/divisions?page=&size=`
- call `GET <BASE_URL>/api/v1/admin/employees?page=&size=`
- upsert division dan employee ke DB aplikasi
- preserve role lokal yang sudah ada
- user baru dapat default role paling rendah, misal `employee` atau `requester`
- simpan progress task

Response `200`:

```json
{
  "task_id": "task-uuid",
  "task_type": "employee_sync",
  "status": "queued",
  "progress": 0,
  "message": "Sinkronisasi employee sedang diproses",
  "metadata": {
    "requested_by": "user-id",
    "requested_by_name": "Nama User",
    "requested_by_role": "admin"
  }
}
```

### `GET /<app-api>/tasks/{task_id}`

Fungsi: baca progress sync employee.

Response processing:

```json
{
  "task_id": "task-uuid",
  "task_type": "employee_sync",
  "status": "processing",
  "progress": 45,
  "message": "Sinkronisasi data employee",
  "metadata": {
    "division_count": 10,
    "employee_count": 250
  }
}
```

Response completed:

```json
{
  "task_id": "task-uuid",
  "task_type": "employee_sync",
  "status": "completed",
  "progress": 100,
  "message": "Sinkronisasi employee selesai",
  "metadata": {
    "division_count": 10,
    "employee_count": 500
  }
}
```

Response failed:

```json
{
  "task_id": "task-uuid",
  "task_type": "employee_sync",
  "status": "failed",
  "progress": 100,
  "message": "Sinkronisasi employee gagal",
  "metadata": {
    "error_type": "ExternalClientError",
    "endpoint": "/api/v1/admin/employees",
    "status_code": 503
  }
}
```

## 5. Field Mapping

Mapping employee external ke user lokal:

- `external_user_id = accountId`
- `attendance_user_id = userId`
- `employee_no = identityNumber`
- `name = userName || accountName`
- `department_id = division.id`
- `department_name = division.name`
- `job_title = position.name`
- `manager_external_id = manager account id jika tersedia`
- `is_active = active flag dari external, atau true jika external tidak kirim status`

Mapping division external ke division lokal:

- `id = division.id`
- `name = division.name`
- `description = division.description`
- `company_id = division.companyId`

## 6. Hubungan Menu `Users & Roles` Dengan Sync Employee

Menu `Users & Roles` memakai DB aplikasi sendiri, bukan langsung baca external list.

Flow UI:

1. Page load call `GET /<app-api>/users`.
2. Filter/search/page table tetap call `GET /<app-api>/users` dengan query.
3. Tombol `Sync Employee` call `POST /<app-api>/users/sync-employees`.
4. UI tampil modal/progress sync.
5. UI polling `GET /<app-api>/tasks/{task_id}` setiap beberapa detik.
6. Kalau task `completed`, UI refetch `GET /<app-api>/users`.
7. Tabel menampilkan data employee terbaru dari DB lokal.
8. Dropdown role call `PUT /<app-api>/users/{user_id}/role`.

Aturan penting:

- Sync employee update identitas, divisi, jabatan, status aktif.
- Sync employee tidak overwrite role lokal.
- Role lokal hanya berubah lewat menu `Users & Roles` atau proses admin internal.
- User baru hasil sync diberi default role minimum.
- Jika login lewat `auth/sso` auto-register diaktifkan, user tidak perlu menunggu sync employee penuh untuk bisa masuk pertama kali.

## 7. Error Handling

Rekomendasi error:

- `401`: token external invalid, expired, atau credential check gagal.
- `403`: user inactive atau role lokal/policy lokal menolak akses.
- `422`: request body tidak valid.
- `503`: external Katalis/Absensi tidak bisa diakses atau response invalid.

Error `503` sebaiknya bawa metadata aman:

```json
{
  "message": "Layanan external auth sedang bermasalah",
  "endpoint": "/api/v1/admin/employees/account/detail",
  "status_code": 503
}
```

## 8. Ringkasan

- Aplikasi lain tidak perlu panggil API Paperless.
- Aplikasi lain consume external dev/prod Katalis/Absensi langsung.
- Backend aplikasi lain membuat endpoint auth, user-role, sync employee, dan task status sendiri.
- `Users & Roles` adalah UI atas DB lokal.
- Sync employee adalah proses isi/update DB lokal dari external source.
