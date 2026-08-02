# Inovamedika Asessment Test Backend API

---

## 📋 Daftar Isi
1. [Persyaratan Sistem](#1-persyaratan-sistem)
2. [Cara Instalasi Aplikasi](#2-cara-instalasi-aplikasi)
3. [Konfigurasi File .env](#3-konfigurasi-file-env)
4. [Cara Menjalankan Aplikasi](#4-cara-menjalankan-aplikasi)
5. [Struktur Proyek](#5-struktur-proyek)
6. [Daftar Endpoint API](#6-daftar-endpoint-api)
7. [Akun Default untuk Testing](#7-akun-default-untuk-testing)

---

## 1. Persyaratan Sistem
Pastikan perangkat Anda telah terpasang:
- **Node.js**: Versi 18.x atau lebih baru
- **NPM**: Versi 9.x atau lebih baru
- **PostgreSQL**: Versi 14.x atau lebih baru (jika dijalankan secara lokal)
- **Docker & Docker Compose** *(Opsional, jika ingin menjalankan via container)*

---

## 2. Cara Instalasi Aplikasi

1. Buka terminal dan arahkan ke direktori backend:
   ```bash
   cd inovamedika-backend
   ```

2. Pasang seluruh dependensi yang diperlukan:
   ```bash
   npm install
   ```

---

## 3. Konfigurasi File `.env`

Buat file baru bernama `.env` di dalam root direktori `inovamedika-backend` (atau salin dari `.env.example`):

```bash
cp .env.example .env
```

### Penjelasan Variabel Environment

| Variabel | Tipe / Default | Deskripsi |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port tempat Express API server berjalan |
| `DB_HOST` | `localhost` | Host server database PostgreSQL (`db` jika menggunakan Docker) |
| `DB_PORT` | `5432` | Port database PostgreSQL |
| `DB_USER` | `postgres` | Username database PostgreSQL |
| `DB_PASSWORD` | `root` / `postgrespassword` | Password database PostgreSQL |
| `DB_NAME` | `db_mini_clinic` | Nama database untuk aplikasi klinik |
| `JWT_SECRET` | `admin123` | Kunci rahasia untuk menandatangani JWT token autentikasi |

### Contoh Isi File `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=root
DB_NAME=db_mini_clinic
JWT_SECRET=admin123
```

---

## 4. Cara Menjalankan Aplikasi

### A. Menjalankan Secara Lokal (Node.js & PostgreSQL Lokal)

1. **Inisialisasi Database & Schema Table:**
   Menjalankan skrip untuk membuat database dan tabel-tabel sesuai `schema.sql`:
   ```bash
   npm run init-db
   ```

2. **Isi Data Dummy (Seeding):**
   Mengisi database dengan akun Admin, 3 Dokter, 2 Registrator, dan 25 data pasien dummy:
   ```bash
   npm run seed
   ```

3. **Jalankan Aplikasi:**
   - **Mode Pengembangan (Dev / Nodemon):**
     ```bash
     npm run dev
     ```
   - **Mode Produksi:**
     ```bash
     npm start
     ```

Aplikasi backend akan berjalan dan siap diakses di: **`http://localhost:5000/api`**

---

### B. Menjalankan Menggunakan Docker & Docker Compose

Jika Anda ingin menjalankan backend beserta database PostgreSQL dalam container Docker secara terisolasi:

```bash
# Di dalam direktori inovamedika-backend:
docker compose up --build -d
```

Skrip `docker-entrypoint.sh` akan secara otomatis:
- Menunggu PostgreSQL siap menerima koneksi.
- Menginisialisasi database dan schema table.
- Mengisi data awal (seeding).
- Menjalankan Express API server di port `5000`.

Untuk menghentikan container:
```bash
docker compose down
```

---

## 5. Akun Default untuk Testing

Setelah menjalankan skrip `npm run seed` atau via Docker Compose, akun-akun berikut dapat langsung digunakan:

| Role | Username | Password | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `password123` | Administrator Sistem (Kelola User, Hak Akses Lengkap) |
| **Doctor** | `budi` | `password123` | Dr. Budi Santoso, Sp.PD (Pemeriksaan & Rekam Medis) |
| **Doctor** | `siti` | `password123` | Dr. Siti Nurhaliza, Sp.A |
| **Doctor** | `hendra` | `password123` | Dr. Hendra Wijaya, Sp.JP |
| **Registrator** | `registrator1` | `password123` | Petugas Pendaftaran (Pasien, Janji Temu, Antrean) |
| **Registrator** | `registrator2` | `password123` | Petugas Pendaftaran |


## 6. Struktur Proyek

Aplikasi backend menerapkan arsitektur berlapis atau Layered Architecture yang memisahkan Controller, Service, dan Repository:

```
inovamedika-backend/
├── controllers/              # Layer Controller: Validasi request & format HTTP response
│   ├── appointment.controller.js
│   ├── auth.controller.js
│   ├── medical-record.controller.js
│   ├── patient.controller.js
│   ├── prescription.controller.js
│   ├── queue.controller.js
│   └── user.controller.js
├── services/                 # Layer Service: Logika bisnis (Business Logic)
│   ├── appointment.service.js
│   ├── auth.service.js
│   ├── medical-record.service.js
│   ├── patient.service.js
│   ├── prescription.service.js
│   ├── queue.service.js
│   └── user.service.js
├── repositories/             # Layer Repository: Akses data & Query SQL ke PostgreSQL
│   ├── appointment.repository.js
│   ├── medical-record.repository.js
│   ├── patient.repository.js
│   ├── prescription.repository.js
│   ├── queue.repository.js
│   └── user.repository.js
├── routes/                   # Layer Routing: Definisi URL endpoint dan mapping handler
│   ├── appointment.routes.js
│   ├── auth.routes.js
│   ├── medical-record.routes.js
│   ├── patient.routes.js
│   ├── prescription.routes.js
│   ├── queue.routes.js
│   └── user.routes.js
├── middleware/               # Middleware Express
│   └── auth.middleware.js    # Verifikasi token JWT & Role-Based Access Control (RBAC)
├── db.js                     # Konfigurasi koneksi PostgreSQL Pool (pg)
├── init-db.js                # Skrip pembuatan DB & eksekusi schema.sql
├── schema.sql                # Definisi tabel, relasi, constraint & ON DELETE CASCADE
├── seed-dummy-data.js        # Skrip pengisian data awal (Admin, Doctor, Registrator, Patients)
├── server.js                 # Entrypoint utama Express server
├── docker-compose.yml        # Orchestration Docker untuk Backend & PostgreSQL
├── docker-entrypoint.sh      # Skrip startup container Docker
├── Dockerfile                # Dockerfile build backend
├── .env.example              # Template variabel environment
├── .gitignore
└── package.json              # Dependensi dan skrip npm
```

---

## 7. Daftar Endpoint API

| Kategori | Method | Endpoint | Hak Akses (Role) | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/login` | Publik | Login & mendapatkan JWT token |
| | `POST` | `/api/logout` | Publik | Logout sesi pengguna |
| **Pasien** | `GET` | `/api/patients` | Admin, Registrator, Doctor | Mendapatkan daftar pasien (paginated/filter) |
| | `GET` | `/api/patients/:id` | Admin, Registrator, Doctor | Mendapatkan detail profil pasien |
| | `POST` | `/api/patients` | Admin, Registrator | Menambahkan data pasien baru |
| | `PUT` | `/api/patients/:id` | Admin, Registrator | Mengubah data pasien |
| | `DELETE` | `/api/patients/:id` | Admin, Registrator | Menghapus pasien (cascade data) |
| **Pendaftaran / Janji Temu** | `GET` | `/api/registrations` | Admin, Registrator, Doctor | Mendapatkan daftar registrasi janji temu |
| | `POST` | `/api/registrations` | Admin, Registrator | Membuat pendaftaran / janji temu baru |
| | `PUT` | `/api/registrations/:id` | Admin, Registrator, Doctor | Memperbarui jadwal / status kunjungan |
| | `DELETE` | `/api/registrations/:id` | Admin, Registrator | Menghapus janji temu |
| **Antrean (Queue)** | `GET` | `/api/queues` | Admin, Registrator, Doctor | Mendapatkan antrean hari ini & dashboard stats |
| | `POST` | `/api/queues` | Admin, Registrator | Membuat nomor antrean manual |
| | `PUT` | `/api/queues/:id/call` | Admin, Registrator | Memanggil nomor antrean pasien |
| | `PUT` | `/api/queues/:id/status` | Admin, Registrator, Doctor | Mengubah status antrean pasien |
| **Rekam Medis** | `GET` | `/api/medical-records` | Admin, Doctor | Mendapatkan daftar rekam medis |
| | `GET` | `/api/medical-records/:id` | Admin, Doctor | Mendapatkan detail rekam medis |
| | `GET` | `/api/medical-records/patient/:patientId` | Admin, Doctor | Mendapatkan rekam medis per pasien |
| | `POST` | `/api/medical-records` | Doctor | Membuat rekam medis & resep obat baru |
| | `PUT` | `/api/medical-records/:id` | Doctor | Memperbarui isi rekam medis |
| | `DELETE` | `/api/medical-records/:id` | Doctor | Menghapus rekam medis |
| **Resep Obat** | `GET` | `/api/prescriptions/:id` | Admin, Doctor | Mendapatkan detail resep obat |
| | `POST` | `/api/prescriptions` | Doctor | Menambahkan resep obat |
| **Manajemen User** | `GET` | `/api/users` | Admin | Mendapatkan daftar user & dokter |
| | `POST` | `/api/users` | Admin | Membuat user baru |
| | `PUT` | `/api/users/:id` | Admin | Mengedit profil user / role |
| | `PUT` | `/api/users/:id/status`| Admin | Mengaktifkan / menonaktifkan akun user |
| | `DELETE` | `/api/users/:id` | Admin | Menghapus akun user |

---