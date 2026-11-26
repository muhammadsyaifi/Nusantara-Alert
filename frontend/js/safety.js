/* Nusantara-Alert · Modul Lokasi (tambahan): cuaca, peringatan per lokasi, jalur evakuasi, wilayah kab/kota/kecamatan.
   Hanya menambah; modul lama tidak diubah. Sumber: Open-Meteo (cuaca), OpenStreetMap + Overpass (titik evakuasi),
   FOSSGIS/OSRM (rute jalan), Nominatim (nama tempat), data/regions.js (wilayah). */
(function(){
var SF={pos:null,K:null,wx:null,man:false,wid:null,seen:{},busy:0,deny:0,err:0,place:"",gp:null};
var WC={0:["Cerah","☀️"],1:["Cerah berawan","🌤️"],2:["Berawan sebagian","⛅"],3:["Berawan","☁️"],45:["Berkabut","🌫️"],48:["Berkabut","🌫️"],51:["Gerimis ringan","🌦️"],53:["Gerimis","🌦️"],55:["Gerimis lebat","🌧️"],61:["Hujan ringan","🌧️"],63:["Hujan sedang","🌧️"],65:["Hujan lebat","🌧️"],80:["Hujan lokal ringan","🌦️"],81:["Hujan lokal sedang","🌧️"],82:["Hujan lokal lebat","⛈️"],95:["Badai petir","⛈️"],96:["Petir dan es","⛈️"],99:["Petir dan es lebat","⛈️"]};
function wc(c){return WC[c]||WC[c>=95?95:c>=80?81:c>=61?63:c>=51?53:3]}
function hav(a,b,c,d){var r=Math.PI/180,x=Math.sin((c-a)*r/2),y=Math.sin((d-b)*r/2);return 12742*Math.asin(Math.sqrt(x*x+Math.cos(a*r)*Math.cos(c*r)*y*y))}
var KI={};RG.K.forEach(function(k){KI[k[0]]=k});
function near(la,lo){var b=null,bd=1e9;RG.K.forEach(function(k){var d=hav(la,lo,k[2],k[3]);if(d<bd){bd=d;b=k}});return b}
function pv(k){var c=k[0].split(".")[0];return RG.P.filter(function(p){return p[0]==c})[0][1]}
function fD(d){return d<1?Math.round(d*1000)+" m":d.toFixed(d<10?1:0)+" km"}
function fT(s){var m=Math.round(s/60);return m<60?m+" mnt":Math.floor(m/60)+" j "+(m%60)+" mnt"}
var LVN=["Info","Perhatian","Siaga","Bahaya"];

/* ---------- Peringatan per lokasi ---------- */
function alerts(){
  var A=[],p=SF.pos,K=SF.K,w=SF.wx;if(!p||!K)return A;
  var pn=pv(K).toLowerCase(),add=function(l,t,d,s,id,km){A.push({l:l,t:t,d:d,s:s,id:id,km:km||0})};
  if(w&&w.daily){w.daily.time.forEach(function(t,i){
    var D=w.daily,r=D.precipitation_sum[i]||0,g=D.wind_gusts_10m_max[i]||0,h=D.apparent_temperature_max[i]||0,c=D.weather_code[i],dn=["hari ini","besok","lusa"][i],S="Prakiraan Open-Meteo di titik lokasimu · kelas curah hujan BMKG";
    if(r>=50)add(r>=100?3:2,"Hujan "+(r>=150?"ekstrem":r>=100?"sangat lebat":"lebat")+" "+dn,"Perkiraan ±"+Math.round(r)+" mm/hari (BMKG: lebat 50–100, sangat lebat 100–150, ekstrem >150). Waspadai genangan, banjir, dan longsor dekat sungai atau lereng.",S);
    else if(r>=20)add(1,"Hujan sedang hingga lebat "+dn,"Perkiraan ±"+Math.round(r)+" mm/hari. Siapkan jas hujan dan hindari bantaran sungai.",S);
    if(c>=95)add(2,"Petir dan badai petir "+dn,"Hindari lapangan terbuka, pohon tinggi, dan perairan saat petir.",S);
    if(g>=60)add(2,"Angin sangat kencang "+dn,"Hembusan hingga ±"+Math.round(g)+" km/jam. Waspadai pohon tumbang dan gelombang tinggi.","Prakiraan Open-Meteo · ambang internal aplikasi");
    else if(g>=40)add(1,"Angin kencang "+dn,"Hembusan hingga ±"+Math.round(g)+" km/jam.","Prakiraan Open-Meteo · ambang internal aplikasi");
    if(h>=38)add(2,"Cuaca sangat panas "+dn,"Suhu terasa hingga ±"+Math.round(h)+" °C. Perbanyak minum dan hindari aktivitas berat siang hari.","Prakiraan Open-Meteo · ambang internal aplikasi");
  })}
  EV.forEach(function(e){
    var d=hav(p.lat,p.lon,e.y,e.x),k=e.k,lv=e.lv||"",age=e.d?(Date.now()-e.d)/864e5:null,ag=age==null?"":" ("+(age<1?"hari ini":Math.floor(age)+" hari lalu")+")",L=/Awas/.test(lv)?3:/Siaga|Level III/.test(lv)?2:/Waspada/.test(lv)?1:0;
    if(k=="Gempa bumi"){if((e.m>=5.5&&d<=500)||(e.m>=4.5&&d<=300)||(e.m>=3&&d<=60))add(age>7?0:(e.m>=6||d<80)?3:e.m>=5?2:1,"Gempa M "+e.m.toFixed(1)+" · "+fD(d)+" dari lokasimu",e.w+" · "+e.tt+ag+". "+(e.ts||""),e.src,e.id,d)}
    else if(k=="Gunung api"){if(d<=100)add(Math.max(L,1),e.lb+" · "+fD(d)+" dari lokasimu",(e.lv||"")+". Patuhi radius rekomendasi PVMBG.",e.src,e.id,d)}
    else if(k=="Cuaca ekstrem"||k=="Kekeringan"||k=="Hujan tinggi"){var en=e.w.toLowerCase().replace("provinsi ","").replace("dki ","");
      if(pn.indexOf(en)>=0||en.indexOf(pn)>=0||(en.indexOf("jakarta")>=0&&pn.indexOf("jakarta")>=0))add(k=="Cuaca ekstrem"?2:Math.max(L,1),e.lb+" · "+e.w,(e.det||"")+" ("+e.tt+")",e.src,e.id,d)}
    else if(/karhutla|banjir|longsor/i.test(k+" "+(e.det||""))){if(d<=150)add(1,e.lb+" · sekitar "+fD(d),(e.det||"").slice(0,170)+" (posisi perkiraan kabupaten)",e.src,e.id,d)}
  });
  return A.sort(function(a,b){return b.l-a.l||a.km-b.km}).slice(0,14);
}

/* ---------- Cuaca & lokasi ---------- */
function loadWx(la,lo){
  var u="https://api.open-meteo.com/v1/forecast?latitude="+la.toFixed(4)+"&longitude="+lo.toFixed(4)+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max,apparent_temperature_max&timezone=auto&forecast_days=3&wind_speed_unit=kmh";
  return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()});
}
function geocode(la,lo){
  if(SF.gp&&hav(la,lo,SF.gp[0],SF.gp[1])<1)return;SF.gp=[la,lo];
  fetch("https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=id&lat="+la+"&lon="+lo).then(function(r){return r.json()}).then(function(j){
    var a=j.address||{};SF.place=[a.village||a.suburb||a.neighbourhood,a.city_district||a.municipality,a.city||a.county||a.regency,a.state].filter(Boolean).join(", ");paint();
  }).catch(function(){});
}
function setPos(la,lo,man,k){
  SF.pos={lat:la,lon:lo};SF.man=!!man;SF.K=k||near(la,lo);SF.busy=0;SF.deny=0;SF.place="";if(!man)geocode(la,lo);else SF.gp=null;refreshWx();
}
function refreshWx(){
  if(!SF.pos)return;var p=SF.pos;paint();
  loadWx(p.lat,p.lon).then(function(w){SF.wx=w;SF.err=0}).catch(function(){SF.err=1}).then(function(){paint();notifyNew()});
}
function locate(){
  if(!navigator.geolocation){SF.deny=2;paint();return}
  SF.busy=1;paint();
  navigator.geolocation.getCurrentPosition(function(p){setPos(p.coords.latitude,p.coords.longitude,false);watch()},function(e){SF.busy=0;SF.deny=e.code==1?1:2;paint()},{enableHighAccuracy:true,timeout:15000,maximumAge:60000});
}
function watch(){
  if(SF.wid!=null||!navigator.geolocation)return;
  SF.wid=navigator.geolocation.watchPosition(function(p){if(SF.man)return;if(!SF.pos||hav(SF.pos.lat,SF.pos.lon,p.coords.latitude,p.coords.longitude)>=2)setPos(p.coords.latitude,p.coords.longitude,false)},function(){},{maximumAge:120000,timeout:30000});
}
function notifyNew(){
  var hi=alerts().filter(function(a){return a.l>=2&&!SF.seen[a.t]});if(!hi.length)return;
  var first=!Object.keys(SF.seen).length;hi.forEach(function(a){SF.seen[a.t]=1});
  toast(hi.length+" peringatan di sekitar "+SF.K[1]+(first?"":" (baru)")+": "+hi[0].t,"Lihat",function(){show("loc")});
}

