# 🚀 QUICK START (5 Langkah Inti)

Untuk membuat aplikasi **multi-user** yang bisa diakses dari mana saja:

---

## ✅ Langkah 1: Setup Supabase (~10 menit)

1. Buka https://supabase.com → **Sign up**
2. Create project: `attendance-app`
3. Di **SQL Editor**, paste & run:
   ```sql
   CREATE TABLE IF NOT EXISTS attendance (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     name TEXT NOT NULL,
     timestamp TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );
   ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Allow service role" ON attendance
     FOR ALL USING (true) WITH CHECK (true);
   ```
4. Di **Settings → API**, catat:
   - `SUPABASE_URL` = Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key

---

## ✅ Langkah 2: Update `.env` (~2 menit)

File: `.env` (di folder proyek)

```
SUPABASE_URL=https://YOUR_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxx...paste_full_key_here
```

---

## ✅ Langkah 3: Push ke GitHub (~5 menit)

```bash
cd c:\Users\andik\Desktop\attendance-app
git config --global user.name "Nama Anda"
git config --global user.email "email@anda.com"
git init
git add .
git commit -m "Initial commit"
```

Buat repo baru di https://github.com/new (nama: `attendance-app`)

```bash
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
git branch -M main
git push -u origin main
```

---

## ✅ Langkah 4: Deploy ke Netlify (~5 menit)

1. Buka https://netlify.com → **Add new site** → **Import from Git**
2. Authorize GitHub & pilih repo `attendance-app`
3. Build settings:
   - Build command: (kosongkan)
   - Publish directory: `.`
4. Klik **Deploy site**
5. Setelah selesai, klik **Site settings** → **Build & deploy** → **Environment**
6. Add variables:
   - `SUPABASE_URL` = (value dari Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` = (service role key)
7. Tab **Deploys**, klik **Trigger deploy** → **Deploy site**

---

## ✅ Langkah 5: Test & Share (~2 menit)

Netlify beri URL: `https://attendance-app-xyz.netlify.app`

**Test di PowerShell:**
```bash
$URL = "https://attendance-app-xyz.netlify.app/.netlify/functions"

# GET
curl.exe -X GET "$URL/get-attendance"

# POST
curl.exe -X POST "$URL/add-attendance" `
  -H "Content-Type: application/json" `
  -d '{"name":"Budi","timestamp":"2026-02-07T10:00:00Z"}'
```

**Share ke user:**
```
https://attendance-app-xyz.netlify.app/.netlify/functions/get-attendance
```

---

## 🎯 Hasil: Aplikasi Multi-User Live! 

✅ Cloud database (Supabase)  
✅ URL publik (Netlify)  
✅ Banyak user bisa akses  
✅ Data tersimpan aman  

---

## 📚 Referensi Detail

- `TUTORIAL_SETUP.md` - Panduan lengkap dengan screenshots
- `README.md` - Overview lengkap
- `test-crud-v2.ps1` - Test script

---

**Total waktu: ~30 menit. Udah beres! 🎉**
