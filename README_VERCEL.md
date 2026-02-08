# Panduan Deploy Attendance App ke Vercel

## 1. Struktur Folder
- Semua file API (add-attendance.js, api-data.js, dll) ada di folder `/api`.
- Library backend ada di `/api/lib/db.js`.
- Frontend tetap di root (index.html, script.js, styles.css, dll).

## 2. Deploy ke Vercel
1. Push seluruh project ke GitHub.
2. Buka https://vercel.com/import dan pilih repo Anda.
3. Pilih root folder project (bukan subfolder).
4. Vercel akan otomatis mendeteksi API routes di `/api` dan static site di root.

## 3. Setting Environment Variable
Setelah deploy, buka dashboard project di Vercel:
- Masuk ke Settings > Environment Variables
- Tambahkan:
  - `SUPABASE_URL` → isi dengan URL Supabase Anda
  - `SUPABASE_SERVICE_ROLE_KEY` → isi dengan Service Role Key Supabase
- Klik Save & Redeploy

## 4. Endpoint API
- Semua endpoint backend bisa diakses via `/api/nama-file.js` (tanpa .js di URL), misal:
  - `/api/api-data` (untuk load/simpan data utama)
  - `/api/add-attendance`, `/api/delete-attendance`, dst

## 5. Tips & Troubleshooting
- Jika API error, cek tab "Functions" di dashboard Vercel untuk log error.
- Pastikan environment variable sudah benar dan table Supabase sudah ada.
- Untuk update kode, cukup push ke GitHub, Vercel akan auto deploy.

## 6. Koneksi Supabase
- Table utama: `app_data` (kolom: id, data (JSON), updated_at)
- Untuk absensi per siswa: table `attendance` (opsional, sesuai kebutuhan)

---
Jika butuh bantuan lebih lanjut, hubungi pengembang atau cek dokumentasi Vercel dan Supabase.
