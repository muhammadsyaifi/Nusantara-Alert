/* Peta Indonesia vektor (SVG) bergaya gambar referensi: daratan gelap dengan batas provinsi.
   Tanpa CDN, selalu tampil. Bisa digeser (seret, jari, tombol panah), di-zoom (roda, cubit, klik dua kali, tombol), dan layar penuh. */
var INDO=false,IV={k:1,tx:0,ty:0,kfit:0,w:0,h:0,anim:0,glide:0,lk:0},IG={},NS="http://www.w3.org/2000/svg";
var ISH={t:"0,-10 9,8 -9,8",d:"0,-11 10,0 0,11 -10,0",s:"-8,-8 8,-8 8,8 -8,8",p:"0,-10 10,-3 6,9 -6,9 -10,-3",h:"0,-10 9,-5 9,5 0,10 -9,5 -9,-5",f:"0,-12 3,-4 11,-4 5,1 7,10 0,5 -7,10 -5,1 -11,-4 -3,-4"};
var IOCEAN=[["SAMUDRA HINDIA",98,-8.8,3],["LAUT CINA SELATAN",110.5,6.2,3],["LAUT JAWA",111,-5.3,3],["LAUT BANDA",127,-6.2,3],["LAUT SULAWESI",122.6,3.7,3],["SAMUDRA PASIFIK",136,4.8,3],["LAUT ARAFURA",136.5,-9.8,3],["LAUT FLORES",120.6,-7.5,5],["SELAT MALAKA",100.4,3.9,5],["SELAT MAKASSAR",117.6,-2.3,5],["LAUT MALUKU",126.2,2,5.5],["LAUT TIMOR",125.5,-10.4,5]];
var ICITY=[["Jakarta",106.85,-6.2,5.2],["Surabaya",112.75,-7.25,5.2],["Medan",98.67,3.59,5.2],["Makassar",119.41,-5.15,5.2],["Palembang",104.75,-2.98,5.2],["Banjarmasin",114.59,-3.32,5.2],["Pontianak",109.33,-0.03,5.2],["Manado",124.84,1.47,5.2],["Jayapura",140.7,-2.55,5.2],["Samarinda",117.15,-0.5,5.6],["Bandung",107.6,-6.9,7],["Semarang",110.42,-6.97,7],["Yogyakarta",110.37,-7.8,7],["Denpasar",115.22,-8.65,7],["Mataram",116.1,-8.58,7],["Kupang",123.6,-10.17,7],["Banda Aceh",95.32,5.55,7],["Padang",100.35,-0.95,7],["Pekanbaru",101.45,0.51,7],["Bandar Lampung",105.26,-5.43,7],["Batam",104.03,1.05,7],["Palu",119.87,-0.9,7],["Kendari",122.51,-3.97,7],["Ambon",128.18,-3.7,7],["Ternate",127.37,0.79,7],["Merauke",140.4,-8.5,7],["Balikpapan",116.83,-1.27,8],["Sorong",131.26,-0.88,8]];
var IPROV=[["ACEH",96.8,4.5],["SUMATERA UTARA",99,2],["SUMATERA BARAT",100.5,-0.9],["RIAU",101.7,0.5],["JAMBI",103,-1.6],["SUMATERA SELATAN",104,-3.3],["BENGKULU",102.3,-3.8],["LAMPUNG",105.2,-4.9],["KEPULAUAN RIAU",104.5,0.9],["BANGKA BELITUNG",106.4,-2.4],["JAWA BARAT",107.6,-6.9],["JAWA TENGAH",110.2,-7.2],["JAWA TIMUR",112.6,-7.6],["BALI",115.1,-8.4],["NTB",117.4,-8.7],["NTT",121,-9.6],["KALIMANTAN BARAT",110.8,-0.3],["KALIMANTAN TENGAH",113.6,-2],["KALIMANTAN SELATAN",115.3,-3],["KALIMANTAN TIMUR",116.4,0.5],["KALIMANTAN UTARA",116.5,3],["SULAWESI UTARA",124.8,1.3],["GORONTALO",122.4,0.6],["SULAWESI TENGAH",121,-1.4],["SULAWESI BARAT",119.3,-2.5],["SULAWESI SELATAN",120,-4],["SULAWESI TENGGARA",122.1,-4],["MALUKU",129.5,-3.5],["MALUKU UTARA",127.8,0.9],["PAPUA BARAT",132.8,-1.4],["PAPUA",138.5,-4.5],["PAPUA SELATAN",139.5,-7]];
function imx(lon){return(lon-IM.LON0)*IM.S}function imy(lat){return(IM.LAT0-lat)*IM.S}
function iLon(x){return IM.LON0+x/IM.S}function iLat(y){return IM.LAT0-y/IM.S}
function se(t,a,p){var n=document.createElementNS(NS,t);for(var k in a)n.setAttribute(k,a[k]);if(p)p.appendChild(n);return n}
function div(cls,p){var d=document.createElement("div");d.className=cls;p.appendChild(d);return d}
function ivCenter(){return[(IV.w/2-IV.tx)/IV.k,(IV.h/2-IV.ty)/IV.k]}
function ivClamp(){var b=IM.box,k=IV.k,c=ivCenter(),cx=Math.max(b[0]-40,Math.min(b[2]+40,c[0])),cy=Math.max(b[1]-40,Math.min(b[3]+40,c[1]));IV.tx=IV.w/2-cx*k;IV.ty=IV.h/2-cy*k}
function ivKids(){
  var nar=IV.w<520,s=(nar?.78:1)/IV.k,z=4.6*IV.k/IV.kfit-(nar?2:0);
  [IG.lab,IG.mk].forEach(function(L){Array.prototype.forEach.call(L.children,function(g){g.setAttribute("transform","translate("+g.getAttribute("data-x")+" "+g.getAttribute("data-y")+") scale("+s+")");var m=g.getAttribute("data-z");if(m!==null)g.style.display=z>=+m?"":"none"})});
}
function ivScale(){
  var ppk=IM.S*IV.k/111.32,st=[2000,1000,500,250,100,50,25,10],km=10;
  for(var i=0;i<st.length;i++){if(st[i]*ppk<=130){km=st[i];break}}
  IG.scale.innerHTML='<i style="width:'+(km*ppk).toFixed(0)+'px"></i><b>'+km+" km</b>";
}
function ivApply(){
  IG.vp.setAttribute("transform","translate("+IV.tx.toFixed(2)+" "+IV.ty.toFixed(2)+") scale("+IV.k.toFixed(4)+")");
  var c=ivCenter();CT=[iLon(c[0]),iLat(c[1])];Z=4.6*IV.k/IV.kfit;
  if(Math.abs(IV.k-IV.lk)>1e-6){IV.lk=IV.k;ivKids();ivScale()}
}
function ivSet(k,cx,cy){k=Math.max(IV.kfit*.7,Math.min(IV.kfit*17.5,k));IV.k=k;IV.tx=IV.w/2-cx*k;IV.ty=IV.h/2-cy*k;ivClamp();ivApply()}
function ivZoomAt(f,sx,sy){
  var nk=Math.max(IV.kfit*.7,Math.min(IV.kfit*17.5,IV.k*f)),mx=(sx-IV.tx)/IV.k,my=(sy-IV.ty)/IV.k;
  IV.k=nk;IV.tx=sx-mx*nk;IV.ty=sy-my*nk;ivClamp();ivApply();
}
function ifit(){
  var r=$("imap").getBoundingClientRect();if(!r.width||!r.height)return;
  var first=!IV.kfit,rel=first?1:IV.k/IV.kfit,c=first?[(IM.box[0]+IM.box[2])/2,(IM.box[1]+IM.box[3])/2]:ivCenter();
  IV.w=r.width;IV.h=r.height;
  IV.kfit=Math.min((r.width-56)/(IM.box[2]-IM.box[0]),(r.height-56)/(IM.box[3]-IM.box[1]));
  ivSet(IV.kfit*rel,c[0],c[1]);
}
function ivFly(lon,lat,z,dur){
  cancelAnimationFrame(IV.anim);cancelAnimationFrame(IV.glide);
  var k1=IV.kfit*z/4.6,c0=ivCenter(),c1=[imx(lon),imy(lat)],k0=IV.k,t0=null;
  if(window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches){ivSet(k1,c1[0],c1[1]);return}
  k1=Math.max(IV.kfit*.7,Math.min(IV.kfit*17.5,k1));
  (function step(t){if(t0===null)t0=t;var p=Math.min(1,(t-t0)/dur),e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;ivSet(k0*Math.pow(k1/k0,e),c0[0]+(c1[0]-c0[0])*e,c0[1]+(c1[1]-c0[1])*e);if(p<1)IV.anim=requestAnimationFrame(step)})(performance.now());
}
function initIndo(){
  var host=$("imap");host.style.display="block";host.innerHTML="";
  ["lmap","gmap"].forEach(function(i){var x=$(i);if(x)x.style.display="none"});
  var svg=se("svg",{width:"100%",height:"100%",role:"img","aria-label":"Peta Indonesia interaktif"},host);
  var defs=se("defs",{},svg),g=se("radialGradient",{id:"ag"},defs);
  [["0","#ff4a14",.9],["0.5","#ff9a1e",.42],["1","#ffd23c",0]].forEach(function(s){se("stop",{offset:s[0],"stop-color":s[1],"stop-opacity":s[2]},g)});
  IG.svg=svg;IG.vp=se("g",{},svg);IG.grat=se("g",{"class":"igrat"},IG.vp);IG.land=se("g",{"class":"iland"},IG.vp);
  IG.aura=se("g",{"class":"iaura"},IG.vp);IG.lab=se("g",{"class":"ilab"},IG.vp);IG.mk=se("g",{"class":"imks"},IG.vp);
  var b=IM.box,lo,la;
  for(lo=95;lo<=140;lo+=5)se("line",{x1:imx(lo),y1:b[1]-80,x2:imx(lo),y2:b[3]+80},IG.grat);
  for(la=5;la>=-10;la-=5)se("line",{x1:b[0]-80,y1:imy(la),x2:b[2]+80,y2:imy(la)},IG.grat);
  IM.paths.forEach(function(d){se("path",{d:d},IG.land)});
  var add=function(cls,name,lon,lat,z,dot){var gg=se("g",{"class":"lb "+cls,"data-x":imx(lon),"data-y":imy(lat),"data-z":z},IG.lab);if(dot)se("circle",{r:2.6},gg);var t=se("text",{x:dot?6:0,y:3.5,"text-anchor":dot?"start":"middle"},gg);t.textContent=name};
  IOCEAN.forEach(function(o){add("oc",o[0],o[1],o[2],o[3],false)});ICITY.forEach(function(c){add("ct",c[0],c[1],c[2],c[3],true)});IPROV.forEach(function(p){add("pv",p[0],p[1],p[2],8,false)});
  IG.tip=div("itip",host);IG.coord=div("icoord",host);IG.scale=div("iscale",host);IG.coord.textContent="— , —";
  bindIndo(host);
  if(window.ResizeObserver)new ResizeObserver(function(){ifit()}).observe(host);else window.addEventListener("resize",ifit);
  INDO=true;ifit();
}
function drawIndo(){
  IG.aura.innerHTML="";IG.mk.innerHTML="";
  if(AU&&(cur=="Semua"||cur=="Karhutla")){
    if(HOT.length)HOT.slice(0,3500).forEach(function(p){se("circle",{cx:imx(p[0]),cy:imy(p[1]),r:2.2,fill:"#ff4a14","fill-opacity":.5},IG.aura)});
    else HS.forEach(function(c){se("circle",{cx:imx(c[1]),cy:imy(c[2]),r:Math.max(10,(25000+1800*Math.sqrt(c[3]))/111320*IM.S*1.7),fill:"url(#ag)"},IG.aura)});
    EV.forEach(function(e){if(e.k=="Karhutla"&&vis(e))se("circle",{cx:imx(e.x),cy:imy(e.y),r:9,fill:"url(#ag)"},IG.aura)});
  }
  EV.filter(vis).sort(function(a,b){return(a.id==selId)-(b.id==selId)}).forEach(function(e){
    var s=e.k=="Gempa bumi"?(4.5+e.m*1.1)/10:.85,sel=e.id==selId,hot=e.k=="Cuaca ekstrem"||e.k=="Gunung api"||(e.k=="Gempa bumi"&&e.m>=5.5);
    var g=se("g",{"class":"imk"+(sel?" sel":""),"data-x":imx(e.x),"data-y":imy(e.y),"data-id":e.id,tabindex:0,role:"button","aria-label":e.k+" "+e.lb+" di "+e.w},IG.mk);
    if(hot)se("circle",{r:10*s*1.15,"class":"ip",fill:"none",stroke:e.c,"stroke-width":2},g);
    var h=se("g",{"class":"imh"},g);
    if(e.sh=="c")se("circle",{r:10*s,fill:e.c,"class":"ish"},h);else se("polygon",{points:ISH[e.sh],transform:"scale("+s+")",fill:e.c,"class":"ish"},h);
  });
  ivKids();
  if(NAVF){NAVF=false;ivFly(CT[0],CT[1],Z,900)}
}
function itipShow(g){
  var e=EV.filter(function(x){return x.id==g.getAttribute("data-id")})[0];if(!e)return;
  var r=g.getBoundingClientRect(),h=$("imap").getBoundingClientRect(),t=IG.tip;
  t.innerHTML="<b>"+esc(e.k)+"</b> · "+esc(e.lb)+"<br>"+esc(e.w)+"<br><span>"+esc(e.tt)+"</span>";
  t.style.left=(r.left+r.width/2-h.left)+"px";t.style.top=(r.top-h.top)+"px";t.classList.add("on");
}
function bindIndo(host){
  var ptr={},tapId=null,moved=0,vel={x:0,y:0},reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches;
  var mkOf=function(t){return t&&t.closest?t.closest(".imk"):null};
  host.addEventListener("pointerdown",function(e){
    if(e.button>0||LOCK)return;
    cancelAnimationFrame(IV.anim);cancelAnimationFrame(IV.glide);
    ptr[e.pointerId]={x:e.clientX,y:e.clientY};var m=mkOf(e.target);tapId=m?+m.getAttribute("data-id"):null;moved=0;host.classList.add("grab");IG.tip.classList.remove("on");
  });
  window.addEventListener("pointermove",function(e){
    var p=ptr[e.pointerId];
    if(!p){var r=host.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&IG.coord){var lo=iLon((e.clientX-r.left-IV.tx)/IV.k),la=iLat((e.clientY-r.top-IV.ty)/IV.k);IG.coord.textContent=Math.abs(la).toFixed(2)+"° "+(la<0?"LS":"LU")+" · "+lo.toFixed(2)+"° BT"}return}
    var ids=Object.keys(ptr),dx=e.clientX-p.x,dy=e.clientY-p.y;
    if(ids.length==2){var o=ptr[ids[0]==e.pointerId?ids[1]:ids[0]],d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y),r2=host.getBoundingClientRect();if(d0>0)ivZoomAt(d1/d0,(e.clientX+o.x)/2-r2.left,(e.clientY+o.y)/2-r2.top);moved=99}
    else{moved+=Math.abs(dx)+Math.abs(dy);if(moved>6){IV.tx+=dx;IV.ty+=dy;ivClamp();ivApply();vel.x=dx;vel.y=dy}}
    p.x=e.clientX;p.y=e.clientY;
  });
  var up=function(e){
    if(!ptr[e.pointerId])return;delete ptr[e.pointerId];
    if(Object.keys(ptr).length)return;
    host.classList.remove("grab");
    if(moved<=6&&tapId!=null&&e.type=="pointerup")pick(tapId);
    else if(moved>6&&!reduce&&Math.hypot(vel.x,vel.y)>3){var vx=vel.x,vy=vel.y;(function s(){vx*=.92;vy*=.92;if(Math.hypot(vx,vy)<.4)return;IV.tx+=vx;IV.ty+=vy;ivClamp();ivApply();IV.glide=requestAnimationFrame(s)})()}
  };
  window.addEventListener("pointerup",up);window.addEventListener("pointercancel",up);
  host.addEventListener("click",function(e){if(LOCK){var m=mkOf(e.target);if(m)pick(+m.getAttribute("data-id"))}});
  host.addEventListener("wheel",function(e){if(LOCK)return;e.preventDefault();var r=host.getBoundingClientRect();ivZoomAt(Math.exp(-e.deltaY*(e.deltaMode?.05:.0016)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
  host.addEventListener("dblclick",function(e){if(LOCK)return;var r=host.getBoundingClientRect();ivZoomAt(1.7,e.clientX-r.left,e.clientY-r.top)});
  host.addEventListener("mouseover",function(e){var m=mkOf(e.target);if(m&&!host.classList.contains("grab")&&!(window.matchMedia&&matchMedia("(pointer:coarse)").matches))itipShow(m)});
  host.addEventListener("mouseout",function(e){if(mkOf(e.target))IG.tip.classList.remove("on")});
  host.addEventListener("focusin",function(e){var m=mkOf(e.target);if(m)itipShow(m)});host.addEventListener("focusout",function(){IG.tip.classList.remove("on")});
  host.tabIndex=0;
  host.addEventListener("keydown",function(e){
    var m=mkOf(e.target);if(m&&(e.key=="Enter"||e.key==" ")){e.preventDefault();pick(+m.getAttribute("data-id"));return}
    var r=host.getBoundingClientRect(),st=80,k=e.key;
    if(k=="ArrowLeft")IV.tx+=st;else if(k=="ArrowRight")IV.tx-=st;else if(k=="ArrowUp")IV.ty+=st;else if(k=="ArrowDown")IV.ty-=st;
    else if(k=="+"||k=="=")ivZoomAt(1.4,r.width/2,r.height/2);else if(k=="-")ivZoomAt(1/1.4,r.width/2,r.height/2);else if(k=="0")setView(4.6,[118,-2]);else return;
    e.preventDefault();ivClamp();ivApply();
  });
}
