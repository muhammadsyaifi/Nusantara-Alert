/* Pemilih penyaji peta. Bawaan: peta Indonesia vektor (selalu tampil). Opsional: tile dunia nyata (Leaflet) atau Google Maps, dimuat saat dibutuhkan. */
function loadJS(src,ok){var s=document.createElement("script");s.src=src;s.async=true;s.onload=ok;s.onerror=function(){console.warn("Gagal memuat",src)};document.head.appendChild(s)}
function loadCSS(href){var l=document.createElement("link");l.rel="stylesheet";l.href=href;document.head.appendChild(l)}
function initMap(){
  initIndo();
  var p=CONFIG.MAP_PROVIDER;
  if(p==="tiles"){loadCSS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css");loadJS("https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",function(){if(initLeaflet())drawMap()})}
  else if(p==="google"&&CONFIG.GOOGLE_MAPS_KEY)initGoogle();
}
function mapReady(){var x=$("mload");if(x)x.classList.add("off")}
function drawMap(){if(GM){drawGoogle();mapReady()}else if(LM)drawLeaflet();else if(INDO){drawIndo();mapReady()}}
function setView(z,c){Z=Math.max(1,Math.min(80,z));if(c)CT=c;if(GM)drawGoogle();else if(LM)LM.flyTo([CT[1],CT[0]],lz(Z),{duration:.6});else if(INDO)ivFly(CT[0],CT[1],Z,550)}
function mapResize(){[60,250,600].forEach(function(ms){setTimeout(function(){if(LM)LM.invalidateSize();if(INDO)ifit();if(GM&&window.google)google.maps.event.trigger(GM,"resize")},ms)})}
