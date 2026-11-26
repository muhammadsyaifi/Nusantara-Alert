/* Opsional: Google Maps JavaScript API. Aktifkan lewat CONFIG.MAP_PROVIDER="google" + CONFIG.GOOGLE_MAPS_KEY */
var GM=null,GO=[];
var GSTYLE=[{elementType:"geometry",stylers:[{color:"#16191d"}]},{elementType:"labels.text.fill",stylers:[{color:"#8a909b"}]},{elementType:"labels.text.stroke",stylers:[{color:"#0d0f12"}]},{featureType:"water",elementType:"geometry",stylers:[{color:"#0b0d10"}]},{featureType:"road",elementType:"geometry",stylers:[{color:"#262a31"}]},{featureType:"poi",stylers:[{visibility:"off"}]},{featureType:"administrative",elementType:"geometry.stroke",stylers:[{color:"#2d3238"}]}];
var GP={t:"M0,-1L1,.8L-1,.8Z",s:"M-.8,-.8h1.6v1.6h-1.6Z",d:"M0,-1.2L1.2,0L0,1.2L-1.2,0Z",p:"M0,-1L1,-.3L.6,.9L-.6,.9L-1,-.3Z",h:"M0,-1L.9,-.5L.9,.5L0,1L-.9,.5L-.9,-.5Z",f:"M0,-1.2L.35,-.4L1.2,-.35L.55,.2L.75,1L0,.55L-.75,1L-.55,.2L-1.2,-.35L-.35,-.4Z"};
function gz(z){return Math.max(2,Math.min(18,Math.round(2+Math.log(z)/Math.LN2*1.45)))}
function initGoogle(){
  var s=document.createElement("script");
  window.__gm=function(){
    GM=new google.maps.Map($("gmap"),{center:{lat:CT[1],lng:CT[0]},zoom:gz(Z),streetViewControl:false,fullscreenControl:false,disableDefaultUI:true,styles:THEME=="dark"?GSTYLE:[]});
    $("gmap").style.display="block";$("imap").style.display="none";
    GM.addListener("idle",function(){var c=GM.getCenter();CT=[c.lng(),c.lat()];Z=Math.pow(2,(GM.getZoom()-2)/1.45)});
    drawMap();
  };
  s.src="https://maps.googleapis.com/maps/api/js?key="+encodeURIComponent(CONFIG.GOOGLE_MAPS_KEY)+"&callback=__gm";
  s.async=true;s.onerror=function(){console.warn("Google Maps gagal dimuat, memakai peta bawaan")};
  document.head.appendChild(s);
}
function drawGoogle(){
  GO.forEach(function(o){o.setMap(null)});GO=[];
  if(AU&&(cur=="Semua"||cur=="Karhutla")){
    if(HOT.length)HOT.slice(0,4000).forEach(function(p){GO.push(new google.maps.Circle({map:GM,center:{lat:p[1],lng:p[0]},radius:2500,fillColor:"#ff4a14",fillOpacity:.35,strokeOpacity:0,clickable:false}))});
    else HS.forEach(function(c){GO.push(new google.maps.Circle({map:GM,center:{lat:c[2],lng:c[1]},radius:25000+1800*Math.sqrt(c[3]),fillColor:"#ff5a1e",fillOpacity:.28,strokeOpacity:0,clickable:false}))});
  }
  EV.filter(vis).forEach(function(e){
    var r=e.k=="Gempa bumi"?5+e.m*1.1:10,sel=e.id==selId,ic=e.sh=="c"?{path:google.maps.SymbolPath.CIRCLE,scale:r}:{path:GP[e.sh],scale:r};
    ic.fillColor=e.c;ic.fillOpacity=1;ic.strokeColor=sel?"#e3f08a":"#0b0c0e";ic.strokeWeight=sel?3:1.5;
    var m=new google.maps.Marker({map:GM,position:{lat:e.y,lng:e.x},icon:ic,title:e.k+" · "+e.lb+" · "+e.w,zIndex:sel?9:1});
    m.addListener("click",function(){pick(e.id)});GO.push(m);
  });
  var c=GM.getCenter();
  if(Math.abs(c.lng()-CT[0])>1e-4||Math.abs(c.lat()-CT[1])>1e-4)GM.setCenter({lat:CT[1],lng:CT[0]});
  if(GM.getZoom()!=gz(Z))GM.setZoom(gz(Z));
}