var DASHBAR=null;
function paintBar(){
  if(!DASHBAR)return;var p=SF.pos,w=SF.wx,A=alerts(),top=A.length?A[0].l:0;
  if(!p){DASHBAR.innerHTML='<span class="lb-ic">📍</span><div><b>Cuaca dan peringatan untuk lokasimu</b><small>Aktifkan izin lokasi agar prakiraan cuaca dan peringatan menyesuaikan tempatmu.</small></div><button class="btn green" id="lb-go">Aktifkan lokasi</button>';$("lb-go").onclick=function(){locate();show("loc")};return}
  var c=w&&w.current?wc(w.current.weather_code):null;
  DASHBAR.innerHTML='<span class="lb-ic">'+(c?c[1]:"📍")+'</span><div><b>'+esc(SF.K[1])+' · '+esc(pv(SF.K))+'</b><small>'+(c?esc(c[0])+' · '+Math.round(w.current.temperature_2m)+' °C · ':'')+(A.length?A.length+' peringatan di sekitarmu':'Tidak ada peringatan di sekitarmu')+'</small></div><span class="lvb l'+top+'">'+LVN[top]+'</span><button class="btn" id="lb-go">Buka</button>';
  $("lb-go").onclick=function(){show("loc")};
}
function paint(){paintBar();paintLoc();if(window.NAEVAC)NAEVAC.update()}

