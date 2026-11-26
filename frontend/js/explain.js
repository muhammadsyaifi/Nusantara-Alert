/* Penjelasan yang lebih detail untuk setiap kejadian/peringatan (informasi umum, bukan prediksi). */
function mclass(m){return m<3?"mikro (di bawah M3)":m<4?"minor (M3–3,9)":m<5?"ringan (M4–4,9)":m<6?"sedang (M5–5,9)":m<7?"kuat (M6–6,9)":m<8?"besar (M7–7,9)":"sangat besar (M8 ke atas)"}
function dclass(k){return k<60?"dangkal (di bawah 60 km), guncangan di permukaan cenderung terasa lebih kuat":k<=300?"menengah (60–300 km)":"dalam (di atas 300 km), guncangan cenderung lebih lemah di permukaan"}
function lvlName(e){var s=e.lv||"";return/Awas/.test(s)?"Awas":/Siaga|Level III/.test(s)?"Siaga":/Waspada/.test(s)?"Waspada":""}
function explainShort(e){
  var n=lvlName(e);
  if(e.k=="Gempa bumi")return"Gempa "+mclass(e.m).split(" (")[0]+", kedalaman "+dep(e.dp)+" ("+e.dp+" km)"+(e.f?"; dirasakan oleh warga.":".");
  if(e.k=="Gunung api")return"Aktivitas gunung api berstatus Siaga (Level III): potensi erupsi, ikuti zona bahaya PVMBG.";
  if(e.k=="Karhutla")return"Kebakaran hutan/lahan yang dilaporkan BNPB; asap dapat memengaruhi udara di sekitarnya.";
  if(e.k=="Banjir/longsor")return"Banjir atau tanah longsor yang dilaporkan BNPB; waspadai hujan susulan.";
  if(e.k=="Cuaca ekstrem")return"Peringatan dini BMKG: hujan sedang–lebat, petir, atau angin kencang dalam beberapa jam ke depan.";
  if(e.k=="Kekeringan")return"Peringatan kekeringan meteorologis BMKG tingkat "+(n||"-")+" untuk periode dasarian ini.";
  if(e.k=="Hujan tinggi")return"Potensi curah hujan tinggi (tingkat "+(n||"-")+"); belum tentu terjadi banjir.";
  return"";
}
function explain(e){
  var q=e.k=="Gempa bumi",n=lvlName(e),A=[],P=[],L=[],B=[];
  if(q){
    A.push("Magnitudo M"+e.m.toFixed(1)+" termasuk gempa "+mclass(e.m)+".","Kedalaman pusat gempa "+e.dp+" km termasuk "+dclass(e.dp)+".");
    A.push(e.ts?"Informasi tsunami dari BMKG: "+e.ts+".":"Keterangan potensi tsunami tidak tercantum pada data ini.");
    if(e.f){P.push("Wilayah yang melaporkan guncangan: "+e.f+".");P.push("Skala intensitas (MMI): II–III getaran ringan terasa di dalam rumah; IV–V dirasakan banyak orang dan benda bergetar; VI ke atas dapat menimbulkan kerusakan ringan pada bangunan yang lemah.")}
    else P.push("Belum ada laporan wilayah yang merasakan pada data ini.");
    if(e.m>=5)P.push("Pada gempa M5 ke atas, gempa susulan bisa terjadi; BMKG tidak dapat memprediksi waktunya.");
    L.push("Saat terjadi guncangan: lindungi kepala, berlindung di bawah meja kokoh, dan jauhi kaca atau benda yang bisa jatuh.","Jika berada di pantai dan merasakan guncangan kuat atau lama, segera menjauh ke tempat yang lebih tinggi tanpa menunggu peringatan.","Setelah gempa, periksa kondisi bangunan sebelum masuk kembali dan pantau informasi resmi BMKG.");
    B.push("Kategori warna adalah analisis internal dari magnitudo, bukan status resmi BMKG.","Parameter gempa dapat diperbarui BMKG setelah analisis lanjutan.","Data tidak memuat dampak (kerusakan atau korban).");
  }else if(e.k=="Gunung api"){
    A.push("Status Level III (Siaga) pada skala PVMBG berarti terjadi peningkatan aktivitas vulkanik yang menunjukkan potensi erupsi.","Tingkatan resminya: Level I Normal, Level II Waspada, Level III Siaga, Level IV Awas.");
    P.push("Laporan terakhir dan rekomendasi zona bahaya tertulis pada kolom Rincian di sebelah kiri.","Perubahan status ditetapkan PVMBG dan dapat berubah sewaktu-waktu mengikuti hasil pemantauan.");
    L.push("Patuhi zona/radius bahaya yang ditetapkan PVMBG dan pemerintah daerah; jangan beraktivitas di dalamnya.","Siapkan masker dan pelindung mata untuk antisipasi hujan abu; waspadai aliran lahar di alur sungai saat hujan.","Pantau MAGMA Indonesia dan BPBD setempat untuk informasi terkini.");
    B.push("Hanya gunung berstatus Siaga dari laporan MAGMA yang ditampilkan; daftar Waspada dan Normal belum ada.","Titik adalah koordinat puncak (perkiraan).");
  }else if(e.k=="Karhutla"){
    A.push("Kejadian kebakaran hutan dan lahan (karhutla) yang dilaporkan BNPB di "+e.w+". Rincian kejadian ada pada kolom Rincian.");
    P.push("Asap dapat menurunkan kualitas udara hingga jauh dari lokasi api, terutama bagi anak-anak, lansia, dan penderita gangguan pernapasan.","Titik panas satelit adalah anomali suhu permukaan, bukan jumlah kebakaran.");
    L.push("Saat asap pekat, kurangi aktivitas luar ruang dan gunakan masker yang sesuai.","Jangan membakar lahan atau sampah; laporkan api ke BPBD atau petugas pemadam setempat.","Ikuti arahan pemerintah daerah bila ada imbauan evakuasi.");
    B.push("Titik menunjukkan perkiraan kabupaten, bukan lokasi api yang tepat.","Hanya kejadian yang dilaporkan BNPB, bukan seluruh kejadian di Indonesia.");
  }else if(e.k=="Banjir/longsor"){
    A.push("Kejadian banjir atau tanah longsor yang dilaporkan BNPB di "+e.w+". Rincian kejadian ada pada kolom Rincian.");
    P.push("Hujan berintensitas tinggi dapat memicu banjir susulan dan longsor di lereng yang jenuh air.","Akses jalan dan infrastruktur dapat terdampak sehingga bantuan memerlukan waktu.");
    L.push("Jauhi aliran sungai dan lereng curam saat hujan lebat; jangan menerobos arus banjir.","Siapkan tas siaga (dokumen, obat, senter, makanan), dan pindah ke tempat yang lebih tinggi bila air naik.","Matikan listrik bila air masuk rumah, dan ikuti arahan BPBD.");
    B.push("Titik adalah perkiraan kabupaten; data dampak (korban, kerusakan) tidak ditampilkan.","Hanya kejadian yang dilaporkan BNPB.");
  }else if(e.k=="Cuaca ekstrem"){
    A.push("Peringatan dini cuaca BMKG (nowcasting): hujan sedang hingga lebat yang dapat disertai petir dan angin kencang.","Periode berlaku: "+e.tt+".");
    P.push("Peringatan ini jangka sangat pendek (sekitar 0–6 jam) sehingga cepat berubah.","Rincian kecamatan yang terdampak ada di situs BMKG.");
    L.push("Hindari berteduh di bawah pohon besar, tiang, atau baliho; jauhi lapangan terbuka saat petir.","Tunda aktivitas luar ruang dan pelayaran kecil sampai kondisi membaik.","Waspadai genangan di jalan dan wilayah rawan banjir atau longsor.");
    B.push("Marker berada di tengah provinsi; wilayah yang tepat lebih sempit.","Data adalah cuplikan, bukan pembaruan otomatis (kecuali mode Live).");
  }else if(e.k=="Kekeringan"){
    A.push("Peringatan dini kekeringan meteorologis BMKG tingkat "+(n||"-")+" untuk periode "+e.tt+".","Tingkat Waspada, Siaga, Awas dikaitkan dengan lamanya periode tanpa hujan dan prakiraan curah hujan; makin tinggi tingkatnya, makin panjang periode keringnya.");
    P.push("Wilayah terdampak: "+(e.det||"-"),"Kondisi kering meningkatkan risiko kebakaran lahan dan menurunnya pasokan air bersih.");
    L.push("Hemat air, dan pantau pasokan air bersih serta irigasi.","Hindari pembakaran lahan atau sampah yang dapat memicu karhutla.","Ikuti informasi pemerintah daerah mengenai bantuan air bersih.");
    B.push("Informasi bersifat meteorologis (kondisi cuaca), bukan penetapan bencana kekeringan.","Marker di tengah provinsi; rincian tingkat per kabupaten ada di teks wilayah.");
  }else if(e.k=="Hujan tinggi"){
    A.push("Peringatan potensi curah hujan tinggi dari BMKG tingkat "+(n||"-")+" untuk periode "+e.tt+".");
    P.push("Wilayah: "+(e.det||"-"),"Ini potensi, bukan laporan kejadian banjir atau longsor.");
    L.push("Bersihkan saluran air dan waspadai genangan di daerah rawan.","Jauhi lereng curam dan bantaran sungai saat hujan lebat berlangsung.","Pantau peringatan harian BMKG dan arahan BPBD.");
    B.push("Marker di tengah provinsi; detail kabupaten ada pada teks wilayah.","Potensi dapat berubah mengikuti pembaruan prakiraan.");
  }
  return{arti:A.filter(Boolean),perhatian:P.filter(Boolean),langkah:L,batas:B};
}
function explainHTML(e){
  var x=explain(e),S=[["💡","Apa artinya",x.arti],["👁","Yang perlu diperhatikan",x.perhatian],["🛟","Langkah yang disarankan",x.langkah],["ℹ️","Keterbatasan data",x.batas]];
  return'<div class="card expl"><header>Penjelasan lengkap <small>informasi umum untuk memahami data, bukan prediksi</small></header><div class="eg">'+S.map(function(s,i){return'<section class="eb" style="--i:'+i+'"><h4><i>'+s[0]+"</i>"+s[1]+"</h4><ul>"+s[2].map(function(t){return"<li>"+esc(t)+"</li>"}).join("")+"</ul></section>"}).join("")+"</div></div>";
}
