/* Nusantara-Alert · Peta Jalur Evakuasi (peta provinsi berwarna + garis jalur evakuasi per wilayah).
   Data:
   - Batas provinsi: data/provinces-geo.js (CC BY 4.0, 38 provinsi).
   - Status peringatan: dari kejadian di dasbor (BMKG, PVMBG, BNPB), dihitung ulang tiap data diperbarui.
   - Titik kumpul, rumah sakit, pemadam, dan ruas jalan bertanda "evacuation_route": OpenStreetMap via Overpass (ODbL), diambil per provinsi saat dipilih.
   - Garis rute jalan dari pusat kabupaten/kota ke titik evakuasi terdekat: OSRM (FOSSGIS) pada jaringan jalan OSM.
   Bukan jalur resmi pemerintah; jalur dan titik kumpul resmi ditetapkan BPBD/pemda (lihat InaRISK BNPB). */
(function(){
var N=window.NA;if(!N||!window.PROV_GEO)return;
var P=PROV_GEO,SF=N.SF,hav=N.hav,fD=N.fD;
var LCOL=["#9bd4a8","#f2d04a","#f08a3c","#e04b3f"],LN=["Tidak ada peringatan","Perhatian","Siaga","Awas"];
var S={built:0,map:null,rd:null,evrd:null,lyr:[],sel:null,mode:"wilayah",tiles:null,tl:null,lbl:null,evg:null,mk:null,al:[],stale:[],data:{},sig:"",wantUser:0,user:null,userLn:null,bulk:0,ov:0,bn:null,hz:null,bnErr:0};
var OVP=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter","https://overpass.private.coffee/api/interpreter"];
var TIPS=[["Gempa bumi / tsunami",/Gempa/,"Lindungi kepala, jauhi kaca dan bangunan retak. Di pesisir, bila guncangan kuat atau lama, segera ke tempat tinggi tanpa menunggu sirene. Pantau BMKG (InaTEWS)."],["Gunung api",/Gunung/,"Jauhi radius rekomendasi PVMBG, hindari alur sungai dari lereng (lahar), pakai masker saat hujan abu."],["Banjir / longsor / hujan",/Cuaca|Hujan|Banjir|Longsor/,"Pindah ke tempat lebih tinggi sebelum air naik, matikan listrik, jauhi lereng curam dan bantaran sungai."],["Karhutla",/Karhutla/,"Hindari area berasap, pakai masker, ikuti arahan BPBD. Jangan membakar lahan."]];

/* ---------- InaRISK BNPB: layanan peta ArcGIS publik (gis.bnpb.go.id) ---------- */
var GIS="https://gis.bnpb.go.id/server/rest/services/";
var BN_EVAK=[["inarisk/Arah_jalur_evakuasi","Arah jalur evakuasi"],["inarisk/Jalur_evakuasi","Jalur evakuasi"],["inarisk/RENEVAK_tsunami","Rencana evakuasi tsunami"],["inarisk/Peta_Rencana_Evakuasi_Cilacap1","Rencana evakuasi Cilacap"],["thematic/JALUR_EVAKUASI_KOTA_AMBON","Jalur evakuasi Kota Ambon"],["thematic/JALUR_EVAKUASI_WILBAR","Tempat/jalur evakuasi (WILBAR)"]];
var BN_HAZ=[["","Tanpa lapisan bahaya"],["layer_bahaya_tsunami","Bahaya tsunami"],["layer_bahaya_gempabumi","Bahaya gempa bumi"],["layer_bahaya_banjir","Bahaya banjir"],["layer_bahaya_tanah_longsor","Bahaya tanah longsor"],["layer_bahaya_letusan_gunungapi","Bahaya letusan gunung api"],["layer_bahaya_kebakaran_hutan_dan_lahan","Bahaya karhutla"]];
var R3857=20037508.342789244;
var ArcTile=L_ready(function(){return L.TileLayer.extend({
  getTileUrl:function(c){
    var z=this._getZoomForUrl(),res=2*R3857/Math.pow(2,z),x0=-R3857+c.x*res,y1=R3857-c.y*res,bb=[x0,y1-res,x0+res,y1].join(",");
    return this.options.img?this.options.base+"/exportImage?bbox="+bb+"&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image"
      :this.options.base+"/export?bbox="+bb+"&bboxSR=3857&imageSR=3857&size=256,256&format=png32&transparent=true&f=image";
  }})});
function L_ready(f){var c;return function(){return c||(c=f())}}

/* ---------- Geometri ---------- */
P.forEach(function(g){var b=[1e9,1e9,-1e9,-1e9];g.p.forEach(function(po){po[0].forEach(function(c){if(c[0]<b[0])b[0]=c[0];if(c[1]<b[1])b[1]=c[1];if(c[0]>b[2])b[2]=c[0];if(c[1]>b[3])b[3]=c[1]})});g.b=b;g.nm=norm(g.n)});
function norm(s){return String(s||"").toLowerCase().replace(/\./g," ").replace(/\s+/g," ").trim().replace(/^(daerah istimewa|daerah khusus ibukota|dki|di|provinsi|prov)\s/,"").replace(/^kep\s/,"kepulauan ")}
function short(n){return n.replace("Daerah Istimewa ","DI ").replace("Kepulauan Bangka Belitung","Bangka Belitung").replace("Nusa Tenggara","NT").replace("Kalimantan","Kalim.").replace("Sulawesi","Sulaw.").replace("Sumatera","Sumat.")}
function inRing(r,x,y){var c=false;for(var i=0,j=r.length-1;i<r.length;j=i++){var a=r[i],b=r[j];if((a[1]>y)!=(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function provAt(x,y){
  for(var i=0;i<P.length;i++){var g=P[i];if(x<g.b[0]||x>g.b[2]||y<g.b[1]||y>g.b[3])continue;
    for(var k=0;k<g.p.length;k++){var po=g.p[k];if(!inRing(po[0],x,y))continue;var h=false;for(var q=1;q<po.length;q++)if(inRing(po[q],x,y)){h=true;break}if(!h)return i}}
  return -1;
}
function provNear(x,y,maxDeg){
  var best=-1,bd=maxDeg*maxDeg,c=Math.cos(y*Math.PI/180);
  P.forEach(function(g,i){if(x<g.b[0]-maxDeg||x>g.b[2]+maxDeg||y<g.b[1]-maxDeg||y>g.b[3]+maxDeg)return;
    g.p.forEach(function(po){po[0].forEach(function(p){var dx=(p[0]-x)*c,dy=p[1]-y,d=dx*dx+dy*dy;if(d<bd){bd=d;best=i}})})});
  return best;
}
function provByName(t){
  t=" "+norm(t.replace(/\bkep\.?\s/gi,"kepulauan "))+" ";var best=-1,bl=0;
  P.forEach(function(g,i){var ns=[g.nm];if(g.nm==="kepulauan bangka belitung")ns.push("bangka belitung");ns.forEach(function(n){if(t.indexOf(" "+n+" ")>=0&&n.length>bl){bl=n.length;best=i}})});
  return best;
}

/* ---------- Status peringatan dari data dasbor ---------- */
function fresh(e){return !!(META&&META.generated_at&&(!META.partial||e.k==="Gempa bumi"))}
function lvOf(e){
  var lv=e.lv||"",L=/Awas/.test(lv)?3:/Siaga|Level III/.test(lv)?2:/Waspada/.test(lv)?1:0,k=e.k;
  if(k==="Gempa bumi"){var age=e.d?(Date.now()-new Date(e.d).getTime())/864e5:0;if(age>7||e.m<4.5)return 0;return e.m>=6?3:e.m>=5?2:1}
  if(k==="Gunung api")return L;
  if(k==="Cuaca ekstrem")return Math.max(L,1);
  if(k==="Kekeringan"||k==="Hujan tinggi")return Math.max(L,1);
  if(/karhutla|banjir|longsor/i.test(k+" "+(e.det||"")))return 1;
  return 0;
}
function provOfEvent(e){
  var wk=e.k==="Cuaca ekstrem"||e.k==="Kekeringan"||e.k==="Hujan tinggi",i=-1;
  if(wk)i=provByName(e.w||"");
  if(i<0&&e.x!=null&&e.y!=null){i=provAt(e.x,e.y);if(i<0)i=provNear(e.x,e.y,2.5)}
  if(i<0)i=provByName(e.w||"");
  return i;
}
function compute(){
  S.al=P.map(function(){return{lv:0,ev:[]}});S.stale=[];
  EV.forEach(function(e){
    var L=lvOf(e);if(L<=0)return;var i=provOfEvent(e);if(i<0)return;
    if(!fresh(e)){S.stale.push({i:i,e:e,L:L});return}
    S.al[i].ev.push({e:e,L:L});if(L>S.al[i].lv)S.al[i].lv=L;
  });
  S.al.forEach(function(a){a.ev.sort(function(x,y){return y.L-x.L})});
}
function sigOf(){return S.al.map(function(a,i){return a.lv+":"+a.ev.length}).join(",")+"|"+S.stale.length+"|"+MODE+"|"+(META&&META.generated_at||"")}

/* ---------- Pemuatan Leaflet ---------- */
function loadLeaf(){return window.L?Promise.resolve():new Promise(function(ok,no){loadCSS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css");loadJS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",ok);setTimeout(function(){window.L?ok():no()},12000)})}

/* ---------- Kerangka halaman ---------- */
function build(){
  S.built=1;
  $("v-evac").innerHTML='<div class="head"><div><h1>Peta Jalur Evakuasi</h1><p class="muted">Peta 38 provinsi dengan status peringatan bencana terbaru. Pilih provinsi untuk melihat titik kumpul, fasilitas darurat, dan garis rute jalan evakuasi di wilayah itu.</p></div></div>'+
  '<div class="card ex-banner" id="ex-banner"></div>'+
  '<div class="ex-grid"><div class="card ex-card" id="ex-card">'+
    '<div class="ex-bar"><div class="seg" id="ex-mode"><button data-m="wilayah" class="on">Warna wilayah</button><button data-m="alert">Tingkat peringatan</button></div>'+
    '<label class="ex-chk"><input type="checkbox" id="ex-ev" checked> Kejadian</label><label class="ex-chk"><input type="checkbox" id="ex-tl"> Peta jalan</label><label class="ex-chk" title="Layanan peta resmi BNPB (InaRISK)"><input type="checkbox" id="ex-bn" checked> Jalur resmi BNPB</label><select id="ex-hz" aria-label="Lapisan bahaya InaRISK">'+BN_HAZ.map(function(h){return'<option value="'+h[0]+'">'+h[1]+'</option>'}).join("")+'</select>'+
    '<button class="btn" id="ex-me">📍 Lokasiku</button><button class="btn" id="ex-all">Muat jalur provinsi berperingatan</button><button class="btn" id="ex-reset">Seluruh Indonesia</button><button class="btn" id="ex-fs" aria-label="Layar penuh">⤢</button></div>'+
    '<div class="ex-mapwrap"><div id="ex-map" class="ex-map"></div></div>'+
    '<div class="ex-leg" id="ex-leg"></div><p class="muted sm ex-bnn" id="ex-bnn"></p></div>'+
  '<aside class="card ex-side" id="ex-side"></aside></div>'+
  '<div class="card ex-src"><h4>Sumber dan batasan</h4><p class="muted sm">Batas provinsi: <a href="https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces" target="_blank" rel="noopener">Indonesia GeoJSON &amp; TopoJSON Maps (38 Provinces)</a>, CC BY 4.0 (disederhanakan). Status peringatan dihitung dari kejadian di dasbor (BMKG, PVMBG/MAGMA, BNPB); gempa diambil langsung dari BMKG tiap 5 menit. Jalur evakuasi resmi dan lapisan bahaya: layanan peta publik <a href="https://inarisk.bnpb.go.id" target="_blank" rel="noopener">InaRISK BNPB</a> (gis.bnpb.go.id), hanya tersedia untuk daerah yang telah dipetakan BNPB. Titik kumpul, fasilitas, dan ruas jalan bertanda jalur evakuasi: © kontributor <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> (ODbL) lewat Overpass. Garis rute: perhitungan OSRM/FOSSGIS pada jaringan jalan OSM dari pusat kabupaten/kota ke titik evakuasi terdekat. <b>Ini bukan jalur evakuasi resmi pemerintah</b> dan kelengkapannya bergantung pada pemetaan OSM di tiap daerah; jalur dan titik kumpul resmi ditetapkan BPBD/pemda. Rujuk <a href="https://inarisk.bnpb.go.id" target="_blank" rel="noopener">InaRISK BNPB</a>, <a href="https://inatews.bmkg.go.id" target="_blank" rel="noopener">InaTEWS BMKG</a>, <a href="https://magma.esdm.go.id" target="_blank" rel="noopener">MAGMA PVMBG</a>; saat darurat hubungi 112 atau 117.</p></div>';
  Array.prototype.forEach.call($("ex-mode").children,function(b){b.onclick=function(){S.mode=b.getAttribute("data-m");Array.prototype.forEach.call(b.parentNode.children,function(x){x.classList.toggle("on",x===b)});restyle();legend()}});
  $("ex-tl").onchange=toggleTiles;$("ex-bn").onchange=bnapply;$("ex-hz").onchange=bnapply;$("ex-ev").onchange=function(){if(!S.map||!S.evg)return;this.checked?S.map.addLayer(S.evg):S.map.removeLayer(S.evg)};
  $("ex-me").onclick=goMe;$("ex-all").onclick=loadAlerted;$("ex-reset").onclick=function(){select(null,true)};
  $("ex-fs").onclick=function(){var c=$("ex-card"),on=!c.classList.contains("exfs");c.classList.toggle("exfs",on);document.body.classList.toggle("nofs-scroll",on);this.textContent=on?"✕":"⤢";if(S.map)setTimeout(function(){S.map.invalidateSize()},200)};
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&$("ex-card")&&$("ex-card").classList.contains("exfs"))$("ex-fs").click()});
  banner();side();legend();
}

/* ---------- Peta ---------- */
function initMap(){
  if(S.map){setTimeout(function(){S.map.invalidateSize()},200);return}
  var m=S.map=L.map("ex-map",{zoomControl:false,minZoom:4,maxZoom:18,zoomSnap:.25,attributionControl:true,maxBounds:[[-16,90],[10,146]]});
  m.attributionControl.setPrefix(false);
  m.attributionControl.addAttribution('Batas provinsi: denyherianto (CC BY 4.0) · Titik/rute: © OpenStreetMap, OSRM');
  L.control.zoom({position:"topleft",zoomInTitle:"Perbesar",zoomOutTitle:"Perkecil"}).addTo(m);
  m.createPane("prov").style.zIndex=350;var bp=m.createPane("bnpb");bp.style.zIndex=360;bp.style.pointerEvents="none";m.createPane("evp").style.zIndex=450;
  S.rd=L.svg({pane:"prov"});S.evrd=L.canvas({pane:"evp",padding:.4});
  m.fitBounds([[-11.4,94.5],[6.4,141.5]]);
  S.lyr=P.map(function(g,i){
    var ll=g.p.map(function(po){return po.map(function(r){return r.map(function(c){return[c[1],c[0]]})})});
    var pl=L.polygon(ll,{pane:"prov",renderer:S.rd,smoothFactor:1.2,bubblingMouseEvents:false}).addTo(m);
    pl.on("click",function(e){L.DomEvent.stopPropagation(e);select(i,true)});
    pl.on("mouseover",function(){if(S.sel!==i)pl.setStyle({weight:2.2,color:"#0f172a"})});pl.on("mouseout",function(){pl.setStyle(sty(i))});
    return pl;
  });
  m.on("click",function(){if(S.sel!=null)select(null,true)});
  S.lbl=L.layerGroup().addTo(m);S.evg=L.layerGroup().addTo(m);S.mk=L.layerGroup().addTo(m);
  m.on("zoomend",function(){labels();mkVis()});
  restyle();labels();incidents();bnapply();
  setTimeout(function(){m.invalidateSize()},250);
}
function sty(i){
  var al=S.al[i]?S.al[i].lv:0,sel=S.sel===i,fill=S.mode==="alert"?LCOL[al]:P[i].c,bc=sel?"#0f172a":al>=2&&S.mode!=="alert"?LCOL[al]:"#3a3a3a";
  return{color:bc,weight:sel?3:al>=2&&S.mode!=="alert"?2.6:.8,opacity:sel?1:.85,fillColor:fill,fillOpacity:S.tiles||S.ov?.5:(S.sel!=null&&!sel?.6:.93)};
}
function restyle(){S.lyr.forEach(function(l,i){l.setStyle(sty(i));l.unbindTooltip();var a=S.al[i]||{lv:0,ev:[]};l.bindTooltip("<b>"+esc(P[i].n)+"</b><br>"+LN[a.lv]+(a.ev.length?" · "+a.ev.length+" kejadian":""),{sticky:true,className:"ex-tip"});if(S.sel===i)l.bringToFront()})}
function labels(){
  if(!S.lbl||!S.map)return;S.lbl.clearLayers();var z=S.map.getZoom(),thr=z<=4.75?1.5:z<=5.5?.5:z<=6.5?.15:0;
  P.forEach(function(g,i){if(g.a<thr&&S.sel!==i)return;var a=S.al[i]?S.al[i].lv:0;
    L.marker(g.lc,{interactive:false,icon:L.divIcon({className:"ex-lbl"+(S.sel===i?" sel":""),html:'<span>'+(a>0?'<i style="background:'+LCOL[a]+'"></i>':"")+esc(short(g.n))+'</span>',iconSize:[0,0]})}).addTo(S.lbl)});
}
function incidents(){
  if(!S.evg)return;S.evg.clearLayers();
  EV.filter(function(e){return e.x!=null&&e.y!=null&&(e.k==="Gunung api"||e.k==="Karhutla"||(e.k==="Gempa bumi"&&e.m>=4.5)||/banjir|longsor/i.test(e.k))}).forEach(function(e){
    var z=e.k==="Gempa bumi"?14+e.m*2:22,st=fresh(e)?"":'<br><small>⚠ Data cuplikan, bukan real-time</small>';
    L.marker([e.y,e.x],{icon:L.divIcon({className:"lmk",html:shapeSVG(e,z),iconSize:[z,z],iconAnchor:[z/2,z/2]}),zIndexOffset:-500}).bindPopup("<b>"+esc(e.k)+"</b> · "+esc(e.lb)+"<br>"+esc(e.w)+"<br><small>"+esc(e.tt||"")+" · "+esc(e.src)+"</small>"+st+'<br><button class="btn" onclick="openDetail('+e.id+')">Detail</button>').addTo(S.evg);
  });
}
function bnapply(){
  if(!S.map)return;var ATL=ArcTile();
  if(S.bn){S.map.removeLayer(S.bn);S.bn=null}if(S.hz){S.map.removeLayer(S.hz);S.hz=null}
  S.bnErr=0;var on=$("ex-bn").checked,hz=$("ex-hz").value;
  if(on){S.bn=L.layerGroup(BN_EVAK.map(function(x){return new ATL("",{base:GIS+x[0]+"/MapServer",pane:"bnpb",minZoom:8,maxZoom:19,opacity:.95,attribution:"© BNPB InaRISK"})})).addTo(S.map)}
  if(hz){S.hz=new ATL("",{base:GIS+"inarisk/"+hz+"/ImageServer",img:1,pane:"bnpb",minZoom:5,maxZoom:19,opacity:.6,attribution:"© BNPB InaRISK"});
    S.hz.on("tileerror",function(){S.bnErr++;if(S.bnErr===4)bnNote("Lapisan bahaya InaRISK tidak dapat dimuat saat ini. Buka langsung di inarisk.bnpb.go.id.")});S.hz.addTo(S.map)}
  S.ov=!!(on||hz);restyle();bnNote("");
}
function bnNote(t){var el=$("ex-bnn");if(el)el.textContent=t}
function toggleTiles(){
  if(!S.map)return;S.tiles=$("ex-tl").checked;
  if(S.tl){S.map.removeLayer(S.tl);S.tl=null}
  if(S.tiles){var T=TILES.carto;S.tl=L.tileLayer(T[THEME==="light"?"light":"dark"],{subdomains:T.sub,maxZoom:19}).addTo(S.map);S.tl.setZIndex(1)}
  restyle();
}
function mkVis(){var on=S.map.getZoom()>=8;Object.keys(S.data).forEach(function(k){var d=S.data[k];if(d&&d.mk){on?S.map.addLayer(d.mk):S.map.removeLayer(d.mk)}})}

/* ---------- Pilih provinsi ---------- */
function select(i,fit){
  S.sel=i;restyle();labels();
  if(S.map&&fit){if(i==null)S.map.fitBounds([[-11.4,94.5],[6.4,141.5]]);else S.map.fitBounds(S.lyr[i].getBounds(),{padding:[24,24],maxZoom:9})}
  side();if(i!=null)loadProv(i);
}

/* ---------- Data OSM per provinsi ---------- */
function ovp(q){
  var go=function(u){return fetch(u,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"data="+encodeURIComponent(q)}).then(function(r){if(!r.ok)throw 0;return r.json()})};
  return go(OVP[0]).catch(function(){return go(OVP[1])}).catch(function(){return go(OVP[2])});
}
var GN=["Titik kumpul evakuasi","Posko / pengungsian","Rumah sakit","Pemadam kebakaran"],GC=["#16a34a","#0ea5e9","#dc2626","#f97316"];
function loadProv(i,force){
  var d=S.data[i];if(d&&d.busy)return Promise.resolve();
  if(d&&d.done&&!force&&Date.now()-d.t<18e5){side();return Promise.resolve()}
  if(d)clearData(i);
  d=S.data[i]={busy:1,t:Date.now(),pts:[],ways:[],routes:0,rtErr:0,msg:"Mengambil titik dan jalur evakuasi dari OpenStreetMap…",err:0,ln:L.layerGroup().addTo(S.map),mk:L.layerGroup()};
  var b=P[i].b,bb="("+b[1]+","+b[0]+","+b[3]+","+b[2]+")";
  side();
  var q0='[out:json][timeout:60];(nwr["emergency"="assembly_point"]'+bb+';nwr["emergency"="evacuation_centre"]'+bb+';);out center 1500;';
  var q1='[out:json][timeout:60];(way["evacuation_route"]'+bb+';way["emergency"="evacuation_route"]'+bb+';way["tsunami:evacuation_route"]'+bb+';);out geom 500;';
  var q2='[out:json][timeout:60];(nwr["amenity"="hospital"]'+bb+';nwr["amenity"="fire_station"]'+bb+';);out center 600;';
  var seen={};
  function pts(j,gf){(j.elements||[]).forEach(function(e){var t=e.tags||{},la=e.lat!=null?e.lat:e.center&&e.center.lat,lo=e.lon!=null?e.lon:e.center&&e.center.lon;if(la==null||seen[e.type+e.id]||provAt(lo,la)!==i)return;seen[e.type+e.id]=1;
    d.pts.push({id:e.type+"/"+e.id,n:t.name||"",g:gf(t),lat:la,lon:lo})})}
  return ovp(q0).then(function(j){pts(j,function(t){return t.emergency==="evacuation_centre"?1:0})}).catch(function(){d.err++})
  .then(function(){return ovp(q1)}).then(function(j){(j.elements||[]).forEach(function(e){if(e.type!=="way"||!e.geometry||e.geometry.length<2)return;var m=e.geometry[Math.floor(e.geometry.length/2)];if(provAt(m.lon,m.lat)!==i)return;d.ways.push({id:e.id,n:(e.tags||{}).name||"",ll:e.geometry.map(function(p){return[p.lat,p.lon]})})})}).catch(function(){d.err++})
  .then(function(){return ovp(q2)}).then(function(j){pts(j,function(t){return t.amenity==="hospital"?2:3})}).catch(function(){d.err++})
  .then(function(){drawData(i);return planRoutes(i)}).then(function(){d.busy=0;d.done=1;d.msg=summary(i);userRoute(i);side()}).catch(function(){d.busy=0;d.done=1;d.msg=summary(i);side()});
}
function clearData(i){var d=S.data[i];if(!d)return;if(d.ln)S.map.removeLayer(d.ln);if(d.mk)S.map.removeLayer(d.mk);delete S.data[i]}
function drawData(i){
  var d=S.data[i];
  d.ways.forEach(function(w){L.polyline(w.ll,{pane:"evp",renderer:S.evrd,color:"#15803d",weight:4,opacity:.95}).bindTooltip("Ruas jalan bertanda jalur evakuasi (OSM)"+(w.n?" · "+esc(w.n):""),{sticky:true}).bindPopup("<b>Jalur evakuasi (OSM)</b>"+(w.n?"<br>"+esc(w.n):"")+"<br><small>Sumber: OpenStreetMap (way/"+w.id+")</small>").addTo(d.ln)});
  d.pts.forEach(function(x){L.circleMarker([x.lat,x.lon],{pane:"evp",renderer:S.evrd,radius:x.g===0?6:4.5,color:"#fff",weight:1.2,fillColor:GC[x.g],fillOpacity:.95}).bindPopup("<b>"+esc(x.n||GN[x.g])+"</b><br>"+GN[x.g]+"<br><small>Sumber: OpenStreetMap ("+x.id+')</small><br><a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+x.lat+","+x.lon+'">Rute di Google Maps</a>').addTo(d.mk)});
  if(S.map.getZoom()>=8)S.map.addLayer(d.mk);
}
function nearest(list,la,lo){var b=null,bd=1e9;list.forEach(function(x){var k=hav(la,lo,x.lat,x.lon);if(k<bd){bd=k;b=x}});return b?{x:b,km:bd}:null}
function safePts(d){var a=d.pts.filter(function(x){return x.g<=1});if(a.length)return{l:a,t:"titik kumpul"};a=d.pts.filter(function(x){return x.g===2});if(a.length)return{l:a,t:"rumah sakit"};a=d.pts.filter(function(x){return x.g===3});return a.length?{l:a,t:"pemadam kebakaran"}:null}
function route(prof,a,b){
  return fetch("https://routing.openstreetmap.de/routed-"+prof+"/route/v1/"+(prof==="car"?"driving":"foot")+"/"+a[1]+","+a[0]+";"+b[1]+","+b[0]+"?overview=simplified&geometries=geojson").then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){if(!j.routes||!j.routes[0])throw 0;return j.routes[0]});
}
function planRoutes(i){
  var d=S.data[i],sp=safePts(d);if(!sp){d.target="";return Promise.resolve()}d.target=sp.t;
  var code=(RG.P.filter(function(p){return norm(p[1])===P[i].nm})[0]||[])[0];if(!code)return Promise.resolve();
  var ks=RG.K.filter(function(k){return k[0].split(".")[0]===code}).sort(function(a,b){return b[5]-a[5]}).slice(0,10),jobs=[];
  ks.forEach(function(k){var n=nearest(sp.l,k[2],k[3]);if(n&&n.km<=45)jobs.push({k:k,n:n})});
  var al=S.al[i]?S.al[i].lv:0,col=al>=2?LCOL[al]:"#2563eb",idx=0;
  function worker(){
    if(idx>=jobs.length||!S.data[i]||S.data[i]!==d)return Promise.resolve();
    var j=jobs[idx++];
    return route("car",[j.k[2],j.k[3]],[j.n.x.lat,j.n.x.lon]).then(function(r){
      L.geoJSON(r.geometry,{pane:"evp",renderer:S.evrd,style:{color:col,weight:3.5,opacity:.9,dashArray:"8 6"}}).bindTooltip(esc(j.k[1])+" → "+esc(j.n.x.n||GN[j.n.x.g])+" · "+fD(r.distance/1000)+" · ±"+Math.max(1,Math.round(r.duration/60))+" mnt (mobil)").addTo(d.ln);d.routes++;
    }).catch(function(){d.rtErr++}).then(worker);
  }
  d.msg="Menghitung garis rute dari pusat kabupaten/kota ke "+sp.t+" terdekat…";side();
  return Promise.all([worker(),worker()]);
}
function summary(i){
  var d=S.data[i],c=[0,0,0,0];d.pts.forEach(function(x){c[x.g]++});
  if(d.err>=3)return "Layanan data peta (Overpass) tidak merespons. Coba lagi beberapa saat.";
  var t=[];if(d.ways.length)t.push(d.ways.length+" ruas jalan bertanda jalur evakuasi");if(c[0]+c[1])t.push((c[0]+c[1])+" titik kumpul/pusat evakuasi");if(c[2])t.push(c[2]+" rumah sakit");if(c[3])t.push(c[3]+" pos pemadam");
  var s=t.length?"Ditemukan di OpenStreetMap: "+t.join(", ")+".":"Belum ada titik evakuasi atau fasilitas darurat terpetakan di OpenStreetMap untuk provinsi ini.";
  if(d.routes)s+=" "+d.routes+" garis rute (putus-putus) ke "+d.target+" terdekat dari pusat kabupaten/kota.";
  if(!d.ways.length&&!(c[0]+c[1]))s+=" Jalur resmi: hubungi BPBD setempat atau buka InaRISK.";
  return s;
}
function loadAlerted(){
  var idx=[];S.al.forEach(function(a,i){if(a.lv>=1)idx.push(i)});idx.sort(function(a,b){return S.al[b].lv-S.al[a].lv});idx=idx.slice(0,8);
  var b=$("ex-all");if(!idx.length){b.textContent="Tidak ada provinsi berperingatan";setTimeout(function(){b.textContent="Muat jalur provinsi berperingatan"},2500);return}
  b.disabled=true;b.textContent="Memuat "+idx.length+" provinsi…";
  var p=Promise.resolve();idx.forEach(function(i){p=p.then(function(){return loadProv(i)})});
  p.then(function(){b.disabled=false;b.textContent="Muat jalur provinsi berperingatan"});
  select(idx[0],true);
}

/* ---------- Lokasi pengguna ---------- */
function goMe(){
  if(SF.pos){placeUser(true)}else{S.wantUser=1;N.locate();var b=$("ex-me");b.textContent="📍 Mencari lokasi…";setTimeout(function(){b.textContent="📍 Lokasiku"},4000)}
}
function placeUser(zoom){
  if(!S.map||!SF.pos)return;S.wantUser=0;var p=SF.pos;
  if(S.user)S.map.removeLayer(S.user);
  S.user=L.circleMarker([p.lat,p.lon],{radius:8,color:"#fff",weight:2,fillColor:"#0ea5e9",fillOpacity:1,pane:"evp",renderer:S.evrd}).bindTooltip("Lokasimu").addTo(S.map);
  var i=provAt(p.lon,p.lat);if(i<0)i=provNear(p.lon,p.lat,1);
  if(i>=0){S.sel=i;restyle();labels();if(zoom)S.map.setView([p.lat,p.lon],11);side();loadProv(i).then(function(){userRoute(i)})}
}
function userRoute(i){
  var d=S.data[i];if(!SF.pos||!d||!d.done||provAt(SF.pos.lon,SF.pos.lat)!==i)return;
  var sp=safePts(d);if(!sp)return;var n=nearest(sp.l,SF.pos.lat,SF.pos.lon);if(!n||n.km>20)return;
  route("foot",[SF.pos.lat,SF.pos.lon],[n.x.lat,n.x.lon]).then(function(r){
    if(S.userLn)S.map.removeLayer(S.userLn);
    S.userLn=L.geoJSON(r.geometry,{pane:"evp",renderer:S.evrd,style:{color:"#0ea5e9",weight:6,opacity:.9}}).bindTooltip("Rute jalan kaki dari lokasimu ke "+esc(n.x.n||GN[n.x.g])+" · "+fD(r.distance/1000)+" · ±"+Math.max(1,Math.round(r.duration/60))+" mnt").addTo(S.map);
    d.userMsg="Dari lokasimu ke "+(n.x.n||GN[n.x.g])+" ("+sp.t+" terdekat): "+fD(r.distance/1000)+", ±"+Math.max(1,Math.round(r.duration/60))+" menit berjalan kaki (garis biru).";side();
  }).catch(function(){});
}

/* ---------- Panel ---------- */
function banner(){
  var el=$("ex-banner");if(!el)return;
  var hi=0,tot=0,pv=[];S.al.forEach(function(a,i){if(a.lv>=1){tot++;if(a.lv>=2)hi++;pv.push(i)}});
  var tm=META&&META.generated_at?new Date(META.generated_at).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})+" WIB":"";
  var st=MODE==="live"&&META&&!META.partial?"Data langsung dari backend (BMKG, PVMBG, BNPB) · diperbarui "+tm:MODE==="live"?"Gempa: langsung dari BMKG · diperbarui "+tm+". Cuaca, gunung api, dan BNPB masih cuplikan 29 Okt 2026 (jalankan backend agar real-time) dan tidak dipakai mewarnai status.":"Mode cadangan: data cuplikan 29 Okt 2026, bukan real-time. Gempa terbaru dari BMKG belum bisa dimuat dari browser ini.";
  el.className="card ex-banner"+(hi?" hot":"");
  el.innerHTML="<b>"+(tot?"⚠ "+tot+" provinsi berstatus peringatan"+(hi?" ("+hi+" Siaga/Awas)":""):"Tidak ada peringatan aktif pada data real-time yang masuk")+"</b><p>"+esc(st)+" Status diperbarui otomatis setiap 5 menit.</p>"+
   (tot?'<div class="ex-chips">'+pv.sort(function(a,b){return S.al[b].lv-S.al[a].lv}).slice(0,12).map(function(i){return'<button class="ex-chip" data-i="'+i+'"><i style="background:'+LCOL[S.al[i].lv]+'"></i>'+esc(short(P[i].n))+"</button>"}).join("")+"</div>":"");
  Array.prototype.forEach.call(el.querySelectorAll(".ex-chip"),function(b){b.onclick=function(){select(+b.getAttribute("data-i"),true)}});
}
function legend(){
  var el=$("ex-leg");if(!el)return;
  el.innerHTML=(S.mode==="alert"?LN.map(function(n,i){return'<span><i style="background:'+LCOL[i]+'"></i>'+n+"</span>"}).join(""):'<span><i style="background:#ee6a5b"></i>Warna = pembeda wilayah; garis tebal berwarna = peringatan Siaga/Awas</span>')+
  '<span><i class="ln" style="border-top:4px solid #15803d"></i>Jalur evakuasi (OSM)</span><span><i class="ln" style="border-top:3px dashed #2563eb"></i>Rute jalan ke titik evakuasi</span><span><i class="dt" style="background:#16a34a"></i>Titik kumpul</span><span><i class="dt" style="background:#dc2626"></i>RS</span><span><i class="dt" style="background:#f97316"></i>Pemadam</span><span>🟣 Lapisan resmi BNPB/InaRISK (zoom ≥ 8, hanya daerah yang sudah dipetakan BNPB; simbol mengikuti BNPB)</span><span class="muted">Titik OSM muncul saat zoom ≥ 8</span>';
}
function side(){
  var el=$("ex-side");if(!el)return;var i=S.sel;
  if(i==null){
    var L2=[];S.al.forEach(function(a,k){if(a.lv>=1)L2.push(k)});L2.sort(function(a,b){return S.al[b].lv-S.al[a].lv||S.al[b].ev.length-S.al[a].ev.length});
    el.innerHTML='<h4>Provinsi berstatus peringatan</h4>'+(L2.length?'<div class="ex-items">'+L2.map(function(k){var a=S.al[k];return'<button class="ex-it" data-i="'+k+'"><i style="background:'+LCOL[a.lv]+'"></i><div><b>'+esc(P[k].n)+'</b><small>'+LN[a.lv]+" · "+a.ev.length+" kejadian · "+esc(a.ev[0].e.lb)+"</small></div></button>"}).join("")+"</div>":'<p class="muted sm">Tidak ada peringatan aktif pada data real-time yang masuk. Ini bukan jaminan aman; tetap kenali titik evakuasi di daerahmu.</p>')+
    '<p class="muted sm">Klik provinsi di peta untuk memuat titik kumpul, fasilitas darurat, dan garis jalur evakuasinya.</p><a class="btn" target="_blank" rel="noopener" href="https://inarisk.bnpb.go.id">Buka InaRISK BNPB ↗</a>'+staleNote();
  }else{
    var a=S.al[i],d=S.data[i],kinds=a.ev.map(function(x){return x.e.k+" "+(x.e.det||"")}).join(" ");
    el.innerHTML='<div class="ex-ph"><h4>'+esc(P[i].n)+'</h4><span class="ex-bd" style="background:'+LCOL[a.lv]+'">'+LN[a.lv]+"</span></div>"+
    (a.ev.length?'<div class="ex-items">'+a.ev.map(function(x){return'<button class="ex-it ev" data-id="'+x.e.id+'"><i style="background:'+LCOL[x.L]+'"></i><div><b>'+esc(x.e.k)+" · "+esc(x.e.lb)+"</b><small>"+esc((x.e.w||"").slice(0,80))+(x.e.tt?" · "+esc(x.e.tt):"")+"</small></div></button>"}).join("")+"</div>":'<p class="muted sm">Tidak ada peringatan aktif untuk provinsi ini pada data real-time.</p>')+
    '<h5>Jalur evakuasi</h5>'+(d?(d.busy?'<p class="muted sm">⏳ '+esc(d.msg)+"</p>":'<p class="muted sm">'+esc(d.msg||"")+"</p>"):'<p class="muted sm">Belum dimuat.</p>')+(d&&d.userMsg?'<p class="sm"><b>'+esc(d.userMsg)+"</b></p>":"")+
    '<div class="ex-acts"><button class="btn green" id="ex-rl">'+(d&&d.done?"Muat ulang":"Muat jalur evakuasi")+'</button><a class="btn" target="_blank" rel="noopener" href="https://inarisk.bnpb.go.id">Buka InaRISK BNPB ↗</a></div><p class="muted sm">Jalur resmi BNPB (lapisan di peta) hanya ada di daerah yang sudah dipetakan BNPB; zoom ke wilayahmu. Jika tidak tampak, wilayahmu belum tersedia di layanan peta BNPB; tanyakan BPBD setempat.</p>'+
    '<h5>Panduan singkat</h5>'+TIPS.filter(function(t){return t[1].test(kinds)}).concat(a.ev.length?[]:TIPS.slice(0,1)).map(function(t){return'<div class="ex-tip2"><b>'+t[0]+"</b><p>"+t[2]+"</p></div>"}).join("")+
    '<p class="muted sm">Panduan umum; ikuti arahan petugas BPBD/BNPB setempat.</p>'+staleNote(i);
    if($("ex-rl"))$("ex-rl").onclick=function(){loadProv(i,true)};
  }
  Array.prototype.forEach.call(el.querySelectorAll(".ex-it:not(.ev)"),function(b){b.onclick=function(){select(+b.getAttribute("data-i"),true)}});
  Array.prototype.forEach.call(el.querySelectorAll(".ex-it.ev"),function(b){b.onclick=function(){openDetail(+b.getAttribute("data-id"))}});
}
function staleNote(i){
  var n=S.stale.filter(function(s){return i==null||s.i===i}).length;
  return n?'<p class="muted sm ex-stale">'+n+' kejadian lain berasal dari data cuplikan (bukan real-time) dan tidak dipakai untuk status provinsi; lihat penanda di peta.</p>':"";
}

/* ---------- Antarmuka publik ---------- */
function update(){
  compute();var sg=sigOf();
  if(!S.built)return;
  if(sg!==S.sig){S.sig=sg;if(S.map){restyle();labels();incidents()}side()}
  banner();
  if(S.wantUser&&SF.pos)placeUser(true);
}
window.NAEVAC={
  enter:function(){
    if(!S.built){compute();build()}
    loadLeaf().then(function(){initMap();update();if(SF.pos&&!S.user)placeUser(false)}).catch(function(){$("ex-map").innerHTML='<p class="muted" style="padding:24px">Peta tidak dapat dimuat (periksa koneksi internet).</p>'});
  },
  update:update,
  select:function(i){select(i,true)}
};
compute();
})();
