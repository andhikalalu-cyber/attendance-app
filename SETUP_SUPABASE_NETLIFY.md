# Panduan Setup Multi-User dengan Supabase + Netlify

## Tujuan
Aplikasi Anda akan bisa diakses dari mana saja (URL publik) dan data tersimpan di Supabase cloud database yang bisa diakses multi-user.

## Langkah 1: Buat Supabase Project

1. Buka https://supabase.com dan login (atau buat akun gratis)
2. Klik **"New Project"**
3. Isi:
   - **Project name**: `attendance-app` (atau pilihan Anda)
   - **Password**: simpan aman (untuk superuser)
   - **Region**: pilih dekat dengan lokasi Anda (mis. Singapore, Tokyo)
4. Klik **"Create new project"** dan tunggu ~2 menit

## Langkah 2: Buat Table `attendance` di Supabase

Setelah project siap, buka **SQL Editor** (sidebar kiri):
1. Klik **"SQL Editor"** → **"New Query"**
2. Paste query ini:

```sql
CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable read/write permissions (optional, untuk test)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
```

3. Klik **"Run"** (play icon)
4. Table sudah terbuat

## Langkah 3: Ambil Credentials dari Supabase

1. Di sidebar, klik **Settings** → **API**
2. Catat:
   - **URL** (contoh: `https://abcd1234.supabase.co`) → ini `SUPABASE_URL`
   - **Service Role Key** (bukan `anon` key) → ini `SUPABASE_SERVICE_ROLE_KEY`
3. Simpan aman

## Langkah 4: Test Lokal dengan Supabase

Edit file `.env` di folder proyek:

```
SUPABASE_URL=https://YOUR_URL.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Lalu restart Netlify dev:

```bash
npx netlify-cli dev
```

Buka browser dan test endpoints:
- GET: http://localhost:8888/.netlify/functions/get-attendance
- POST data dengan curl:

```bash
curl -X POST http://localhost:8888/.netlify/functions/add-attendance \
  -H "Content-Type: application/json" \
  -d '{"name":"Andi","timestamp":"2026-02-07T10:00:00Z"}'
```

## Langkah 5: Deploy ke Netlify (Production)

### 5.1 Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: attendance app with Supabase"
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
git branch -M main
git push -u origin main
```

### 5.2 Connect ke Netlify

1. Buka https://netlify.com dan login
2. Klik **"Add new site"** → **"Import an existing project"**
3. Pilih GitHub, pilih repo `attendance-app`
4. Build settings:
   - **Build command**: (kosongkan, tidak ada build)
   - **Publish directory**: `.` (current dir)
5. Klik **"Deploy site"** (akan auto-deploy)

### 5.3 Set Environment Variables di Netlify

1. Di Netlify dashboard, klik site Anda
2. **Site settings** → **Build & deploy** → **Environment**
3. Klik **"Add environment variables"**
4. Tambahkan:
   - Key: `SUPABASE_URL`, Value: `https://YOUR_URL.supabase.co`
   - Key: `SUPABASE_SERVICE_ROLE_KEY`, Value: (paste service role key dari Supabase)
5. **Save**

### 5.4 Trigger Redeploy

1. Di Netlify, klik **"Deploys"**
2. Klik **"Trigger deploy"** → **"Deploy site"**
3. Tunggu deploy selesai (~2-5 menit)

## Langkah 6: Test Production URL

Setelah deploy selesai, Netlify akan beri Anda URL (contoh: `https://attendance-app-xyz.netlify.app`).

Test endpoints:

```bash
# GET
curl https://attendance-app-xyz.netlify.app/.netlify/functions/get-attendance

# POST
curl -X POST https://attendance-app-xyz.netlify.app/.netlify/functions/add-attendance \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi","timestamp":"2026-02-07T10:30:00Z"}'

# UPDATE
curl -X PUT https://attendance-app-xyz.netlify.app/.netlify/functions/update-attendance?id=1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Budi Updated"}'

# DELETE
curl -X DELETE https://attendance-app-xyz.netlify.app/.netlify/functions/delete-attendance?id=1
```

## Hasil: Aplikasi Multi-User

✅ Data tersimpan di Supabase (cloud)
✅ Accessible dari mana saja (URL publik)
✅ Multi-user bisa baca/tulis data sama
✅ Auto-scaling (Netlify + Supabase handle traffic)

## Next Step (Opsional)

1. **Frontend UI**: update `index.html` dan `script.js` agar display/input data lebih user-friendly
2. **Autentikasi**: tambahkan login dengan Supabase Auth (optional)
3. **Custom domain**: set domain sendiri di Netlify

---

Catatan: Jika ada error saat deploy, cek:
- Supabase credentials benar (copy-paste ulang jika perlu)
- Tidak ada typo di env var names
- Service Role Key (bukan Anon key)
