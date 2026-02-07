# 🚀 NETLIFY DEPLOY - Instruksi Lengkap

## Prerequisites (Harus Sudah Selesai)
✅ GitHub repo sudah punya kode Anda  
✅ Supabase credentials sudah dicatat

---

## Langkah: Deploy ke Netlify

### Step 1: Connect Netlify ke GitHub Repo

1. **Buka:** https://netlify.com
2. **Sign up/Login** (gunakan GitHub untuk lebih mudah)
3. Klik **"Add new site"** → **"Import an existing project"**
4. Pilih **GitHub**
5. **Authorize Netlify ke GitHub** (klik tombol authorize)
6. Cari & pilih repo: `attendance-app`

### Step 2: Configure Build Settings

Netlify akan tanya build settings:

```
Build command:
(kosongkan - tidak ada build process)

Publish directory:
.
(current directory)
```

**Important:** Jangan change apa-apa, cukup leave empty/default

### Step 3: Deploy

1. Klik **"Deploy site"**
2. **Tunggu ~3-5 menit** sampai deployment selesai
3. Akan dapat notifikasi "Site is live"

Netlify kasih URL seperti:
```
https://attendance-app-xyz.netlify.app
```

**CATAT URL INI - Anda akan perlu untuk test nanti!**

---

## Step 4: Set Environment Variables (PENTING!)

1. **Di Netlify dashboard**, klik site Anda
2. **Site settings** (tab di atas)
3. **Build & deploy** (sidebar) → **Environment**
4. Klik **"Add environment variables"**

### Tambahkan 2 Variables:

**Variable 1:**
- Key: `SUPABASE_URL`
- Value: `https://fuxsjrqusergwezhyyii.supabase.co`

**Variable 2:**
- Key: `SUPABASE_SERVICE_ROLE_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1eHNqcnF1c2VyZ3dlemh5eWlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQ0NjQ3MCwiZXhwIjoyMDg2MDIyNDcwfQ.UpOxUCBzb-r6mRgTSudqlOwEdHpHNBek7l_A22xtpkY`

5. Klik **"Save"**

### Step 5: Redeploy dengan Environment Variables

1. Tab **"Deploys"**
2. Klik **"Trigger deploy"** → **"Deploy site"**
3. **Tunggu ~1-2 menit** sampai redeploy selesai

---

## ✅ Verifikasi Deployment

### Cek Status:
- Di Netlify, status seharusnya **"Published"** (hijau)

### Test Endpoints:

Ganti `YOUR_NETLIFY_URL` dengan URL Netlify Anda:

**Test GET (seharusnya return `[]`):**
```bash
curl https://YOUR_NETLIFY_URL/.netlify/functions/get-attendance
```

**Test POST (tambah data):**
```bash
curl -X POST https://YOUR_NETLIFY_URL/.netlify/functions/add-attendance `
  -H "Content-Type: application/json" `
  -d '{"name":"Budi","timestamp":"2026-02-07T10:00:00Z"}'
```

**Test GET lagi (seharusnya ada 1 record):**
```bash
curl https://YOUR_NETLIFY_URL/.netlify/functions/get-attendance
```

---

## 🎉 Selesai!

Aplikasi Anda sekarang:
✅ **Live di cloud** (URL publik)
✅ **Connected ke Supabase** (cloud database)
✅ **Multi-user** (siapa saja bisa akses)
✅ **CRUD berfungsi** (GET/POST/PUT/DELETE)

---

## 📱 Share ke Banyak Orang

Beritahu user Anda buka URL:
```
https://YOUR_NETLIFY_URL/.netlify/functions/get-attendance
```

Atau gunakan cURL/Postman untuk test API.

---

## Troubleshooting

### Error 500 di endpoints?
1. Cek env vars sudah set di Netlify
2. Cek SUPABASE_URL & KEY benar (copy-paste ulang)
3. Di Netlify Builds tab, lihat deploy logs untuk error detail

### Deployment failed?
1. Cek GitHub repo punya semua files
2. Cek `package.json` ada
3. Di Netlify Deploy logs, lihat error message

---

**Next:** Monitor & test! 🚀
