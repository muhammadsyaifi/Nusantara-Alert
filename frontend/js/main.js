/* Titik masuk aplikasi: inisialisasi, pemuatan data, loading screen */
function setMode(){
  var el=$("mode");if(!el)return;
  el.textContent=MODE=="live"?"Live · "+new Date(META.generated_at||Date.now()).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"}):"Snapshot 29 Okt 2026";
  el.className="pill "+MODE;
}
function renderAll(){drawKpi();drawHero();drawTicker();drawHS();drawSrc();setDate();refresh();setMode();nfBadge();if(window.NAEVAC)NAEVAC.update()}
var LS=["Memuat data gempa BMKG","Memuat peringatan dini cuaca","Memuat peringatan kekeringan dan hujan","Memuat status gunung api","Memuat laporan karhutla dan banjir BNPB","Menyiapkan peta dunia","Menyiapkan peta jalur evakuasi"];
/* Bersihkan sisa kunci/pengaturan AI eksternal dari versi sebelumnya */
try{["aik","aim","aip","aik_openai","aik_gemini","aim_openai","aim_gemini"].forEach(function(k){localStorage.removeItem(k)})}catch(e){}
(function(){
  var lt=$("ldt");lt.innerHTML=lt.textContent.split("").map(function(c,i){return'<span class="'+(c=="-"?"hy":"")+'" style="animation-delay:'+(i*60)+'ms">'+c+"</span>"}).join("");
  initMap();
  wire();bindNotif();renderAll();
  var live=loadLive().then(function(ok){if(ok)renderAll()});
  var i=0;
  function done(){live.then(function(){$("ld").classList.add("out");document.body.classList.remove("busy");document.body.classList.add("ready");setTimeout(function(){$("ld").remove()},1100)})}
  function st(){var pc=Math.round((i+1)/LS.length*100);$("lbar").style.width=pc+"%";$("ldp").textContent=pc+"%";$("ldr").setAttribute("width",(pc/100*710).toFixed(0));$("ls").textContent=LS[i]+"…";i++;if(i<LS.length)setTimeout(st,450);else setTimeout(done,600)}
  st();
})();
setInterval(function(){loadLive().then(function(ok){if(ok)renderAll()})},CONFIG.REFRESH_MS);
