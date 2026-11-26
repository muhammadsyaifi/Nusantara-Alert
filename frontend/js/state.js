/* Status bersama dan fungsi bantu */
var Z=4.6,CT=[118,-2],AU=true;        // peta: zoom (4,6 = seluruh Indonesia), pusat [lon,lat], aura panas
var HOT=[],MODE="snapshot",META={},SHOWW=true,LOCK=false,THEME=(document.documentElement.getAttribute("data-theme")||"light");                // titik panas satelit (live), mode data, metadata
var FT=["Semua","Gempa","Gunung Api","Cuaca","Karhutla","Banjir","Longsor"];
var cur="Semua",selId=null,K=19,qs="";
function vis(e){
  if(!SHOWW && (e.k=="Cuaca ekstrem"||e.k=="Kekeringan"||e.k=="Hujan tinggi")) return false;
  if(cur && cur !== "Semua") {
    if(cur === "Gempa" || cur === "Gempa bumi") {
      if(e.k !== "Gempa bumi") return false;
    } else if(cur === "Gunung Api" || cur === "Gunung api") {
      if(e.k !== "Gunung api") return false;
    } else if(cur === "Cuaca" || cur === "Cuaca ekstrem") {
      if(e.k !== "Cuaca ekstrem" && e.k !== "Hujan tinggi" && e.k !== "Kekeringan") return false;
    } else if(cur === "Karhutla") {
      if(e.k !== "Karhutla") return false;
    } else if(cur === "Banjir") {
      if(e.k.indexOf("Banjir") < 0 && (e.det || "").toLowerCase().indexOf("banjir") < 0) return false;
    } else if(cur === "Longsor") {
      if(e.k.toLowerCase().indexOf("longsor") < 0 && (e.det || "").toLowerCase().indexOf("longsor") < 0) return false;
    } else if(e.k !== cur) {
      return false;
    }
  }
  if(qs && (e.w + " " + (e.f || "") + " " + (e.det || "") + " " + (e.lb || "")).toLowerCase().indexOf(qs) < 0) return false;
  return true;
}
function px(lo,la){return[(lo-94)*K,(6-la)*K]}
var $=function(i){return document.getElementById(i)};
function tw(d){return d.toLocaleString("id-ID",{timeZone:"Asia/Jakarta",day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).replace(".",":")+" WIB"}
function fmt(n){return Math.abs(n).toFixed(2)+"°"}
function dep(k){return k<=60?"dangkal":k<=300?"menengah":"dalam"}
