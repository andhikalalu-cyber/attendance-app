# Setup Lengkap: Supabase + GitHub + Netlify Deploy

Panduan ini akan membuat aplikasi Anda **multi-user** dengan data cloud yang bisa diakses dari mana saja.

---

## TAHAP 1: Setup Supabase (Cloud Database)
⏱️ Waktu: ~10 menit

### 1.1 Buat Akun Supabase
1. Buka https://supabase.com
2. Klik **"Sign Up"** atau **"Get Started"** 
3. Pilih **"Continue with GitHub"** atau email
4. Verify email

### 1.2 Buat Project Baru
1. Setelah login, klik **"New Project"**
2. Isi form:
   - **Project name**: `attendance-app`
   - **Database password**: (ingat baik-baik, misal: `P@ssw0rd123`)
   - **Region**: Pilih region terdekat (Indonesia: Singapore atau Jakarta)
3. Klik **"Create new project"**
4. **Tunggu 2-3 menit** sampai project siap (akan ada notifikasi)

### 1.3 Buat Table `attendance`
1. Di Supabase dashboard, klik **"SQL Editor"** (sidebar kiri)
2. Klik **"New Query"** (tombol plus)
3. **Copy-paste query ini:**

```sql
CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS (Row Level Security) - izinkan akses via Service Role
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role" ON attendance
  FOR ALL USING (true) WITH CHECK (true);
```

4. Klik tombol **"Run"** (play icon di atas)
5. Jika berhasil, akan muncul "Query executed successfully"

### 1.4 Ambil Credentials (SANGAT PENTING)
1. Di sidebar, klik **"Settings"** (gear icon)
2. Klik **"API"** di submenu
3. Catat 2 value ini:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJxxxxx...
```

**Contoh screenshot lokasi:**
- URL: di bagian "Project URL"
- Service Role Key: di bagian "Project API keys" → cari "service_role"

**⚠️ JANGAN BAGIKAN KEY INI KE SIAPA PUN**

---

## TAHAP 2: Update `.env` Lokal + Test
⏱️ Waktu: ~3 menit

### 2.1 Edit `.env` di folder proyek
File: `c:\Users\andik\Desktop\attendance-app\.env`

**Ganti dengan nilai Supabase Anda:**
```
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJalgorithm...paste_full_key_here
```

**Contoh isi setelah diisi:**
```
SUPABASE_URL=https://abcd1234.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSJ9...
```

### 2.2 Test Lokal (Optional)
Jika ingin test sebelum deploy:

```bash
cd c:\Users\andik\Desktop\attendance-app
npx netlify-cli dev
```

Buka browser:
- http://localhost:8888/.netlify/functions/get-attendance

---

## TAHAP 3: Push ke GitHub
⏱️ Waktu: ~5 menit

### 3.1 Install Git (jika belum)
```bash
# Check if Git installed
git --version

# Jika belum, download dari https://git-scm.com/download/win
```

### 3.2 Setup Git
Buka PowerShell di folder proyek:
```bash
cd c:\Users\andik\Desktop\attendance-app
```

Lalu jalankan:
```bash
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
```

### 3.3 Initialize & Commit
```bash
git init
git add .
git commit -m "Initial commit: attendance app with Supabase integration"
```

### 3.4 Buat Repository di GitHub
1. Buka https://github.com/new
2. Isi:
   - **Repository name**: `attendance-app`
   - **Description**: Attendance tracking app with Supabase
   - **Public** (agar Netlify bisa akses)
3. Klik **"Create repository"**
4. GitHub akan kasih URL seperti: `https://github.com/YOUR_USERNAME/attendance-app.git`

### 3.5 Push ke GitHub
Di PowerShell, jalankan (ganti `YOUR_USERNAME`):
```bash
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
git branch -M main
git push -u origin main
```

Kalo minta username/password:
- **Username**: GitHub username Anda
- **Password**: (gunakan Personal Access Token, lihat di GitHub Settings → Developer settings → Personal access tokens)

---

## TAHAP 4: Deploy ke Netlify
⏱️ Waktu: ~5 menit (auto-deploy)

