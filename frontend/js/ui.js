/* Nusantara-Alert - UI Controller (Tema Terang Utama, Tema Gelap Switchable, Layout Sidebar + Map) */
var CHIP_DATA = [
  { id: "Semua", label: "Semua", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
  { id: "Gempa", label: "Gempa", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' },
  { id: "Gunung Api", label: "Gunung Api", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg>' },
  { id: "Cuaca", label: "Cuaca", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg>' },
  { id: "Karhutla", label: "Karhutla", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>' },
  { id: "Banjir", label: "Banjir", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M2 12c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7 0"></path><path d="M2 17c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7 0"></path></svg>' },
  { id: "Longsor", label: "Longsor", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="3 20 21 20 21 7 3 20"></polygon><circle cx="16" cy="11" r="1.5"></circle><circle cx="13" cy="14" r="1.5"></circle></svg>' }
];

var VIEWS = ["dash", "detail", "src", "about"];

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, function(c) {
    return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c];
  });
}

function byId(id) {
  return EV.filter(function(x) { return x.id == id; })[0];
}

function cnt(k) {
  return EV.filter(function(e) { return e.k == k; }).length;
}

function gmu(e, q) {
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.gm || (q ? e.y + "," + e.x : e.w + ", Indonesia"));
}

function short(e) {
  return String(e.lv || "").split(" (")[0].split(" · ")[0];
}

function show(v) {
  if (v === "map") {
    show("dash");
    var m = $("mbx");
    if (m) m.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  VIEWS.forEach(function(x) {
    var el = $("v-" + x);
    if (el) el.hidden = (x !== v);
  });

  Array.prototype.forEach.call(document.querySelectorAll("#sb-nav .sb-item"), function(b) {
    var t = b.getAttribute("data-v");
    b.classList.toggle("on", t === v || (v === "detail" && t === "dash"));
  });

  closeSidebar();
  if (v === "dash") mapResize();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleSidebar(open) {
  var sb = $("sidebar"), ov = $("sb-overlay");
  var isOpened = open === undefined ? !sb.classList.contains("open") : open;
  sb.classList.toggle("open", isOpened);
  if (ov) ov.classList.toggle("on", isOpened);
}

function closeSidebar() {
  toggleSidebar(false);
}

function countUp(el) {
  var to = +el.getAttribute("data-n"), t0 = null, d = 900;
  function f(t) {
    if (t0 === null) t0 = t;
    var p = Math.min(1, (t - t0) / d);
    el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString("id-ID");
    if (p < 1) requestAnimationFrame(f);
  }
  el.textContent = "0";
  requestAnimationFrame(f);
}

/* ---- 4 KARTU METRIK DI ATAS (SESUAI GAMBAR 2) ---- */
function drawStatsCards() {
  var total = EV.length;
  var volcano = cnt("Gunung api");
  var hot = HOT.length || (MODE === "live" ? 0 : 1842);
  var weather = cnt("Cuaca ekstrem");

  var setN = function(id, val) {
    var el = $(id);
    if (!el) return;
    el.setAttribute("data-n", val);
    countUp(el);
  };

  setN("val-total", total);
  setN("val-volcano", volcano);
  setN("val-hotspot", hot);
  setN("val-weather", weather);
}

/* ---- KARTU PERINGATAN PENTING DI KANAN PETA (KOTAK MERAH GAMBAR 2) ---- */
function drawPriorityAlert() {
  var red = EV.filter(function(e) { return e.c === RC.Merah || (e.k === "Gempa bumi" && e.m >= 5.5); })[0] || EV[0];
  if (!red) return;

  var titleEl = $("pab-title"), locEl = $("pab-loc"), timeEl = $("pab-time"), btnEl = $("pab-btn");
  if (titleEl) titleEl.textContent = red.k === "Gempa bumi" ? "Gempa Bumi M " + red.m.toFixed(1) : red.lb;
  if (locEl) locEl.textContent = (red.k === "Gempa bumi" ? "Pusat gempa: " : "") + red.w;
  if (timeEl) timeEl.textContent = "Waktu: " + red.tt;
  if (btnEl) btnEl.onclick = function() { openDetail(red.id); };
}

/* ---- PIL FILTER KATEGORI DI BILAH HEADER PETA (SESUAI GAMBAR 2) ---- */
function drawChips() {
  var c = $("chips");
  if (!c) return;
  c.innerHTML = CHIP_DATA.map(function(item) {
    var isSel = (item.id === cur) || (item.id === "Semua" && (!cur || cur === "Semua"));
    return '<button class="map-chip' + (isSel ? ' on' : '') + '" data-t="' + item.id + '">' +
      '<span class="mc-icon">' + item.svg + '</span> ' +
      '<span class="mc-name">' + item.label + '</span>' +
    '</button>';
  }).join("");

  Array.prototype.forEach.call(c.children, function(b) {
    b.onclick = function() {
      cur = b.getAttribute("data-t");
      refresh();
    };
  });
}

/* ---- DAFTAR KEJADIAN TERBARU DI SAMPING PETA (SESUAI GAMBAR 2) ---- */
function drawList() {
  var v = EV.filter(vis).slice(0, 5);
  var el = $("list");
  if (!el) return;

  el.innerHTML = v.length ? v.map(function(e) {
    return '<button class="rec-item" data-i="' + e.id + '">' +
      '<span class="rec-dot" style="background:' + e.c + '"></span>' +
      '<div class="rec-item-info">' +
        '<b>' + esc(e.k === "Gempa bumi" ? "Gempa Bumi — M " + e.m.toFixed(1) : e.lb) + '</b>' +
        '<small>' + esc(e.w) + ' • ' + esc(e.tt) + '</small>' +
      '</div>' +
      '<span class="rec-arrow">›</span>' +
    '</button>';
  }).join("") : '<p class="muted" style="padding:16px 0;text-align:center;">Tidak ada kejadian sesuai filter.</p>';

  Array.prototype.forEach.call(el.querySelectorAll(".rec-item"), function(b) {
    b.onclick = function() {
      openDetail(+b.getAttribute("data-i"));
    };
  });
}

/* ---- LEGENDA PETA OVERLAY DI SUDUT KANAN ATAS PETA (SESUAI GAMBAR 2) ---- */
function drawLegend() {
  var el = $("legend");
  if (!el) return;
  el.innerHTML =
    '<div class="leg-item"><span class="leg-badge leg-gempa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg></span> <span>Gempa Bumi</span></div>' +
    '<div class="leg-item"><span class="leg-badge leg-volcano"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"></path></svg></span> <span>Gunung Api</span></div>' +
    '<div class="leg-item"><span class="leg-badge leg-cuaca"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path></svg></span> <span>Cuaca Ekstrem</span></div>' +
    '<div class="leg-item"><span class="leg-badge leg-karhutla"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg></span> <span>Karhutla</span></div>' +
    '<div class="leg-item"><span class="leg-badge leg-banjir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7 0"></path><path d="M2 17c2.5-2.5 5-2.5 7.5 0s5 2.5 7.5 0 5-2.5 7 0"></path></svg></span> <span>Banjir</span></div>' +
    '<div class="leg-item"><span class="leg-badge leg-longsor"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="3 20 21 20 21 7 3 20"></polygon><circle cx="16" cy="11" r="1.5"></circle><circle cx="13" cy="14" r="1.5"></circle></svg></span> <span>Longsor</span></div>';
}

function refresh() {
  drawChips();
  drawMap();
  drawList();
  drawPriorityAlert();
  drawLegend();
}

/* ---- GAUGE & RING GRAPHICS UNTUK FLOATING CARD ---- */
function arc(p, r, cx, cy) {
  var t = Math.PI + Math.PI * Math.max(.001, Math.min(1, p));
  return "M" + (cx - r) + " " + cy + " A" + r + " " + r + " 0 0 1 " + (cx + r * Math.cos(t)).toFixed(1) + " " + (cy + r * Math.sin(t)).toFixed(1);
}
function gauge(p, col, txt) {
  var L = Math.PI * 46 * Math.max(.02, Math.min(1, p));
  return '<svg viewBox="0 0 120 76"><path class="g-track" d="' + arc(1, 46, 60, 60) + '" stroke-width="9" fill="none" stroke-linecap="round"/><path class="garc" d="' + arc(p, 46, 60, 60) + '" stroke="' + col + '" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="' + L.toFixed(1) + ' 300"/><text class="g-txt" x="60" y="58" text-anchor="middle" font-size="' + (String(txt).length > 6 ? 12 : 17) + '" font-weight="700">' + esc(txt) + '</text></svg>';
}
function ring(p, col, txt, sub) {
  var r = 30, c = 2 * Math.PI * r;
  return '<svg viewBox="0 0 120 76"><g transform="translate(60 38) rotate(-90)"><circle class="g-track" r="' + r + '" fill="none" stroke-width="8"/><circle class="rarc" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + c * p + " " + c + '"/></g><text class="g-txt" x="60" y="' + (sub ? 37 : 42) + '" text-anchor="middle" font-size="' + (String(txt).length > 7 ? 9 : 13) + '" font-weight="700">' + esc(txt) + '</text>' + (sub ? '<text class="g-sub" x="60" y="49" text-anchor="middle" font-size="9">' + esc(sub) + '</text>' : '') + '</svg>';
}
function levelP(e) {
  if (e.k === "Gempa bumi") return Math.min(1, e.m / 8);
  var s = e.lv || "";
  return /Awas/.test(s) ? 1 : /Siaga|Level III/.test(s) ? .67 : /Waspada/.test(s) ? .34 : .5;
}
function bearing(e) {
  return (Math.atan2(e.x - 118, e.y + 2) * 180 / Math.PI + 360) % 360;
}
function drawCompass(e) {
  var b = e ? bearing(e) : 0;
  var cp = $("compass");
  if (!cp) return;
  cp.innerHTML = '<svg viewBox="0 0 100 100"><circle class="cp-bg" cx="50" cy="50" r="47"/><circle class="cp-dash" cx="50" cy="50" r="37"/><text class="cp-t" x="50" y="15" text-anchor="middle" font-size="9">U</text><text class="cp-t" x="50" y="92" text-anchor="middle" font-size="9">S</text><text class="cp-t" x="9" y="53" text-anchor="middle" font-size="9">B</text><text class="cp-t" x="91" y="53" text-anchor="middle" font-size="9">T</text><g class="cp-n" style="transform:rotate(' + b + 'deg)"><path d="M50 20 L56 50 L50 46 L44 50Z" fill="#ef4444"/><path d="M50 80 L56 50 L50 54 L44 50Z" fill="#94a3b8"/></g><circle class="cp-hub" cx="50" cy="50" r="4"/></svg>';
}

/* ---- KARTU MELAYANG DI ATAS PETA (FLOATING CARD) ---- */
function card(e) {
  var q = e.k === "Gempa bumi", p = levelP(e), f = $("fc");
  if (!f) return;
  f.hidden = false;
  f.innerHTML =
    '<div class="fh">' +
      '<div>' +
        '<b>' + esc(q ? "Gempa M " + e.m.toFixed(1) : e.lb) + '</b> ' +
        '<span class="tag" style="--c:' + e.c + '">' + esc(short(e)) + '</span>' +
        '<small>' + esc(e.k) + ' · ' + esc(e.src) + '</small>' +
      '</div>' +
      '<button class="x" id="fx" aria-label="Tutup">×</button>' +
    '</div>' +
    '<div class="route"><span>' + esc(e.w) + '</span><em>' + esc(e.tt) + '</em></div>' +
    '<div class="pbar"><i style="width:' + (p * 100) + '%;background:' + e.c + '"></i></div>' +
    '<p class="fx">' + esc(explainShort(e)) + '</p>' +
    '<div class="g2">' +
      '<div class="gc"><small>' + (q ? "Magnitudo" : "Tingkat") + '</small>' + gauge(p, e.c, q ? e.m.toFixed(1) : short(e)) + '</div>' +
      '<div class="gc"><small>' + (q ? "Kedalaman" : "Jenis") + '</small>' + ring(q ? Math.min(1, e.dp / 300) : 1, e.c, q ? e.dp + " km" : e.k, q ? dep(e.dp) : "") + '</div>' +
    '</div>' +
    '<div class="warnb">⚠ ' + esc(q ? (e.ts || "Informasi tsunami tidak tercantum") : (e.note || e.pos || e.det || "")) + '</div>' +
    '<div class="fa">' +
      '<button class="btn green" id="fd">Lihat Detail Lengkap</button>' +
      '<a class="btn" target="_blank" rel="noopener" href="' + gmu(e, q) + '">Google Maps</a>' +
    '</div>';

  $("fx").onclick = closeCard;
  $("fd").onclick = function() { openDetail(e.id); };
}

function closeCard() {
  selId = null;
  if ($("fc")) $("fc").hidden = true;
  drawCompass(null);
  drawMap();
}

function pick(id) {
  var e = byId(id);
  if (!e) return;
  selId = id;
  CT = [e.x, e.y];
  Z = Math.max(Z, LM || GM ? 5.5 : 8);
  NAVF = true;
  drawMap();
  card(e);
  drawCompass(e);
}

/* ========================================================
   HALAMAN DETAIL LENGKAP (BAGUSIN & SANGAT LENGKAP)
   ======================================================== */
function dist(a, b) {
  var dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function openDetail(id) {
  var e = byId(id);
  if (!e) return;
  selId = id;

  var q = e.k === "Gempa bumi";
  var big = q ? "M " + e.m.toFixed(1) : short(e);

  var cells = q ? [
    ["Magnitudo", e.m.toFixed(1) + " SR", "Kekuatan guncangan seismik"],
    ["Kedalaman", e.dp + " km (" + dep(e.dp) + ")", "Jarak hiposentrum dari permukaan"],
    ["Titik Koordinat", fmt(e.y) + (e.y < 0 ? " LS" : " LU") + ", " + fmt(e.x) + " BT", "Lokasi episentrum"],
    ["Waktu Kejadian", e.tt, "Waktu tercatat BMKG"],
    ["Wilayah Dirasakan", e.f || "Tidak tercantum dalam laporan awal", "Skala MMI pelaporan warga"],
    ["Potensi Tsunami", e.ts || "Tidak tercantum", "Keterangan resmi BMKG/InaTEWS"]
  ] : [
    ["Jenis Kejadian", e.k, "Kategori kebencanaan"],
    ["Tingkat Status", e.lv, "Klasifikasi bahaya resmi"],
    ["Periode Waktu", e.tt, "Waktu pelaporan/berlaku"],
    ["Perkiraan Posisi", e.pos || "Perkiraan tengah kabupaten/provinsi", "Koordinat indikatif"],
    ["Rincian Peristiwa", e.det || "-", "Laporan situasi lapangan"],
    ["Status Validasi", e.st || "Data Resmi Pemerintah", "Terverifikasi institusi"]
  ];

  var rel = EV.filter(function(x) {
    return x.id !== id && (x.k === e.k || dist(x, e) < 6);
  }).sort(function(a, b) {
    return dist(a, e) - dist(b, e);
  }).slice(0, 5);

  var dview = $("dview");
  if (!dview) return;

  dview.innerHTML =
    '<div class="detail-container">' +
      '<!-- Breadcrumb Bar -->' +
      '<div class="detail-nav-bar">' +
        '<button class="back-pill-btn" id="d-back">← Kembali ke Beranda</button>' +
        '<div class="detail-breadcrumb">' +
          '<span data-g="dash" style="cursor:pointer">Beranda</span> › ' +
          '<span>' + esc(e.k) + '</span> › ' +
          '<b>' + esc(q ? "Gempa M " + e.m.toFixed(1) + " " + e.w : e.lb) + '</b>' +
        '</div>' +
      '</div>' +

      '<!-- Header Detail -->' +
      '<div class="detail-header-card">' +
        '<div class="dh-left">' +
          '<div class="dh-tag-row">' +
            '<span class="detail-badge" style="background:' + e.c + '22; color:' + e.c + '; border-color:' + e.c + '44">' +
              (q ? "🔴 Gempa Bumi Terbuka" : "⚠️ " + esc(e.k)) +
            '</span>' +
            '<span class="tag" style="--c:' + e.c + '">' + esc(short(e)) + '</span>' +
          '</div>' +
          '<h1 class="dh-title">' + esc(q ? "Gempa Bumi M " + e.m.toFixed(1) + " · " + e.w : e.lb) + '</h1>' +
          '<p class="dh-sub">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-ic"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>' +
            esc(e.w) +
            ' <span class="dh-sep">•</span> ' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mini-ic"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' +
            esc(e.tt) +
          '</p>' +
        '</div>' +
        '<div class="dh-actions">' +
          '<button class="btn green" id="d-map">🔍 Fokus di Peta</button>' +
          '<button class="btn" id="d-share">📤 Bagikan</button>' +
          '<a class="btn" target="_blank" rel="noopener" href="' + gmu(e, q) + '">🗺️ Google Maps ↗</a>' +
        '</div>' +
      '</div>' +

      '<!-- Grid Parameter & Visual Stage -->' +
      '<div class="detail-grid-layout">' +
        '<div class="dg-main-col">' +
          '<!-- Stage 3D Visualisasi Episenter -->' +
          '<div class="card detail-visual-card">' +
            '<div class="dvc-head">' +
              '<h3>Simulasi Visual & Parameter Fisik</h3>' +
              '<small>' + (q ? fmt(e.y) + (e.y < 0 ? " LS" : " LU") + ", " + fmt(e.x) + " BT" : esc(e.pos || "")) + '</small>' +
            '</div>' +
            '<div class="stage" style="--c:' + e.c + '">' +
              '<div class="floor"></div>' +
              '<i class="ring"></i><i class="ring r2"></i><i class="ring r3"></i>' +
              '<div class="pin"><b>' + esc(big) + '</b><small>' + esc(e.k) + '</small></div>' +
            '</div>' +
            '<div class="param-cards-grid">' +
              cells.map(function(c) {
                return '<div class="param-card">' +
                  '<span class="pc-lbl">' + c[0] + '</span>' +
                  '<b class="pc-val">' + esc(c[1]) + '</b>' +
                  '<small class="pc-desc">' + esc(c[2]) + '</small>' +
                '</div>';
              }).join("") +
            '</div>' +
          '</div>' +

          '<!-- Penjelasan Komprehensif (4 Card Lengkap) -->' +
          explainHTML(e) +
        '</div>' +

        '<aside class="dg-side-col">' +
          '<!-- Kartu Validasi Sumber Resmi -->' +
          '<div class="card source-badge-card">' +
            '<div class="sbc-header">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' +
              '<h4>Terverifikasi Lembaga Resmi</h4>' +
            '</div>' +
            '<p class="sbc-text">Data ini dihimpun langsung melalui jaringan pemantauan resmi pemerintah tanpa modifikasi parameter fisis.</p>' +
            '<div class="sbc-meta-row">' +
              '<span>Lembaga:</span> <b>' + esc(e.src) + '</b>' +
            '</div>' +
            '<div class="sbc-meta-row">' +
              '<span>Status:</span> <b class="text-green">' + esc(e.st || "Data Resmi Terbuka") + '</b>' +
            '</div>' +
            '<div class="warn-bubble">⚠ ' + esc(q ? (e.ts || "Informasi potensi tsunami tidak tercantum") : (e.note || e.pos || "")) + '</div>' +
          '</div>' +

          '<!-- Nomor Darurat Cepat -->' +
          '<div class="card emergency-hotlines-card">' +
            '<h4>🚨 Kontak Tanggap Darurat</h4>' +
            '<p class="muted sm">Gunakan saluran resmi berikut jika berada di dekat lokasi kejadian atau memerlukan bantuan penyelamatan:</p>' +
            '<div class="hotline-badges">' +
              '<a href="tel:112" class="hl-badge"><span class="hl-num">112</span><div><b>Layanan Darurat</b><small>Bebas pulsa nasional</small></div></a>' +
              '<a href="tel:115" class="hl-badge"><span class="hl-num">115</span><div><b>Basarnas</b><small>Pencarian & Pertolongan</small></div></a>' +
              '<a href="tel:117" class="hl-badge"><span class="hl-num">117</span><div><b>BNPB</b><small>Posko Bencana</small></div></a>' +
              '<a href="tel:119" class="hl-badge"><span class="hl-num">119</span><div><b>Kemenkes</b><small>Ambulans & Medis</small></div></a>' +
            '</div>' +
          '</div>' +

          '<!-- Kejadian Terkait / Sekitar -->' +
          '<div class="card related-events-card">' +
            '<h4>Kejadian Terkait Sekitar (' + rel.length + ')</h4>' +
            (rel.length ? rel.map(function(r) {
              return '<button class="rel-btn" data-i="' + r.id + '">' +
                '<span class="rel-dot" style="background:' + r.c + '"></span>' +
                '<div class="rel-text">' +
                  '<b>' + esc(r.lb) + '</b>' +
                  '<small>' + esc(r.w) + '</small>' +
                '</div>' +
                '<span class="tag" style="--c:' + r.c + '">' + esc(short(r)) + '</span>' +
              '</button>';
            }).join("") : '<p class="muted sm">Tidak ada kejadian lain dalam radius terdekat.</p>') +
          '</div>' +
        '</aside>' +
      '</div>' +
    '</div>';

  show("detail");

  var d = $("dview");
  if ($("d-back")) $("d-back").onclick = function() { show("dash"); };
  if (d.querySelector("[data-g]")) d.querySelector("[data-g]").onclick = function() { show("dash"); };
  if ($("d-map")) $("d-map").onclick = function() { show("dash"); pick(id); };
  if ($("d-share")) {
    $("d-share").onclick = function() {
      var shareText = (q ? "Gempa M " + e.m.toFixed(1) + " di " + e.w : e.lb + " di " + e.w) + " (" + e.tt + "). Pantau di Nusantara-Alert: " + window.location.href;
      if (navigator.share) {
        navigator.share({
          title: "Nusantara-Alert: " + (q ? "Gempa Bumi M " + e.m.toFixed(1) : e.lb),
          text: shareText,
          url: window.location.href
        }).catch(function() {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(function() {
          alert("Informasi berhasil disalin ke papan klip!");
        }).catch(function() {
          prompt("Salin informasi ini:", shareText);
        });
      } else {
        prompt("Salin informasi ini:", shareText);
      }
    };
  }

  Array.prototype.forEach.call(d.querySelectorAll(".rel-btn"), function(b) {
    b.onclick = function() { openDetail(+b.getAttribute("data-i")); };
  });
}

/* ---- SUMBER DATA VIEW ---- */
function drawSrc() {
  var sEl = $("src");
  if (!sEl) return;
  sEl.innerHTML = SRC.map(function(s) {
    var k = s[2] === 1 ? "ok" : s[2] === 2 ? "pt" : "no";
    return '<div class="sc2">' +
      '<h4>' + s[0] + '</h4>' +
      '<p>' + s[1] + '</p>' +
      '<p class="' + k + '">' + (s[2] === 1 ? "✔ Tersambung Normal" : s[2] === 2 ? "◐ Tersambung Sebagian" : "✖ Belum Tersambung") + '</p>' +
      '<p>' + s[3] + '</p>' +
      '<a href="' + s[4] + '" target="_blank" rel="noopener">Buka Portal Resmi ↗</a>' +
    '</div>';
  }).join("");
}

function setDate() {
  var now = new Date();
  var str = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
    " • " + now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(".", ":") + " WIB";
  var el = $("live-time");
  if (el) el.textContent = str;
}

/* ---- SISTEM TEMA GELAP & TERANG (TERANG UTAMA SEPERTI GAMBAR 2) ---- */
function setTheme(t) {
  var r = document.documentElement;
  r.classList.add("themeanim");
  r.setAttribute("data-theme", t);
  THEME = t;
  try { localStorage.setItem("na_theme", t); } catch (e) {}

  var mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.setAttribute("content", t === "dark" ? "#090e17" : "#f4f7f6");

  if (LM) setTiles();
  if (GM) GM.setOptions({ styles: t === "dark" ? GSTYLE : [] });

  drawMap();
  var e = selId ? byId(selId) : null;
  if (e && $("fc") && !$("fc").hidden) {
    card(e);
    drawCompass(e);
  } else {
    drawCompass(null);
  }
  setTimeout(function() { r.classList.remove("themeanim"); }, 500);
}

/* ---- BINDINGS & EVENT LISTENERS ---- */
function wire() {
  // Sidebar navigation — semua tombol hanya navigasi view biasa
  Array.prototype.forEach.call(document.querySelectorAll("#sb-nav .sb-item"), function(b) {
    b.onclick = function() {
      show(b.getAttribute("data-v"));
    };
  });

  // Mobile drawer toggle
  var toggleBtn = $("sb-toggle"), overlay = $("sb-overlay");
  if (toggleBtn) toggleBtn.onclick = function() { toggleSidebar(); };
  if (overlay) overlay.onclick = function() { closeSidebar(); };

  // Bottom sources card link
  var ssbLink = $("ssb-detail-link");
  if (ssbLink) ssbLink.onclick = function() { show("src"); };

  // Recent events more link
  var recMore = $("rec-more-btn");
  if (recMore) recMore.onclick = function() { show("map"); };

  // Map controls
  if ($("zi")) $("zi").onclick = function() { setView(Z * 1.6); };
  if ($("zo")) $("zo").onclick = function() { setView(Z / 1.6); };
  if ($("zid")) $("zid").onclick = function() { setView(4.6, [118, -2]); };
  if ($("zb")) $("zb").onclick = function() { setFS(!isFS()); };
  if ($("zl")) $("zl").onclick = function() {
    LOCK = !LOCK;
    $("mbx").classList.toggle("lock", LOCK);
    this.textContent = LOCK ? "🔒" : "✋";
    this.setAttribute("aria-pressed", LOCK);
    drawMap();
  };

  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      if (isFS()) setFS(false);
      if (NF.open) nfToggle(false);
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      var c = $("cari");
      if (c) c.focus();
    }
  });

  document.addEventListener("fullscreenchange", function() {
    if (!document.fullscreenElement && isFS()) setFS(false);
  });

  var searchInput = $("cari");
  if (searchInput) {
    searchInput.oninput = function() {
      qs = this.value.trim().toLowerCase();
      show("dash");
      refresh();
    };
  }

  // Keyboard hint detection
  if (/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent || "")) {
    var kbd = document.querySelector(".kbd-badge");
    if (kbd) kbd.textContent = "⌘K";
  }

  // Theme switch button
  if ($("th")) {
    $("th").onclick = function() {
      setTheme(THEME === "dark" ? "light" : "dark");
    };
  }

  window.addEventListener("resize", function() { mapResize(); });
  window.addEventListener("orientationchange", function() {
    setTimeout(mapResize, 200);
  });

  drawCompass(null);
  drawLegend();
}

function isFS() {
  return $("mbx") && $("mbx").classList.contains("fs");
}

function setFS(on) {
  var m = $("mbx");
  if (!m) return;
  m.classList.toggle("fs", on);
  document.body.classList.toggle("nofs-scroll", on);

  var zb = $("zb");
  if (zb) {
    zb.innerHTML = on ?
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>' :
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>';
    zb.setAttribute("aria-label", on ? "Keluar layar penuh" : "Layar penuh");
  }

  try {
    if (on && m.requestFullscreen) m.requestFullscreen().catch(function() {});
    else if (!on && document.fullscreenElement) document.exitFullscreen().catch(function() {});
  } catch (e) {}

  mapResize();
}

function drawHero() {
  drawStatsCards();
  drawPriorityAlert();
}

function drawTicker() {}
function drawKpi() {}
function drawHS() {}
function navPill() {}
function stag() {}