function buildLoc(){
  var P=RG.P.map(function(p){return'<option value="'+p[0]+'">'+esc(p[1])+'</option>'}).join("");
  $("v-loc").innerHTML='<div class="head"><div><h1>Cuaca dan Peringatan Lokasi</h1><p class="muted">Prakiraan cuaca dan peringatan menurut lokasimu. Koordinat hanya dipakai di browser ini untuk meminta data ke Open-Meteo dan OpenStreetMap; tidak disimpan oleh aplikasi.</p></div></div>'+
  '<div class="card lc-top" id="lc-top"></div><div class="lc-grid"><div class="card" id="lc-wx"></div><div class="card" id="lc-al"></div></div>'+
  '<div class="card lc-pick"><h4>Pilih wilayah secara manual</h4><p class="muted sm">Tanpa izin lokasi pun kamu bisa melihat cuaca dan peringatan untuk kabupaten/kota mana saja.</p><div class="lc-sel"><select id="lc-p"><option value="">Provinsi…</option>'+P+'</select><select id="lc-k" disabled><option value="">Kabupaten/Kota…</option></select><button class="btn green" id="lc-ok" disabled>Tampilkan</button></div></div>'+
  '<p class="muted sm" style="margin:12px 4px">Sumber: prakiraan cuaca Open-Meteo (model global, bukan prakiraan resmi BMKG); kejadian dari BMKG, PVMBG, dan BNPB pada dasbor ini. Ambang peringatan cuaca memakai kelas curah hujan BMKG dan ambang internal aplikasi. Untuk peringatan resmi, rujuk bmkg.go.id.</p>';
  $("lc-p").onchange=function(){var v=this.value,s=$("lc-k");s.innerHTML='<option value="">Kabupaten/Kota…</option>'+RG.K.filter(function(k){return k[0].indexOf(v+".")==0}).map(function(k){return'<option value="'+k[0]+'">'+esc(k[1])+'</option>'}).join("");s.disabled=!v;$("lc-ok").disabled=true};
  $("lc-k").onchange=function(){$("lc-ok").disabled=!this.value};
  $("lc-ok").onclick=function(){var k=KI[$("lc-k").value];if(k)setPos(k[2],k[3],true,k)};
  paintLoc();
}
function paintLoc(){
  if(!$("lc-top"))return;var p=SF.pos,w=SF.wx,t=$("lc-top");
  if(SF.busy)t.innerHTML='<div class="lc-st"><span class="spin"></span><b>Mencari lokasimu…</b></div>';
  else if(!p)t.innerHTML='<div class="lc-st"><span class="lb-ic">📍</span><div><b>Lokasi belum aktif</b><small>'+(SF.deny==1?"Izin lokasi ditolak. Aktifkan izin lokasi lewat ikon gembok di address bar, atau pilih wilayah manual di bawah.":SF.deny==2?"Lokasi tidak tersedia di perangkat ini. Pilih wilayah manual di bawah.":"Aktifkan lokasi untuk cuaca dan peringatan di tempatmu.")+'</small></div></div><button class="btn green" id="lc-loc">Aktifkan lokasi saya</button>';
  else t.innerHTML='<div class="lc-st"><span class="lb-ic">📍</span><div><b>'+esc(SF.K[1])+' · '+esc(pv(SF.K))+'</b><small>'+(SF.man?"Dipilih manual (titik pusat kab/kota)":"Dari GPS · "+Math.abs(p.lat).toFixed(3)+"° "+(p.lat<0?"LS":"LU")+", "+p.lon.toFixed(3)+"° BT"+(SF.place?" · "+esc(SF.place):" · wilayah terdekat menurut titik pusat"))+'</small></div></div><div class="lc-acts"><button class="btn" id="lc-loc">'+(SF.man?"Pakai lokasi GPS":"Perbarui lokasi")+'</button><button class="btn green" id="lc-ev">Cari jalur evakuasi</button></div>';
  if($("lc-loc"))$("lc-loc").onclick=locate;if($("lc-ev"))$("lc-ev").onclick=function(){show("evac")};
  var W=$("lc-wx");
  if(!p)W.innerHTML='<h4>Prakiraan cuaca</h4><p class="muted">Muncul setelah lokasi aktif atau wilayah dipilih.</p>';
  else if(!w)W.innerHTML='<h4>Prakiraan cuaca</h4><p class="muted">'+(SF.err?"Data cuaca belum bisa dimuat (periksa koneksi internet). Peringatan kejadian tetap ditampilkan.":"Memuat prakiraan…")+'</p>';
  else{
    var c=w.current,cc=wc(c.weather_code),H=w.hourly,i0=Math.max(0,H.time.findIndex(function(x){return x>=c.time.slice(0,13)})),D=w.daily;
    W.innerHTML='<h4>Cuaca saat ini</h4><div class="wx-now"><span class="wx-e">'+cc[1]+'</span><div><b>'+Math.round(c.temperature_2m)+' °C</b><small>'+cc[0]+' · terasa '+Math.round(c.apparent_temperature)+' °C</small></div></div>'+
    '<div class="wx-st"><span>💧 '+c.relative_humidity_2m+'%</span><span>🌬️ '+Math.round(c.wind_speed_10m)+' km/j (maks '+Math.round(c.wind_gusts_10m)+')</span><span>🌧️ '+c.precipitation+' mm</span></div>'+
    '<h5>12 jam ke depan</h5><div class="wx-h">'+H.time.slice(i0,i0+12).map(function(t,j){var k=i0+j;return'<div><small>'+t.slice(11,13)+'.00</small><span>'+wc(H.weather_code[k])[1]+'</span><b>'+Math.round(H.temperature_2m[k])+'°</b><em>'+(H.precipitation_probability[k]||0)+'%</em></div>'}).join("")+'</div>'+
    '<h5>3 hari</h5><div class="wx-d">'+D.time.map(function(t,j){return'<div><b>'+["Hari ini","Besok","Lusa"][j]+'</b><span>'+wc(D.weather_code[j])[1]+' '+wc(D.weather_code[j])[0]+'</span><small>'+Math.round(D.temperature_2m_min[j])+'–'+Math.round(D.temperature_2m_max[j])+' °C · hujan '+Math.round(D.precipitation_sum[j])+' mm ('+(D.precipitation_probability_max[j]||0)+'%)</small></div>'}).join("")+'</div>';
  }
  var A=alerts(),L=$("lc-al");
  L.innerHTML='<h4>Peringatan di sekitar lokasimu</h4>'+(!p?'<p class="muted">Aktifkan lokasi atau pilih wilayah untuk melihat peringatan.</p>':(A.length?A.map(function(a,i){return'<div class="al l'+a.l+'"><span class="lvb l'+a.l+'">'+LVN[a.l]+'</span><div><b>'+esc(a.t)+'</b><p>'+esc(a.d)+'</p><small>'+esc(a.s)+'</small>'+(a.id?' <button class="lnk" data-i="'+a.id+'">Lihat di peta →</button>':'')+'</div></div>'}).join(""):'<p class="muted">Tidak ada peringatan pada data yang tersedia di sekitar lokasimu. Ini bukan jaminan aman; ikuti informasi resmi BMKG, BNPB, dan BPBD setempat.</p>')+(MODE!="live"?'<p class="muted sm">Data kejadian saat ini berupa cuplikan 29 Okt 2026 (backend belum aktif), sehingga kejadian terbaru mungkin belum tercatat.</p>':""));
  Array.prototype.forEach.call(L.querySelectorAll(".lnk"),function(b){b.onclick=function(){show("dash");pick(+b.getAttribute("data-i"))}});
}

