/* Pusat notifikasi: panel tetap terbuka sampai ditutup; status "sudah dibaca" disimpan di browser. */
var NF={open:false,tab:"all",read:{},seen:null,list:[]};
function nfKey(e){return e.k+"|"+e.w+"|"+e.tt}
function nfPr(e){return e.c==RC.Merah?3:(e.c==RC.Oranye||e.k=="Cuaca ekstrem")?2:0}
function nfBuild(){NF.list=EV.filter(function(e){return nfPr(e)>0}).sort(function(a,b){return nfPr(b)-nfPr(a)||((b.d&&a.d)?b.d-a.d:0)}).slice(0,60)}
function nfLoad(){try{NF.read=JSON.parse(localStorage.getItem("nread")||"{}")||{}}catch(e){NF.read={}}}
function nfSave(){try{var k={};NF.list.forEach(function(e){var x=nfKey(e);if(NF.read[x])k[x]=1});NF.read=k;localStorage.setItem("nread",JSON.stringify(k))}catch(e){}}
function nfUnread(){return NF.list.filter(function(e){return!NF.read[nfKey(e)]})}
function toast(msg,label,fn){
  var t=$("toast");if(!t){t=document.createElement("div");t.id="toast";t.className="toast";document.body.appendChild(t)}
  t.innerHTML="<span>"+esc(msg)+"</span>"+(label?"<button>"+label+"</button>":"");t.classList.add("on");
  if(label)t.querySelector("button").onclick=function(){t.classList.remove("on");fn()};
  clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("on")},7000);
}
function nfBadge(){
  nfBuild();var n=nfUnread().length,b=$("bn"),sb=$("sbn");
  if(b){b.textContent=n>99?"99+":n;b.hidden=n==0}
  if(sb){sb.textContent=n>99?"99+":n;sb.style.display=n==0?"none":"inline-block"}
  if($("bell"))$("bell").classList.toggle("has",n>0);
  if(NF.open)nfRender();
  var keys={};NF.list.forEach(function(e){keys[nfKey(e)]=1});
  if(NF.seen){var fresh=NF.list.filter(function(e){return!NF.seen[nfKey(e)]&&!NF.read[nfKey(e)]});if(fresh.length)toast(fresh.length+" peringatan baru: "+fresh[0].lb+" · "+fresh[0].w,"Lihat",function(){nfToggle(true)})}
  NF.seen=keys;
}
function nfRender(){
  var el=$("notif"),all=NF.list,un=nfUnread(),l=NF.tab=="un"?un:all;
  el.innerHTML='<div class="nf-h"><div><b>Notifikasi</b><span>'+(un.length?un.length+" belum dibaca":"Semua sudah dibaca")+'</span></div><button class="nf-a" id="nf-a"'+(un.length?"":" disabled")+'>Tandai semua dibaca</button><button class="x" id="nf-x" aria-label="Tutup">×</button></div>'+
  '<div class="nf-t"><button data-t="all" class="'+(NF.tab=="all"?"on":"")+'">Semua <i>'+all.length+'</i></button><button data-t="un" class="'+(NF.tab=="un"?"on":"")+'">Belum dibaca <i>'+un.length+"</i></button></div>"+
  '<div class="nf-l">'+(l.length?l.map(function(e,i){var u=!NF.read[nfKey(e)];return'<button class="nf-i'+(u?" un":"")+'" data-i="'+e.id+'" style="--i:'+Math.min(i,10)+'"><span class="dot" style="background:'+e.c+'"></span><div><b>'+esc(e.lb)+" · "+esc(e.w)+"</b><small>"+esc(e.k)+" · "+esc(e.tt)+"</small><em>"+esc(explainShort(e))+'</em></div><span class="tag" style="--c:'+e.c+'">'+esc(short(e))+"</span></button>"}).join(""):'<div class="nf-e"><span>🔔</span>'+(NF.tab=="un"?"Tidak ada notifikasi yang belum dibaca.":"Belum ada peringatan berstatus tinggi pada data saat ini.")+"</div>")+
  '</div><div class="nf-f">Menampilkan item berstatus merah/Awas, oranye/Siaga, dan peringatan cuaca aktif dari BMKG, PVMBG, dan BNPB. Ini bukan peringatan resmi; rujuk situs lembaga terkait.</div>';
  $("nf-x").onclick=function(){nfToggle(false)};
  $("nf-a").onclick=function(){NF.list.forEach(function(e){NF.read[nfKey(e)]=1});nfSave();nfBadge()};
  Array.prototype.forEach.call(el.querySelectorAll(".nf-t button"),function(b){b.onclick=function(){NF.tab=b.getAttribute("data-t");nfRender()}});
  Array.prototype.forEach.call(el.querySelectorAll(".nf-i"),function(b){b.onclick=function(){
    var id=+b.getAttribute("data-i"),e=byId(id);if(e){NF.read[nfKey(e)]=1;nfSave()}
    nfToggle(false);nfBadge();show("dash");pick(id)}});
}
function nfToggle(on){
  NF.open=on===undefined?!NF.open:on;$("notif").hidden=!NF.open;$("bell").setAttribute("aria-expanded",NF.open);
  if(NF.open){nfBuild();nfRender()}
}
function bindNotif(){
  nfLoad();
  $("bell").onclick=function(e){e.stopPropagation();nfToggle()};
  document.addEventListener("click",function(e){if(NF.open&&!$("notif").contains(e.target)&&!$("bell").contains(e.target))nfToggle(false)});
  document.addEventListener("keydown",function(e){if(e.key=="Escape"&&NF.open)nfToggle(false)});
}
