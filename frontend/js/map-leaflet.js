/* Peta dunia nyata dengan tile (Leaflet + CARTO/OSM): jalan, kota, nama negara, mengikuti tema gelap/terang.
   Butuh internet ke server tile. Jika tile gagal dimuat, otomatis kembali ke peta dunia ECharts. */
var LM=null,LO=[],TL=null,tileOK=0,tileBad=0,NAVF=false;
var TILES={
  carto:{dark:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",light:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",attr:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',sub:"abcd"},
  osm:{dark:"https://tile.openstreetmap.org/{z}/{x}/{y}.png",light:"https://tile.openstreetmap.org/{z}/{x}/{y}.png",attr:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',sub:"abc"}
};
var SVGP={t:"0,-10 9,8 -9,8",d:"0,-11 10,0 0,11 -10,0",s:"-8,-8 8,-8 8,8 -8,8",p:"0,-10 10,-3 6,9 -6,9 -10,-3",h:"0,-10 9,-5 9,5 0,10 -9,5 -9,-5",f:"0,-12 3,-4 11,-4 5,1 7,10 0,5 -7,10 -5,1 -11,-4 -3,-4"};
function lz(z){return Math.max(2,Math.min(18,Math.round((2+Math.log(z)/Math.LN2*1.45)*4)/4))}
function shapeSVG(e,s){var fill=e.c,st=THEME=="dark"?"#0b0c0e":"#ffffff",body=e.sh=="c"?'<circle r="9" fill="'+fill+'" stroke="'+st+'" stroke-width="1.6"/>':'<polygon points="'+SVGP[e.sh]+'" fill="'+fill+'" stroke="'+st+'" stroke-width="1.6" stroke-linejoin="round"/>';return'<svg viewBox="-13 -13 26 26" width="'+s+'" height="'+s+'">'+body+"</svg>"}
function setTiles(){
  if(!LM)return;
  var T=TILES[CONFIG.TILE_STYLE]||TILES.carto;
  if(TL)LM.removeLayer(TL);
  TL=L.tileLayer(T[THEME=="light"?"light":"dark"],{subdomains:T.sub,maxZoom:19,detectRetina:true,attribution:T.attr,crossOrigin:true});
  TL.on("tileload",function(){tileOK++;mapReady()}).on("tileerror",function(){tileBad++});
  TL.addTo(LM);
}
function initLeaflet(){
  if(!window.L||CONFIG.MAP_PROVIDER!="tiles")return false;
  $("imap").style.display="none";$("lmap").style.display="block";   /* wadah harus tampak sebelum peta dibuat agar ukurannya terbaca */
  try{
    LM=L.map("lmap",{zoomControl:false,worldCopyJump:true,minZoom:2,maxZoom:18,zoomSnap:.25,zoomDelta:.5,wheelPxPerZoomLevel:80,preferCanvas:true,maxBoundsViscosity:.6}).setView([CT[1],CT[0]],lz(Z));
  }catch(e){LM=null;$("lmap").style.display="none";$("imap").style.display="block";return false}
  setTiles();
  [0,250,900,2500].forEach(function(ms){setTimeout(function(){if(LM)LM.invalidateSize()},ms)});
  window.addEventListener("load",function(){if(LM)LM.invalidateSize()});
  LM.on("moveend",function(){var c=LM.getCenter();CT=[c.lng,c.lat];Z=Math.pow(2,(LM.getZoom()-2)/1.45)});
  /* jika tidak ada satu pun tile yang berhasil dimuat, pakai peta cadangan */
  setTimeout(function(){if(LM&&tileOK===0)leafletFail()},6000);
  return true;
}
function leafletFail(){
  try{LM.remove()}catch(e){}
  LM=null;LO=[];$("lmap").style.display="none";$("imap").style.display="block";
  console.warn("Tile peta tidak bisa dimuat; kembali ke peta Indonesia bawaan");
  ifit();drawMap();
}
function drawLeaflet(){
  LO.forEach(function(o){LM.removeLayer(o)});LO=[];
  ["dragging","scrollWheelZoom","touchZoom","doubleClickZoom","boxZoom","keyboard"].forEach(function(h){if(LM[h])LM[h][LOCK?"disable":"enable"]()});
  /* aura = lingkaran bertumpuk berukuran meter di bumi: menempel pada peta, tidak bergeser saat geser/zoom, tanpa animasi */
  var glow=function(lat,lon,r,k){[[1,.07],[.7,.1],[.45,.16],[.22,.28]].forEach(function(s,i){LO.push(L.circle([lat,lon],{radius:r*s[0],stroke:false,fillColor:i<2?"#ff8a1e":"#ff3b10",fillOpacity:s[1]*k,interactive:false}).addTo(LM))})};
  if(AU&&(cur=="Semua"||cur=="Karhutla")){
    if(HOT.length)HOT.slice(0,5000).forEach(function(p){LO.push(L.circle([p[1],p[0]],{radius:2500,stroke:false,fillColor:"#ff4a14",fillOpacity:.4,interactive:false}).addTo(LM))});
    else HS.forEach(function(c){glow(c[2],c[1],25000+1800*Math.sqrt(c[3]),1)});
    EV.forEach(function(e){if(e.k=="Karhutla"&&vis(e))glow(e.y,e.x,15000,1.1)});
  }
  EV.filter(vis).forEach(function(e){
    var s=e.k=="Gempa bumi"?14+e.m*2.4:e.sh=="f"?28:22,sel=e.id==selId,hot=e.c==RC.Merah||e.c==RC.Oranye||e.k=="Cuaca ekstrem";
    var m=L.marker([e.y,e.x],{icon:L.divIcon({className:"lmk"+(sel?" sel":""),html:(hot?'<span class="lp" style="--c:'+e.c+'"></span>':"")+shapeSVG(e,s),iconSize:[s,s],iconAnchor:[s/2,s/2]}),riseOnHover:true,zIndexOffset:sel?1000:0,keyboard:false,title:""}).addTo(LM);
    m.bindTooltip("<b>"+esc(e.k)+"</b> · "+esc(e.lb)+"<br>"+esc(e.w)+"<br>"+esc(e.tt),{direction:"top",offset:[0,-s/2],className:"ltip"});
    m.on("click",function(){pick(e.id)});LO.push(m);
  });
  /* terbang ke lokasi hanya saat diminta (pick), bukan setiap kali data disegarkan */
  if(NAVF){NAVF=false;LM.flyTo([CT[1],CT[0]],lz(Z),{duration:.9})}
}
