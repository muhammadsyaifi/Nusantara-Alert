# Nusantara-Alert

Dasbor pemantauan bencana Indonesia bergaya aplikasi operasi: peta Indonesia vektor interaktif, kartu detail melayang di atas peta, halaman detail dengan penjelasan lengkap, pusat notifikasi, dan data dari lembaga resmi (BMKG, PVMBG/MAGMA, BNPB). Tidak terhubung ke AI eksternal. Menu Bantuan sudah dihapus; asisten keselamatan lokal tetap berupa tombol Waspada AI.

## Struktur
```
Nusantara-Alert/
├─ frontend/                    HTML/CSS/JS biasa, tanpa build dan tanpa CDN (kecuali font)
│  ├─ index.html
│  ├─ css/style.css             tema gelap & terang, animasi, responsif
│  └─ js/
│     ├─ config.js              pengaturan (API_BASE, MAP_PROVIDER, kunci Google Maps), warna risiko
│     ├─ state.js               status bersama + fungsi bantu
│     ├─ data/snapshot.js       data cuplikan 29 Okt 2026 (cadangan jika backend tidak aktif)
│     ├─ data/indonesia-map.js  poligon peta Indonesia (hasil penelusuran gambar referensi)
│     ├─ api.js                 ambil data live dari backend
│     ├─ map-indo.js            peta Indonesia SVG: geser, zoom, layar penuh, skala, koordinat
│     ├─ map-leaflet.js         opsional: peta jalan dunia nyata (OSM/CARTO)
│     ├─ map-google.js          opsional: Google Maps
│     ├─ map.js                 pemilih penyaji peta
│     ├─ explain.js             penjelasan detail tiap jenis kejadian
│     ├─ ui.js                  toolbar, hero, ticker, kartu, halaman detail, tema
│     ├─ notif.js               pusat notifikasi (lonceng)
│     ├─ evac.js                peta provinsi + garis jalur evakuasi + status peringatan
│     ├─ live-bmkg.js           gempa langsung dari BMKG tanpa backend
│     └─ main.js                inisialisasi dan loading screen
├─ backend/                     FastAPI (opsional, untuk data live)
│  ├─ main.py                   /api/events, /api/hotspots, /api/health
│  ├─ events.py                 pembentuk objek kejadian
│  ├─ sources/bmkg.py           gempa, peringatan cuaca (CAP), kekeringan, hujan tinggi
│  ├─ sources/firms.py          titik panas asli NASA FIRMS
│  ├─ sources/manual.py         membaca data/volcano.json dan data/bnpb_events.json
│  └─ data/                     data gunung api (MAGMA) dan kejadian BNPB
└─ .env.example
```

## Menjalankan
**A. Frontend saja (data snapshot)**
```
cd frontend
python -m http.server 5500      # buka http://localhost:5500
```
**B. Frontend + backend (data live)**
```
cd backend
python -m venv .venv && source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env         # opsional: isi FIRMS_MAP_KEY
uvicorn main:app --reload --port 8000                # buka http://localhost:8000
```
Jika frontend dijalankan terpisah, isi `API_BASE:"http://localhost:8000"` di `frontend/js/config.js`.

## Tampilan
- **Toolbar di atas**: menu (indikator geser), pencarian (Ctrl+K), lonceng notifikasi, tombol tema ☀/☾, dan chip ringkasan.
- **Tema gelap selalu menjadi tampilan awal.** Mode terang (putih + hijau limau) bisa dicoba lewat tombol tema selama sesi; tidak disimpan.
- **Layar loading** gelap: peta Indonesia tergambar dan terisi sesuai progres, titik kota berdenyut, persen berjalan.
- **Animasi** pada tiap komponen (masuk bertahap, hover, hitung naik, pengukur, indikator menu); dikurangi otomatis bagi pengguna yang memilih "kurangi gerakan".
- **Penjelasan detail** di halaman detail: apa artinya, yang perlu diperhatikan, langkah yang disarankan, keterbatasan data (informasi umum, bukan prediksi).

## Peta
- **Bawaan (`MAP_PROVIDER:"indonesia"`)**: peta Indonesia vektor dengan batas provinsi, nama laut/kota/provinsi sesuai zoom, kompas arah, skala, dan koordinat kursor. Tanpa internet. Bentuknya berasal dari penelusuran gambar referensi, jadi pulau yang sangat kecil bisa tidak tampak.
- **`"tiles"`**: peta jalan dunia nyata (OpenStreetMap/CARTO) via Leaflet, dimuat saat dibutuhkan; jika gagal, kembali ke peta bawaan. Penggunaan berat/komersial perlu penyedia tile sendiri; atribusi tampil di peta.
- **`"google"`**: isi `GOOGLE_MAPS_KEY` (aktifkan Maps JavaScript API).
- Geser (seret/jari/panah), zoom (roda/cubit/klik dua kali/tombol), layar penuh (⤢, Esc), kunci geser ✋/🔒 untuk HP.

## Notifikasi
Klik lonceng untuk membuka panel peringatan penting (merah/Awas, oranye/Siaga, peringatan cuaca aktif). Panel tetap terbuka saat data diperbarui; item yang diklik terbuka di peta dan ditandai terbaca (disimpan di browser). Peringatan baru saat pembaruan data memunculkan pemberitahuan singkat.

