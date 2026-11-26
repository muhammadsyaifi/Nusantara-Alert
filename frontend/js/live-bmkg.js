/* Pembaruan gempa langsung dari BMKG (Data Gempabumi Terbuka) tanpa backend.
   Dipakai hanya jika backend (/api/events) tidak aktif, misalnya saat frontend dihosting statis di Vercel.
   Sumber: https://data.bmkg.go.id/gempabumi (autogempa, gempaterkini M 5.0+, gempadirasakan).
   Hanya gempa yang diperbarui; cuaca, gunung api, dan BNPB tetap cuplikan sampai backend aktif. */
(function(){
var BASE="https://data.bmkg.go.id/DataMKG/TEWS/";
var FILES=["autogempa.json","gempaterkini.json","gempadirasakan.json"];
function num(s){var m=String(s||"").match(/-?\d+(\.\d+)?/);return m?parseFloat(m[0]):NaN}
function one(g){
  var c=String(g.Coordinates||"").split(","),la=parseFloat(c[0]),lo=parseFloat(c[1]),m=num(g.Magnitude),dp=num(g.Kedalaman),d=new Date(g.DateTime);
  if(isNaN(la)||isNaN(lo)||isNaN(m)||isNaN(d.getTime()))return null;
  var gr=lvl(m);
  return{k:"Gempa bumi",d:d,y:la,x:lo,m:m,dp:isNaN(dp)?0:dp,w:g.Wilayah||"",f:g.Dirasakan||"",ts:g.Potensi||"",c:RC[gr],lv:gr+" · "+RN[gr]+" (analisis internal)",tt:tw(d),lb:"M "+m.toFixed(1),sh:"c",src:"BMKG · Data Gempabumi Terbuka"};
}
function grab(f){
  return fetch(BASE+f,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}).then(function(j){
    var g=j&&j.Infogempa&&j.Infogempa.gempa;if(!g)return[];return(Array.isArray(g)?g:[g]).map(one).filter(Boolean);
  });
}
function liveBMKG(){
  return Promise.all(FILES.map(function(f){return grab(f).catch(function(){return null})})).then(function(R){
    var ok=R.filter(function(x){return x}),seen={},list=[];
    if(!ok.length)return false;
    ok.forEach(function(a){a.forEach(function(e){var k=e.d.getTime()+"|"+e.y+"|"+e.x;if(!seen[k]){seen[k]=1;list.push(e)}})});
    if(!list.length)return false;
    list.sort(function(a,b){return b.d-a.d});
    var rest=EV.filter(function(e){return e.k!=="Gempa bumi"});
    EV.length=0;list.concat(rest).forEach(function(e,i){e.id=i+1;EV.push(e)});
    MODE="live";META={generated_at:new Date().toISOString(),partial:true,note:"Gempa: BMKG langsung dari browser. Lainnya: cuplikan."};
    return true;
  });
}
if(typeof loadLive==="function"){
  var _ll=loadLive;
  loadLive=function(){return _ll().then(function(ok){return ok?true:liveBMKG()}).catch(function(){return liveBMKG()})};
}
})();