/* ---------- Jalur evakuasi: dipindahkan ke js/evac.js (peta provinsi + garis jalur evakuasi) ---------- */
function evEnter(){if(window.NAEVAC)NAEVAC.enter()}

/* ---------- Wilayah: provinsi, kabupaten/kota, kecamatan ---------- */
function searchRg(q){
  q=q.trim().toLowerCase();if(q.length<2)return[];var o=[];
  RG.K.forEach(function(k){if(k[1].toLowerCase().indexOf(q)>=0)o.push({k:k,l:k[1],s:pv(k)})});
  RG.K.forEach(function(k){(RG.C[k[0]]||[]).forEach(function(c){if(o.length<60&&c.toLowerCase().indexOf(q)>=0)o.push({k:k,l:"Kec. "+c,s:k[1]+", "+pv(k)})})});
  return o.slice(0,60);
}
function rgGo(kd){
  var k=KI[kd];if(!k)return;var i=$("cari");if(i&&i.value){i.value="";qs="";refresh()}
  show("dash");setTimeout(function(){setView(16,[k[3],k[2]])},150);
}
function buildReg(){
  var tot=RG.K.length,kc=0;for(var c in RG.C)kc+=RG.C[c].length;
  $("v-reg").innerHTML='<div class="head"><div><h1>Wilayah Indonesia</h1><p class="muted">'+RG.P.length+' provinsi, '+tot+' kabupaten/kota, dan '+kc.toLocaleString("id-ID")+' kecamatan. Pilih wilayah untuk melihat di peta atau cek cuaca dan peringatannya.</p></div></div>'+
  '<div class="card"><input id="rg-q" class="rg-q" placeholder="Cari provinsi, kota, kabupaten, atau kecamatan…" autocomplete="off"><div id="rg-res"></div></div><div class="card" id="rg-d" hidden></div><div id="rg-l">'+
  RG.P.map(function(p){return'<details class="rgp" data-p="'+p[0]+'"><summary><b>'+esc(p[1])+'</b><i>'+RG.K.filter(function(k){return k[0].indexOf(p[0]+".")==0}).length+' kab/kota</i></summary><div class="rgk"></div></details>'}).join("")+'</div>';
  var chip=function(k){return'<button class="rgb" data-k="'+k[0]+'">'+esc(k[1])+'</button>'};
  Array.prototype.forEach.call($("rg-l").querySelectorAll("details"),function(d){d.ontoggle=function(){var b=d.querySelector(".rgk");if(!d.open||b.children.length)return;var p=d.getAttribute("data-p");b.innerHTML=RG.K.filter(function(k){return k[0].indexOf(p+".")==0}).sort(function(a,b){return(/^Kota/.test(b[1])-/^Kota/.test(a[1]))||a[1].localeCompare(b[1])}).map(chip).join("")}});
  $("rg-l").onclick=function(e){var b=e.target.closest(".rgb");if(b)rgDet(b.getAttribute("data-k"))};
  $("rg-q").oninput=function(){var r=searchRg(this.value);$("rg-res").innerHTML=r.length?'<div class="rgk">'+r.map(function(x){return'<button class="rgb" data-k="'+x.k[0]+'"><b>'+esc(x.l)+'</b> <small>'+esc(x.s)+'</small></button>'}).join("")+'</div>':(this.value.trim().length>1?'<p class="muted sm">Tidak ditemukan.</p>':"")};
  $("rg-res").onclick=$("rg-l").onclick;
}
function rgDet(kd){
  var k=KI[kd],c=RG.C[kd]||[],d=$("rg-d");d.hidden=false;
  d.innerHTML='<h3>'+esc(k[1])+'</h3><p class="muted">'+esc(pv(k))+(k[6]?' · ibu kota '+esc(k[6]):'')+' · penduduk '+(k[5]?k[5].toLocaleString("id-ID"):"-")+' · zona '+(k[4]==7?"WIB":k[4]==8?"WITA":"WIT")+' · '+c.length+' kecamatan</p><div class="lc-acts"><button class="btn green" id="rg-map">Lihat di peta</button><button class="btn" id="rg-wx">Cuaca dan peringatan di sini</button></div><h5>Kecamatan</h5><div class="rgk">'+c.map(function(x){return'<span class="rgc">'+esc(x)+'</span>'}).join("")+'</div><p class="muted sm">Koordinat kecamatan tidak tersedia di sumber data, jadi cuaca memakai titik pusat kabupaten/kota.</p>';
  $("rg-map").onclick=function(){rgGo(kd)};$("rg-wx").onclick=function(){setPos(k[2],k[3],true,k);show("loc")};d.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function regLabels(){
  if(typeof IG==="undefined"||!IG.lab)return;
  RG.K.forEach(function(k){
    var kota=/^Kota /.test(k[1]),n=k[1].replace(/^(Kota|Kabupaten|Kab\.) /,"");
    if(ICITY.some(function(c){return Math.abs(c[1]-k[3])<.2&&Math.abs(c[2]-k[2])<.2}))return;
    var g=se("g",{"class":"lb ct kk","data-x":imx(k[3]),"data-y":imy(k[2]),"data-z":kota?11:16},IG.lab);
    se("circle",{r:1.9},g);var t=se("text",{x:5,y:3,"text-anchor":"start"},g);t.textContent=n;
  });
  ivKids();
}

/* ---------- Pemasangan ---------- */
var _ii=initIndo;initIndo=function(){_ii();regLabels()};
VIEWS.push("loc","evac","reg");
var _sh=show;show=function(v){_sh(v);if(v=="evac")evEnter();if(v=="reg"&&!$("rg-l"))buildReg()};
buildLoc();
var g=document.querySelector(".main-dashboard-grid");
if(g){DASHBAR=document.createElement("div");DASHBAR.className="locbar card";g.parentNode.insertBefore(DASHBAR,g);paintBar()}
var inp=$("cari");
if(inp){
  var dd=document.createElement("div");dd.className="rgsug";dd.hidden=true;inp.parentNode.appendChild(dd);
  inp.addEventListener("input",function(){var r=searchRg(this.value).slice(0,8);dd.hidden=!r.length;dd.innerHTML=r.map(function(x){return'<button data-k="'+x.k[0]+'"><b>'+esc(x.l)+'</b><small>'+esc(x.s)+'</small></button>'}).join("")});
  dd.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;e.preventDefault();dd.hidden=true;rgGo(b.getAttribute("data-k"))});
  document.addEventListener("click",function(e){if(!dd.contains(e.target)&&e.target!==inp)dd.hidden=true});
}
setInterval(function(){paint()},60000);setInterval(refreshWx,900000);
if(navigator.permissions&&navigator.permissions.query)navigator.permissions.query({name:"geolocation"}).then(function(s){if(s.state=="granted")locate()}).catch(function(){});
window.NA={SF:SF,alerts:alerts,locate:locate,loadWx:loadWx,wc:wc,hav:hav,pv:pv,fD:fD,setPos:setPos,searchRg:searchRg,KI:KI,rgGo:rgGo};
})();
