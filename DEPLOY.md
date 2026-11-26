# Panduan Deploy Nusantara-Alert

Ada dua cara. Pilih salah satu.

## Opsi A: Situs statis (paling mudah, gratis)
Folder `frontend` langsung jadi website. Gempa tetap live dari BMKG (lewat browser).
Cuaca, gunung api, dan BNPB memakai cuplikan sampai backend dijalankan.

### Vercel
1. Upload proyek ke GitHub (lihat bagian "Upload ke GitHub").
2. Buka vercel.com, Add New, Project, pilih repo.
3. Framework: Other. Tidak perlu build command. Klik Deploy.
4. Hasil: `https://nama-proyek.vercel.app` (bisa pasang domain sendiri).

Tanpa GitHub: `npm i -g vercel`, lalu `vercel --prod` di folder proyek.

### Netlify
Buka app.netlify.com/drop, seret folder `frontend`. Selesai.
Atau hubungkan repo (pengaturan sudah ada di `netlify.toml`).

### GitHub Pages
Repo, Settings, Pages, Source: GitHub Actions. Push ke `main`, workflow
`.github/workflows/pages.yml` akan mempublikasikan otomatis.

### Cloudflare Pages
Connect repo, Build command kosong, Output directory: `frontend`.

## Opsi B: Full-stack (data live lengkap, 1 URL)
Backend FastAPI sekaligus menyajikan frontend, jadi `API_BASE` tetap `""`.

### Render (ada paket gratis)
1. Upload ke GitHub.
2. render.com, New, Blueprint, pilih repo (membaca `render.yaml`).
3. Opsional: isi `FIRMS_MAP_KEY` untuk titik panas NASA FIRMS.
4. Hasil: `https://nusantara-alert.onrender.com`.
Paket gratis tidur saat sepi; akses pertama bisa lambat ~30 detik.

### Railway / Fly.io / VPS
Dockerfile sudah tersedia:
```
docker build -t nusantara-alert .
docker run -p 8000:8000 -e FIRMS_MAP_KEY=xxx nusantara-alert
```

## Upload ke GitHub
```
cd Nusantara-Alert
git init && git add . && git commit -m "Nusantara-Alert"
git branch -M main
git remote add origin https://github.com/USERNAME/nusantara-alert.git
git push -u origin main
```

## Catatan penting
- Wajib HTTPS (semua opsi di atas sudah HTTPS) agar izin lokasi/GPS bekerja.
- Jika frontend dan backend di domain terpisah, ubah `API_BASE` di
  `frontend/js/config.js` ke URL backend (CORS sudah terbuka).
- Data gunung api dan BNPB diperbarui manual lewat `backend/data/*.json`.
- Jangan commit file `.env` berisi kunci API.