### 4.1 Connect Netlify ke GitHub
1. Buka https://netlify.com dan login (atau buat akun)
2. Klik **"Add new site"** → **"Import an existing project"**
3. Pilih **"GitHub"**
4. Authorize Netlify ke GitHub (klik tombol authorize)
5. Pilih repo `attendance-app` dari list
6. **Build settings:**
   - Build command: (KOSONGKAN, tidak ada build)
   - Publish directory: `.` (current directory)
7. Klik **"Deploy site"**

**Netlify akan auto-deploy** (~2-5 menit). Tunggu sampai selesai.

### 4.2 Set Environment Variables di Netlify
1. Setelah deploy selesai, di Netlify dashboard klik site Anda
2. **Site settings** (tab di atas)
3. Pilih **"Build & deploy"** → **"Environment"**
4. Klik **"Add environment variables"**
5. Tambahkan 2 variables:

**Variable 1:**
- Key: `SUPABASE_URL`
- Value: `https://YOUR_PROJECT_ID.supabase.co` (dari Supabase)

**Variable 2:**
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: (paste full service role key dari Supabase)

6. Klik **"Save"**

### 4.3 Trigger Redeploy
1. Di Netlify, tab **"Deploys"**
2. Klik **"Trigger deploy"** → **"Deploy site"**
3. Tunggu selesai

**Netlify akan beri Anda URL publik seperti:**
```
https://attendance-app-xyz.netlify.app
```

---

## TAHAP 5: Test Production
⏱️ Waktu: ~2 menit

Buka PowerShell dan ganti `YOUR_NETLIFY_URL`:

```bash
$URL = "https://attendance-app-xyz.netlify.app/.netlify/functions"

# Test GET
curl.exe -X GET "$URL/get-attendance"

# Test POST
curl.exe -X POST "$URL/add-attendance" `
  -H "Content-Type: application/json" `
  -d '{"name":"Budi","timestamp":"2026-02-07T10:00:00Z"}'

# Test GET lagi
curl.exe -X GET "$URL/get-attendance"
```

**Harapan output:**
- GET pertama: `[]` (kosong)
- POST: `{"id":1,"name":"Budi",...}`
- GET kedua: data Budi yang baru ditambah

✅ **Jika berhasil, aplikasi Anda sudah LIVE!**

---

## TAHAP 6: Share ke Banyak Orang
Sekarang Anda punya:
- URL publik: `https://attendance-app-xyz.netlify.app`
- Database cloud: Supabase
- Multi-user: Ya! Siapa pun bisa akses URL dan tambahin data

### Cara Akses:
Beri tahu user Anda untuk buka di browser:
```
https://attendance-app-xyz.netlify.app
```

Atau gunakan cURL/Postman:
```bash
# GET semua attendance
curl https://attendance-app-xyz.netlify.app/.netlify/functions/get-attendance

# POST tambah attendance
curl -X POST https://attendance-app-xyz.netlify.app/.netlify/functions/add-attendance \
  -H "Content-Type: application/json" \
  -d '{"name":"User A","timestamp":"2026-02-07T10:00:00Z"}'
```

---

## Troubleshooting

**Q: Netlify deploy gagal?**
- Cek env vars (SUPABASE_URL dan SERVICE_ROLE_KEY harus benar)
- Cek di Netlify "Deploy logs" untuk error detail

**Q: GET/POST return error 500?**
- Cek Supabase credentials di .env
- Pastikan table `attendance` sudah dibuat di Supabase
- Cek Service Role Key (bukan Anon key)

**Q: Data tidak muncul?**
- Pastikan POST berhasil (status 201)
- Check Supabase dashboard → Table Editor untuk lihat data

---

## Next Steps (Optional)

1. **Buat Frontend UI**: Update `index.html` agar user bisa input/view data dengan form
2. **Add Autentikasi**: Supabase Auth (login/signup)
3. **Custom Domain**: Gunakan domain sendiri di Netlify

---

**Catatan Akhir:**
- `.env` file **JANGAN di-commit** ke Git (sudah di `.gitignore`)
- Env vars di Netlify adalah backup untuk production
- Data tersimpan aman di Supabase cloud
