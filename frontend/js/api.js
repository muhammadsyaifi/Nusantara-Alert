/* Pemuat data dari backend (/api/events, /api/hotspots). Jika gagal, tetap memakai snapshot. */
function getJSON(p){return fetch(CONFIG.API_BASE+p,{headers:{Accept:"application/json"}}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})}
function loadLive(){
  return getJSON("/api/events").then(function(d){
    if(!d.events||!d.events.length)throw new Error("kosong");
    EV.length=0;
    d.events.forEach(function(e,i){if(e.d)e.d=new Date(e.d);if(e.k=="Gempa bumi"&&!e.tt)e.tt=tw(e.d);e.id=i+1;EV.push(e)});
    META=d.meta||{};MODE="live";
    return getJSON("/api/hotspots").then(function(h){HOT=h.points||[]}).catch(function(){}).then(function(){return true});
  }).catch(function(err){console.warn("Backend tidak tersedia, memakai snapshot:",err.message);return false});
}
