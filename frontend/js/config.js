/* Konfigurasi aplikasi. Ubah di sini. */
window.CONFIG={
  API_BASE:"",            // "" = backend sama dengan frontend. Jika terpisah: "http://localhost:8000"
  MAP_PROVIDER:"indonesia", // "indonesia" (peta Indonesia vektor, bawaan, tanpa internet), "tiles" (peta jalan dunia nyata OSM/CARTO), "google" (butuh GOOGLE_MAPS_KEY)
  TILE_STYLE:"carto",     // "carto" (mengikuti tema gelap/terang) atau "osm" (OpenStreetMap standar)
  GOOGLE_MAPS_KEY:"",     // kunci Google Maps JavaScript API milikmu
  REFRESH_MS:300000       // muat ulang data live tiap 5 menit
};
/* Warna dan label tingkat risiko, serta poligon pulau untuk peta cadangan (SVG) */
var RC={"Hijau":"#6b9a4a","Kuning":"#e3b23c","Oranye":"#e07b2e","Merah":"#c0392b","Abu-abu":"#8a8178"};
var RN={"Hijau":"Rendah","Kuning":"Sedang","Oranye":"Tinggi","Merah":"Sangat tinggi","Abu-abu":"Data belum cukup (bukan berarti aman)"};