## Pembaruan data
Data snapshot terakhir diperbarui **29 Okt 2026** dari: BMKG (gempa bumi terkini dan dirasakan, peringatan dini cuaca, kekeringan dasarian III Okt, hujan tinggi dasarian III Okt dan prakiraan November), laporan harian MAGMA/PVMBG (gunung api Siaga), ringkasan BNPB 18-28 Okt, dan jumlah hotspot SiPongi (27 Okt, kutipan Databoks). Dengan backend, data BMKG diambil otomatis tiap 5 menit; MAGMA dan BNPB masih manual lewat `backend/data/*.json`; titik panas asli butuh `FIRMS_MAP_KEY`.

| Data | Sumber | Status |
|---|---|---|
| Gempa bumi | BMKG | otomatis (backend) |
| Peringatan dini cuaca | BMKG CAP | otomatis (backend) |
| Kekeringan, hujan tinggi | BMKG (halaman web) | otomatis (scraper tabel) |
| Titik panas satelit | NASA FIRMS | otomatis jika FIRMS_MAP_KEY diisi |
| Gunung api | PVMBG / MAGMA | manual: `backend/data/volcano.json` |
| Karhutla, banjir, longsor | BNPB | manual: `backend/data/bnpb_events.json` |

## Catatan
- **Backend belum diuji terhadap server asli** (ditulis tanpa akses internet; parser BMKG diuji dengan data contoh). Jika satu sumber gagal, sumber lain tetap jalan dan `meta.sources` menunjukkan mana yang error. Parser tabel kekeringan/hujan perlu disesuaikan bila tampilan situs BMKG berubah.
- Kategori risiko gempa adalah analisis internal dari magnitudo, bukan status resmi. Aplikasi ini tidak memprediksi bencana dan tidak menggantikan peringatan BMKG, BNPB, atau PVMBG.

## Tambahan: Cuaca, Peringatan Lokasi, Jalur Evakuasi, Wilayah
File baru (modul lama tidak diubah): `frontend/js/safety.js`, `frontend/css/safety.css`, `frontend/js/data/regions.js`, `frontend/vercel.json`. Menu baru di sidebar: **Cuaca & Lokasi**, **Jalur Evakuasi**, **Wilayah**; kartu lokasi di Beranda; kolom pencarian kini juga mencari kota/kabupaten/kecamatan.
- **Cuaca**: Open-Meteo (tanpa API key), diminta langsung dari browser setelah izin lokasi diberikan. Bukan prakiraan resmi BMKG.
- **Peringatan lokasi**: gabungan prakiraan cuaca (kelas curah hujan BMKG + ambang internal) dan kejadian BMKG/PVMBG/BNPB di sekitar lokasi pengguna.
- **Jalur evakuasi**: titik kumpul/posko/RS/pemadam/polisi dari OpenStreetMap (Overpass), rute jalan dari FOSSGIS/OSRM. Bukan jalur resmi pemerintah; kelengkapan tergantung pemetaan OSM.
- **Wilayah**: 38 provinsi, 514 kabupaten/kota, 7.265 kecamatan (sumber: cahyadsn/wilayah, MIT). Label kota/kabupaten muncul bertahap saat peta di-zoom. Koordinat kecamatan tidak tersedia di sumber.
- **Hosting**: folder `frontend` adalah situs statis (Vercel/Netlify/GitHub Pages). Wajib HTTPS agar izin lokasi bekerja. Backend FastAPI tetap opsional.

## Peta Jalur Evakuasi (baru)
Menu **Jalur Evakuasi** kini berupa peta 38 provinsi berwarna (`js/evac.js`, `css/evac.css`, `js/data/provinces-geo.js`).
- **Status peringatan per provinsi** dihitung dari kejadian di dasbor (gempa M ≥ 4,5 dalam 7 hari, gunung api Siaga/Awas, peringatan cuaca, karhutla/banjir/longsor) dan dihitung ulang tiap data diperbarui (5 menit). Mode *Tingkat peringatan* mewarnai provinsi hijau → kuning → oranye → merah.
- **Garis jalur evakuasi per wilayah**: klik provinsi → dimuat dari OpenStreetMap (Overpass) ruas jalan bertanda `evacuation_route`, titik kumpul (`emergency=assembly_point`), rumah sakit, dan pos pemadam, lalu garis putus-putus rute jalan (OSRM) dari pusat 10 kabupaten/kota terbesar ke titik evakuasi terdekat. Tombol *Lokasiku* menambah rute jalan kaki dari posisi pengguna.
- **Pembaruan tanpa backend**: `js/live-bmkg.js` mengambil gempa terbaru langsung dari data.bmkg.go.id. Cuaca, gunung api, dan BNPB tetap cuplikan (ditandai, tidak dipakai mewarnai status) sampai backend dijalankan.
- Batas provinsi: *Indonesia GeoJSON & TopoJSON Maps (38 Provinces)*, CC BY 4.0 (denyherianto). Titik/jalur: © OpenStreetMap (ODbL). Bukan jalur resmi pemerintah; rujuk BPBD dan InaRISK BNPB.
- **Sambungan InaRISK BNPB**: kotak *Jalur resmi BNPB* menampilkan layanan peta publik `gis.bnpb.go.id` (Arah_jalur_evakuasi, Jalur_evakuasi, RENEVAK_tsunami, Peta_Rencana_Evakuasi_Cilacap1, JALUR_EVAKUASI_KOTA_AMBON, JALUR_EVAKUASI_WILBAR) sebagai lapisan gambar (zoom ≥ 8). Pilihan *Lapisan bahaya* menampilkan raster bahaya InaRISK (tsunami, gempa, banjir, longsor, gunung api, karhutla). Layanan BNPB hanya mencakup daerah yang sudah dipetakan; tidak ada data jalur evakuasi resmi nasional.
