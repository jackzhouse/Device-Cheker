# Katalis SSO / Bearer Authentication Rules

  ## Authority
  - Katalis adalah Identity Provider (IdP).
  - Aplikasi ini tidak membuat JWT user sendiri.
  - Bearer token aktif berasal dari Katalis, tepatnya token hasil endpoint `credential/check`.
  - Aplikasi hanya memakai token ini untuk autentikasi user dan komunikasi API internal.

  ## Login Flow
  1. Frontend kirim username/password ke endpoint login Katalis:
     `POST {KATALIS_BASE_URL}/katalis/login`
  2. Ambil token sementara dari response header:
     `Authorization: Bearer <login_token>`
  3. Kirim token sementara ke endpoint credential exchange:
     `GET {KATALIS_BASE_URL}/katalis/user/credential/check`
     Header:
     `Authorization: Bearer <login_token>`
  4. Ambil token hasil exchange dari response header:
     `Authorization: Bearer <katalis_access_token>`
  5. Token hasil `credential/check` adalah satu-satunya token user yang dipakai aplikasi.
  6. Jangan gunakan lagi token login awal untuk API aplikasi.

  ## Frontend Rules
  - Simpan `katalis_access_token` hanya di `sessionStorage`, bukan `localStorage`.
  - Normalisasi token sebelum disimpan/dikirim:
    - Jika token sudah diawali `Bearer `, hapus prefix-nya.
    - Saat membuat header, tambahkan tepat satu kali:
      `Authorization: Bearer <token>`
  - Semua request API private ke backend aplikasi harus membawa:
    `Authorization: Bearer <katalis_access_token>`
  - Boleh memakai HttpOnly cookie sebagai fallback sesi, tetapi cookie harus menyimpan token Katalis yang sama, bukan token aplikasi baru.
  - Saat logout, hapus sessionStorage, cookie sesi, cache query, dan state tab sensitif.

  ## Backend Rules
  - Endpoint private menerima Bearer token Katalis.
  - Backend wajib:
    1. Ambil token dari header `Authorization`.
    2. Normalisasi prefix `Bearer `.
    3. Decode claim dasar untuk cek `accountId` dan `exp`.
    4. Tolak token expired atau claim wajib tidak ada.
    5. Validasi token ke endpoint identity/employee Katalis atau Absensi.
    6. Cocokkan `accountId` pada JWT dengan identity user dari endpoint validasi.
  - Jangan percaya payload JWT saja tanpa validasi identity upstream.
  - Jika upstream mengembalikan `401`/`403`, respons aplikasi harus `401`.
  - Jika upstream timeout/error `5xx`, respons aplikasi harus `503`, bukan `401`.
  - Jangan pernah log token, password, atau header Authorization.

  ## Local User and Authorization
  - Data user dapat disinkronkan dari Katalis ke database aplikasi sebagai shadow user.
  - `external_user_id` aplikasi harus menyimpan `accountId` dari Katalis.
  - Identity user berasal dari Katalis.
  - Role dan permission fitur berasal dari database aplikasi lokal.
  - Setiap endpoint tetap wajib cek permission lokal di backend.
  - Frontend hanya menyembunyikan UI berdasarkan permission; bukan security boundary.

  ## Session Endpoint Optional
  - Endpoint seperti `POST /auth/sso` boleh menerima token Katalis.
  - Endpoint tersebut hanya:
    - memvalidasi token Katalis;
    - mengembalikan profil user aplikasi;
    - opsional set HttpOnly cookie berisi token Katalis yang sama.
  - Endpoint tersebut tidak boleh menerbitkan JWT aplikasi baru.

  ## Error Handling
  - Token tidak ada/tidak valid/expired → `401 Unauthorized`.
  - User Katalis valid tetapi belum ada/aktif di aplikasi → `403 Forbidden`.
  - Katalis/Absensi validation service gagal → `503 Service Unavailable`.
  - Jangan logout user lokal akibat satu error jaringan/upstream `503`.
  - Logout otomatis hanya untuk kegagalan auth lokal yang benar-benar `401`.

  ## Security
  - Jangan kirim password ke backend aplikasi jika frontend login langsung ke Katalis.
  - Jangan simpan password.
  - Jangan expose URL internal, secret, JWT, atau credential di response/log.
  - Gunakan HTTPS pada production.
  - Gunakan CORS origin spesifik dan `allow_credentials=true` bila memakai cookie.

  Inti: Katalis pegang identitas/token. Aplikasi pegang role/permission bisnis.