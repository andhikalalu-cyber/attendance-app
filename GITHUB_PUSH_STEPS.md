# 📤 PUSH KE GITHUB - Instruksi Lengkap

## Status Saat Ini
✅ Git sudah initialized  
✅ Files sudah di-commit  
✅ Supabase credentials sudah ada di `.env`

## Langkah Berikutnya: Push ke GitHub

### Step 1: Buat Repository di GitHub

1. **Buka:** https://github.com/new
2. **Isi form:**
   - Repository name: `attendance-app`
   - Description: `Attendance tracking app with Supabase integration`
   - Visibility: **Public** (penting! agar Netlify bisa akses)
3. **Jangan centang "Initialize this repository with..."**
4. **Klik "Create repository"**

**Akan muncul halaman dengan instruksi, copy URL seperti ini:**
```
https://github.com/YOUR_USERNAME/attendance-app.git
```

---

### Step 2: Push ke GitHub

1. **Buka PowerShell** di folder proyek:
```bash
cd c:\Users\andik\Desktop\attendance-app
```

2. **Add remote origin** (ganti `YOUR_USERNAME` dengan GitHub username Anda):
```bash
git remote add origin https://github.com/YOUR_USERNAME/attendance-app.git
```

3. **Set branch ke `main`:**
```bash
git branch -M main
```

4. **Push ke GitHub:**
```bash
git push -u origin main
```

5. **Saat diminta password/token:**
   - Username: `YOUR_USERNAME`
   - Password: Gunakan **Personal Access Token** (bukan password biasa)
   
   Untuk generate token:
   - Buka: https://github.com/settings/tokens
   - Klik **Generate new token** → **Generate new token (classic)**
   - Name: `netlify-deploy`
   - Scopes: ✓ `repo` (full control)
   - Klik **Generate token**
   - **Copy token yang dihasilkan** (hanya muncul sekali!)
   - Paste sebagai password saat diminta

---

## Verifikasi Berhasil

Jika push berhasil:
- Buka https://github.com/YOUR_USERNAME/attendance-app
- Anda harus lihat semua files ada di repo

---

## Lanjut ke Netlify

Setelah push berhasil, buka file: `NETLIFY_DEPLOY_STEPS.md`
