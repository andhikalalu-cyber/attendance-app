Panduan singkat: Menghubungkan aplikasi ke database via Netlify

Langkah ringkas:

1) Pilih penyedia database
- Rekomendasi: Supabase (Postgres). Alternatif: PlanetScale, MongoDB Atlas.

2) Buat project Supabase
- Buat project di https://supabase.com dan buat table `attendance` sesuai kebutuhan (mis. id, name, timestamp).

3) Ambil credentials
- Di dashboard Supabase: Settings -> API, salin `URL` (SUPABASE_URL) dan `Service Role Key` (SUPABASE_SERVICE_ROLE_KEY). Simpan aman.

4) Atur Environment Variables di Netlify
- Pada dashboard Netlify site settings -> Build & deploy -> Environment -> Add variables:
  - `SUPABASE_URL` = (nilai dari Supabase)
  - `SUPABASE_SERVICE_ROLE_KEY` = (service role key dari Supabase)

5) Deploy ke Netlify
- Push repo Anda ke GitHub/GitLab/Bitbucket dan hubungkan site di Netlify (New site -> import from Git).
- Netlify akan menginstall dependencies dari `package.json` dan menggunakan functions di `netlify/functions`.

6) Memanggil function dari frontend
- Contoh fetch (panggil dari `script.js` atau browser):

```js
fetch('/.netlify/functions/get-attendance')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

7) Test lokal (opsional)
- Install Netlify CLI: `npm i -g netlify-cli`
- Jalankan: `netlify dev` untuk menjalankan functions dan situs secara lokal.

Catatan keamanan: Jangan pernah menaruh `Service Role Key` di kode frontend. Simpan di env vars Netlify dan panggil melalui Functions.
CRUD tambahan
- GET (baca semua): `/.netlify/functions/get-attendance`
- POST (tambah): `/.netlify/functions/add-attendance` (body JSON)
- PUT (update): `/.netlify/functions/update-attendance?id=<id>` (body JSON)
- DELETE (hapus): `/.netlify/functions/delete-attendance?id=<id>`

Contoh request POST (tambah):

```js
fetch('/.netlify/functions/add-attendance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Budi', timestamp: new Date().toISOString() })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

Contoh request PUT (update):

```js
fetch('/.netlify/functions/update-attendance?id=1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Budi Updated' })
})
  .then(r => r.json())
  .then(data => console.log(data));
```

Contoh request DELETE:

```js
fetch('/.netlify/functions/delete-attendance?id=1', { method: 'DELETE' })
  .then(r => r.json())
  .then(data => console.log(data));
```

Local testing
- Tambahkan file `.env` (tidak disertakan di repo) dengan nilai dari `.env.example` saat menjalankan `netlify dev`.

```bash
npm i -g netlify-cli
netlify login
netlify dev
```

Jika butuh, saya bisa:
- Membuat validasi input di functions
- Menambahkan autentikasi (JWT) untuk menolak akses anonim
- Menghubungkan ke provider lain (PlanetScale / MongoDB Atlas)
