/* Waspada AI: asisten keselamatan bencana. Berjalan di browser, menjawab dari data dasbor (cuaca, peringatan, gempa, gunung api)
   dan panduan umum. Berbasis aturan, bukan model bahasa generatif; tidak memprediksi bencana. */
(function(){
var N=window.NA;if(!N)return;
var SUG=["Cuaca di lokasiku","Ada peringatan apa?","Gempa terbaru","Gunung api siaga","Apa yang harus dilakukan saat banjir?","Cara ke titik evakuasi","Nomor darurat","Tentang website ini"];
var TP=[["banjir","**Saat banjir**\n• Pindah ke tempat lebih tinggi sebelum air naik.\n• Matikan listrik dan gas jika aman.\n• Jangan menyeberangi arus deras atau genangan yang dalamnya tidak jelas.\n• Siapkan tas siaga dan dokumen penting.\n• Pantau BMKG dan BPBD setempat."],
["tsunami","**Tsunami**\n• Jika di pantai dan gempa terasa kuat atau lama, atau air laut surut tiba-tiba, segera ke tempat tinggi atau lantai atas gedung kokoh.\n• Jangan menunggu sirene.\n• Jangan kembali sebelum BMKG mencabut peringatan."],
["gempa","**Saat gempa**\n• Merunduk, berlindung di bawah meja kokoh, dan lindungi kepala.\n• Jauhi kaca, lemari, dan bangunan retak.\n• Di luar ruangan, menjauh dari gedung dan tiang.\n• Setelah gempa, periksa luka, cek kebocoran gas, dan waspadai gempa susulan.\n• Di pesisir, ikuti panduan tsunami."],
["longsor","**Longsor**\n• Tanda: retakan tanah, pohon miring, air keruh dari lereng.\n• Saat hujan deras, tinggalkan area lereng dan bantaran sungai.\n• Jangan kembali sebelum petugas menyatakan aman."],
["erupsi|gunung meletus|abu vulkanik|letusan","**Erupsi gunung api**\n• Patuhi radius rekomendasi PVMBG.\n• Pakai masker dan kacamata saat hujan abu.\n• Hindari lembah sungai di lereng gunung (lahar).\n• Tutup sumber air dan ikuti arahan evakuasi BPBD."],
["karhutla|kebakaran hutan|asap","**Karhutla dan asap**\n• Jangan membakar lahan.\n• Pakai masker saat asap tebal dan kurangi aktivitas luar.\n• Laporkan titik api ke BPBD setempat."],
["petir|badai","**Petir dan badai**\n• Berlindung di bangunan, jauhi pohon tinggi, lapangan terbuka, dan perairan.\n• Cabut peralatan listrik jika memungkinkan."],
["tas siaga|perlengkapan|persiapan","**Isi tas siaga**\n• Air minum dan makanan tahan lama\n• Senter, baterai, power bank, radio\n• Obat pribadi dan P3K\n• Salinan dokumen penting dan uang tunai\n• Pakaian, masker, peluit"]];
var el={};
function f(t){return esc(t).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>")}
function say(t,me,acts){
  var d=document.createElement("div");d.className="wm "+(me?"u":"b");d.innerHTML=me?esc(t):f(t);
  if(acts){var a=document.createElement("div");a.className="wa";acts.forEach(function(x){var b=document.createElement("button");b.textContent=x[0];b.onclick=x[1];a.appendChild(b)});d.appendChild(a)}
  el.log.appendChild(d);el.log.scrollTop=el.log.scrollHeight;
}
function wxText(w,name){
  var c=w.current,cc=N.wc(c.weather_code),D=w.daily,L=["Hari ini","Besok","Lusa"];
  return "**Cuaca di "+name+"**\nSaat ini "+cc[1]+" "+cc[0]+", "+Math.round(c.temperature_2m)+" °C (terasa "+Math.round(c.apparent_temperature)+" °C), kelembapan "+c.relative_humidity_2m+"%, angin "+Math.round(c.wind_speed_10m)+" km/jam.\n"+
  D.time.map(function(t,i){return "• "+L[i]+": "+N.wc(D.weather_code[i])[0]+", "+Math.round(D.temperature_2m_min[i])+"–"+Math.round(D.temperature_2m_max[i])+" °C, hujan ±"+Math.round(D.precipitation_sum[i])+" mm"}).join("\n")+"\nSumber: Open-Meteo (bukan prakiraan resmi BMKG).";
}
function needLoc(){say("Aku butuh lokasimu untuk menjawab ini. Aktifkan izin lokasi atau pilih wilayah manual di menu Cuaca & Lokasi.",0,[["Aktifkan lokasi",function(){N.locate()}],["Pilih wilayah manual",function(){show("loc")}]])}
function findK(t){var b=null,bl=0;RG.K.forEach(function(k){var n=k[1].toLowerCase().replace(/^(kota|kabupaten|kab\.) /,"");if(n.length>=4&&n.length>bl&&new RegExp("(^|[^a-z])"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z])").test(t)){b=k;bl=n.length}});return b}
function ans(q){
  var t=q.toLowerCase(),h=function(x){return new RegExp(x).test(t)},S=N.SF,A;
  if(h("^(halo|hai|hi|selamat)"))return say("Halo! Aku Waspada AI. Tanyakan cuaca, peringatan di sekitarmu, gempa terbaru, atau panduan keselamatan.");
  if(h("terima kasih|makasih"))return say("Sama-sama. Tetap waspada dan siaga!");
  if(h("tentang|website ini|aplikasi ini|nusantara-alert|fungsi|cara pakai"))return say("**Nusantara-Alert** memantau gempa, gunung api, cuaca ekstrem, karhutla, banjir, dan longsor di Indonesia dari BMKG, PVMBG, dan BNPB, lengkap dengan cuaca lokasi, peta jalur evakuasi, dan data wilayah. Aku menjawab dari data di dasbor dan tidak memprediksi bencana.",0,[["Buka halaman Tentang",function(){show("about")}]]);
  if(h("nomor|darurat|telepon|hubungi"))return say("**Nomor darurat**\n• 112 Layanan darurat umum\n• 115 Basarnas\n• 117 BNPB\n• 119 Ambulans (Kemenkes)");
  if(h("aktifkan lokasi|lokasi saya|lokasiku")&&!h("cuaca|peringatan")){N.locate();return say("Meminta izin lokasi di browser…")}
  if(h("evakuasi|mengungsi|titik kumpul|jalur")){return say("**Menuju titik evakuasi**\n• Buka peta jalur evakuasi, aktifkan lokasi, lalu cari titik terdekat.\n• Pilih titik untuk melihat rute dan buka di Google Maps.\n• Titik berasal dari OpenStreetMap, bukan jalur resmi; pastikan juga lewat BPBD setempat atau 112.",0,[["Buka peta evakuasi",function(){show("evac")}]])}
  for(var i=0;i<TP.length;i++)if(h(TP[i][0])&&!h("terbaru|terkini|siaga hari"))return say(TP[i][1]);
  if(h("peringatan|bahaya|aman|waspada")){if(!S.pos)return needLoc();A=N.alerts();if(!A.length)return say("Tidak ada peringatan pada data yang tersedia di sekitar "+S.K[1]+". Ini bukan jaminan aman; ikuti BMKG, BNPB, dan BPBD.");
    return say("**Peringatan di sekitar "+S.K[1]+"** ("+A.length+")\n"+A.slice(0,5).map(function(a){return "• ["+["Info","Perhatian","Siaga","Bahaya"][a.l]+"] "+a.t}).join("\n"),0,[["Lihat semua",function(){show("loc")}]])}
  if(h("gunung")){var V=EV.filter(function(e){return e.k=="Gunung api"});return say(V.length?"**Gunung api berstatus tinggi di data dasbor**\n"+V.map(function(e){return "• "+e.lb+": "+(e.lv||"").split(". ")[0]}).join("\n")+"\nSumber: PVMBG/MAGMA. Patuhi radius rekomendasi PVMBG.":"Belum ada gunung api berstatus tinggi pada data dasbor.")}
  if(h("gempa")){var Q=EV.filter(function(e){return e.k=="Gempa bumi"}),near=h("dekat|sekitar|lokasi");
    if(near&&S.pos)Q=Q.slice().sort(function(a,b){return N.hav(S.pos.lat,S.pos.lon,a.y,a.x)-N.hav(S.pos.lat,S.pos.lon,b.y,b.x)});
    return say("**Gempa "+(near&&S.pos?"terdekat":"terbaru")+"**\n"+Q.slice(0,4).map(function(e){return "• M "+e.m.toFixed(1)+" · "+e.w+" · "+e.tt+(near&&S.pos?" · "+N.fD(N.hav(S.pos.lat,S.pos.lon,e.y,e.x)):"")}).join("\n")+"\nSumber: BMKG"+(MODE!="live"?" (cuplikan 29 Okt 2026; hubungkan backend untuk data terbaru)":"")+".")}
  if(h("cuaca|hujan|panas|angin|suhu|prakiraan|petir")){
    var k=findK(t);if(k){say("Mengambil prakiraan "+k[1]+"…");return N.loadWx(k[2],k[3]).then(function(w){say(wxText(w,k[1]))}).catch(function(){say("Data cuaca belum bisa dimuat. Periksa koneksi internet.")})}
    if(!S.pos)return needLoc();if(!S.wx)return say("Data cuaca belum termuat. Coba lagi sebentar.");return say(wxText(S.wx,S.K[1]))}
  var k2=findK(t);if(k2)return say("**"+k2[1]+"** ("+N.pv(k2)+") punya "+(RG.C[k2[0]]||[]).length+" kecamatan. Mau lihat cuacanya atau lokasinya di peta?",0,[["Cuaca di sini",function(){N.setPos(k2[2],k2[3],true,k2);show("loc")}],["Lihat di peta",function(){N.rgGo(k2[0])}]]);
  say("Aku belum paham pertanyaan itu. Aku bisa membantu soal cuaca, peringatan di sekitarmu, gempa dan gunung api, panduan keselamatan (banjir, gempa, tsunami, longsor, erupsi, karhutla), titik evakuasi, dan nomor darurat.");
}
function send(q){q=q.trim();if(!q)return;say(q,1);setTimeout(function(){ans(q)},250)}
function open(on){el.p.hidden=!on;el.fab.classList.toggle("on",on);if(on&&!el.log.children.length){say("Halo, aku **Waspada AI**. Aku menjawab dari data dasbor Nusantara-Alert dan panduan umum keselamatan; aku bukan peringatan resmi dan tidak memprediksi bencana.");}if(on)setTimeout(function(){el.q.focus()},50)}
el.fab=document.createElement("button");el.fab.id="wai-fab";el.fab.innerHTML="<span>🛡️</span><b>Waspada AI</b>";
el.p=document.createElement("section");el.p.id="wai";el.p.hidden=true;
el.p.innerHTML='<header><div class="wai-av">🛡️</div><div><b>Waspada AI</b><small>Asisten keselamatan · berbasis data dasbor</small></div><button id="wai-x" aria-label="Tutup">×</button></header><div id="wai-log"></div><div id="wai-sug"></div><form id="wai-f"><input id="wai-q" placeholder="Tanya cuaca, gempa, evakuasi…" autocomplete="off"><button class="btn green">Kirim</button></form>';
document.body.appendChild(el.fab);document.body.appendChild(el.p);
el.log=el.p.querySelector("#wai-log");el.q=el.p.querySelector("#wai-q");
el.p.querySelector("#wai-sug").innerHTML=SUG.map(function(s){return"<button>"+esc(s)+"</button>"}).join("");
el.p.querySelector("#wai-sug").onclick=function(e){if(e.target.tagName=="BUTTON")send(e.target.textContent)};
el.p.querySelector("#wai-f").onsubmit=function(e){e.preventDefault();send(el.q.value);el.q.value=""};
el.p.querySelector("#wai-x").onclick=function(){open(false)};el.fab.onclick=function(){open(el.p.hidden)};
document.addEventListener("keydown",function(e){if(e.key=="Escape"&&!el.p.hidden)open(false)});

/* Penjelasan di halaman Tentang */
var ab=document.getElementById("v-about");
if(ab){var c=document.createElement("div");c.className="card about-more";c.innerHTML=
'<h3>Tentang website ini</h3><p>Nusantara-Alert adalah dasbor pemantauan bencana Indonesia yang menggabungkan informasi dari lembaga resmi dalam satu peta, lalu menghubungkannya dengan lokasi pengguna supaya informasinya relevan dan bisa ditindaklanjuti.</p>'+
'<h4>Fitur utama</h4><ul><li><b>Peta Indonesia interaktif</b>: gempa, gunung api, cuaca ekstrem, karhutla, banjir, dan longsor; geser, zoom, dan filter kategori.</li><li><b>Cuaca &amp; Lokasi</b>: prakiraan cuaca dan peringatan di sekitar lokasimu saat izin lokasi diaktifkan, atau untuk wilayah yang dipilih manual.</li><li><b>Jalur Evakuasi</b>: titik kumpul, posko, rumah sakit, pemadam, dan polisi terdekat, rute jalan kaki atau mobil, dan tombol buka di Google Maps.</li><li><b>Wilayah</b>: 38 provinsi, 514 kabupaten/kota, dan 7.265 kecamatan; label kota dan kabupaten muncul bertahap saat peta di-zoom.</li><li><b>Waspada AI</b>: asisten (tombol 🛡️ di pojok kanan bawah) yang menjawab tentang cuaca, peringatan, gempa, gunung api, panduan keselamatan, dan nomor darurat.</li><li><b>Notifikasi dan tema</b>: lonceng untuk peringatan penting, serta tema terang dan gelap.</li></ul>'+
'<h4>Cara menggunakan</h4><ol><li>Buka Beranda untuk gambaran kejadian terbaru dan klik penanda di peta untuk detail.</li><li>Aktifkan lokasi di kartu lokasi agar cuaca dan peringatan menyesuaikan tempatmu.</li><li>Buka Jalur Evakuasi, cari titik terdekat, lalu ikuti rute atau buka di Google Maps.</li><li>Tanyakan hal lain ke Waspada AI.</li></ol>'+
'<h4>Sumber data</h4><p>Gempa dan peringatan cuaca dari BMKG, status gunung api dari PVMBG (MAGMA), kejadian darat dari BNPB. Prakiraan cuaca lokasi dari Open-Meteo, peta dan titik evakuasi dari OpenStreetMap, rute dari FOSSGIS/OSRM, data wilayah dari repositori terbuka cahyadsn/wilayah.</p>'+
'<h4>Tentang Waspada AI</h4><p>Waspada AI berjalan di browser dan menjawab berdasarkan data dasbor serta panduan umum keselamatan. Ia bukan model bahasa generatif, tidak memprediksi bencana, dan tidak menggantikan peringatan resmi.</p>'+
'<h4>Privasi dan batasan</h4><p>Lokasi hanya dibaca oleh browser kamu dan koordinat dikirim ke layanan cuaca dan peta untuk mengambil data; aplikasi ini tidak menyimpannya. Jalur evakuasi berasal dari data peta terbuka, bukan jalur resmi pemerintah; rujuk BPBD setempat. Data kejadian berupa cuplikan jika backend belum aktif.</p>';
ab.appendChild(c)}
})();
