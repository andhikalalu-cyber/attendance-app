# ✅ Checklist Setup

Gunakan checklist ini untuk track progress Anda:

## 📦 Phase 1: Supabase Setup
- [ ] Sign up di https://supabase.com
- [ ] Create project baru: `attendance-app`
- [ ] Buat table `attendance` (copy-paste SQL dari QUICK_START.md)
- [ ] Ambil `SUPABASE_URL` dari Settings → API
- [ ] Ambil `SUPABASE_SERVICE_ROLE_KEY` dari Settings → API
- [ ] Test login ke Supabase dashboard
- [ ] Lihat table `attendance` di Table Editor (masih kosong, normal)

**✓ Phase 1 done:** Anda punya cloud database siap pakai!

---

## 💻 Phase 2: Local Setup
- [ ] Edit `.env` file (di folder proyek)
- [ ] Paste `SUPABASE_URL` 
- [ ] Paste `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Simpan `.env`
- [ ] (Optional) Test lokal: `npx netlify-cli dev`

**✓ Phase 2 done:** Credentials sudah connected!

---

## 📤 Phase 3: GitHub
- [ ] Create akun di https://github.com (jika belum)
- [ ] Install Git dari https://git-scm.com/download/win
- [ ] Setup Git: `git config --global user.name "..."`
- [ ] Setup Git: `git config --global user.email "..."`
- [ ] Jalankan `git init` di folder proyek
- [ ] Jalankan `git add .`
- [ ] Jalankan `git commit -m "Initial commit"`
- [ ] Create repo baru di https://github.com/new
- [ ] Copy repo URL (https://github.com/YOUR_USERNAME/attendance-app.git)
- [ ] Jalankan `git remote add origin <URL>`
- [ ] Jalankan `git push -u origin main`
- [ ] Verifikasi di GitHub (buka repo, lihat files)

**✓ Phase 3 done:** Code sudah di GitHub!

---

## 🚀 Phase 4: Netlify Deploy
- [ ] Create akun di https://netlify.com
- [ ] Di Netlify: **Add new site** → **Import from Git**
- [ ] Connect GitHub (authorize)
- [ ] Pilih repo `attendance-app`
- [ ] Build settings (kosongkan Build command, publish = `.`)
- [ ] Klik **Deploy site**
- [ ] **Tunggu ~2-5 menit** sampai deployment selesai
- [ ] Catat URL yang diberikan: `https://attendance-app-xyz.netlify.app`

**✓ Phase 4 done:** Site deployed!

---

## 🔐 Phase 5: Environment Variables di Netlify
- [ ] Buka site di Netlify dashboard
- [ ] Klik **Site settings**
- [ ] Klik **Build & deploy** → **Environment**
- [ ] Klik **Add environment variables**
- [ ] Variable 1:
  - Key: `SUPABASE_URL`
  - Value: (paste dari Supabase)
- [ ] Variable 2:
  - Key: `SUPABASE_SERVICE_ROLE_KEY`
  - Value: (paste dari Supabase)
- [ ] Klik **Save**
- [ ] Tab **Deploys**, klik **Trigger deploy** → **Deploy site**
- [ ] **Tunggu ~1-2 menit** sampai redeploy selesai

**✓ Phase 5 done:** Environment variables set!

---

## ✨ Phase 6: Testing
- [ ] Buka URL Netlify di browser (optional check, akan return "Not found" karena tidak ada index)
- [ ] Test GET endpoint:
  ```
  https://attendance-app-xyz.netlify.app/.netlify/functions/get-attendance
  ```
  (harusnya return `[]`)

- [ ] Test POST endpoint (gunakan PowerShell):
  ```bash
  curl.exe -X POST https://attendance-app-xyz.netlify.app/.netlify/functions/add-attendance `
    -H "Content-Type: application/json" `
    -d '{"name":"Budi","timestamp":"2026-02-07T10:00:00Z"}'
  ```
  (harusnya return record baru dengan id, name, timestamp)

- [ ] Test GET lagi:
  ```
  https://attendance-app-xyz.netlify.app/.netlify/functions/get-attendance
  ```
  (harusnya return array dengan 1 record)

**✓ Phase 6 done:** CRUD endpoints working!

---

## 🎯 Phase 7: Production Ready
- [ ] ✅ Backup credentials (SUPABASE_URL & KEY) di tempat aman
- [ ] ✅ Update `.gitignore` (pastikan `.env` ada di list - sudah dilakukan)
- [ ] ✅ Share URL ke user/team
- [ ] ✅ Test dari device lain/network lain (confirming multi-user access)
- [ ] ✅ Bookmark URLs:
  - Supabase dashboard: https://supabase.com
  - Netlify dashboard: https://netlify.com
  - GitHub repo: https://github.com/YOUR_USERNAME/attendance-app
  - App URL: `https://attendance-app-xyz.netlify.app`

**✓ Phase 7 done:** Aplikasi live & multi-user!**

---

## 🎉 Status Akhir

Jika semua checklist ✓, maka Anda punya:

✅ **Cloud Database** di Supabase (data aman)
✅ **Backend API** di Netlify (endpoints working)
✅ **Version Control** di GitHub (code safe)
✅ **URL Publik** yang bisa di-share (everyone bisa akses)
✅ **Multi-User** (unlimited concurrent users)
✅ **Scalable** (auto-scale dengan traffic)

---

## 🐛 Troubleshooting

Jika ada error, cek di sini sesuai gejala:

### Error 500 di GET/POST endpoint?
- [ ] Cek Supabase credentials di `.env` (di Netlify environment vars)
- [ ] Cek SUPABASE_URL: jangan ada trailing slash
- [ ] Cek SERVICE_ROLE_KEY: full key, bukan potongan
- [ ] Cek table `attendance` sudah dibuat di Supabase

### Push ke GitHub gagal?
- [ ] Cek git config: `git config --list`
- [ ] Cek internet connection
- [ ] Cek GitHub token (jika diminta password)

### Netlify deploy gagal?
- [ ] Cek build logs di Netlify
- [ ] Cek `package.json` ada (sudah ada)
- [ ] Re-trigger deploy

---

**Jika masih bingung, baca: TUTORIAL_SETUP.md (detail lengkap)**
