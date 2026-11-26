"""Pembentuk objek kejadian. Bentuknya sama dengan yang dipakai frontend (frontend/js/data/snapshot.js)."""
from datetime import datetime

RC = {"Hijau": "#6b9a4a", "Kuning": "#e3b23c", "Oranye": "#e07b2e", "Merah": "#c0392b", "Abu-abu": "#8a8178"}
RN = {"Hijau": "Rendah", "Kuning": "Sedang", "Oranye": "Tinggi", "Merah": "Sangat tinggi",
      "Abu-abu": "Data belum cukup (bukan berarti aman)"}
LC = {"Waspada": "Kuning", "Siaga": "Oranye", "Awas": "Merah"}

# Perkiraan titik tengah provinsi (lon, lat). Hanya untuk penanda peta, bukan lokasi tepat.
PROV = {
 "Aceh": (96.8, 4.5), "Sumatera Utara": (99.0, 2.0), "Sumatera Barat": (100.5, -0.9), "Riau": (101.7, 0.5),
 "Jambi": (103.0, -1.6), "Sumatera Selatan": (104.0, -3.3), "Bengkulu": (102.3, -3.8), "Lampung": (105.2, -4.9),
 "Kepulauan Bangka Belitung": (106.4, -2.4), "Kep. Bangka Belitung": (106.4, -2.4), "Kepulauan Riau": (104.5, 0.9),
 "DKI Jakarta": (106.8, -6.2), "Jawa Barat": (107.6, -6.9), "Banten": (106.1, -6.4), "Jawa Tengah": (110.2, -7.2),
 "DI Yogyakarta": (110.4, -7.9), "Jawa Timur": (112.6, -7.6), "Bali": (115.1, -8.4),
 "Nusa Tenggara Barat": (117.4, -8.7), "Nusa Tenggara Timur": (121.0, -9.6),
 "Kalimantan Barat": (110.8, -0.3), "Kalimantan Tengah": (113.6, -2.0), "Kalimantan Selatan": (115.3, -3.0),
 "Kalimantan Timur": (116.4, 0.5), "Kalimantan Utara": (116.5, 3.0),
 "Sulawesi Utara": (124.8, 1.3), "Gorontalo": (122.4, 0.6), "Sulawesi Tengah": (121.0, -1.4),
 "Sulawesi Barat": (119.3, -2.5), "Sulawesi Selatan": (120.0, -4.0), "Sulawesi Tenggara": (122.1, -4.0),
 "Maluku": (129.5, -3.5), "Maluku Utara": (127.8, 0.9), "Papua Barat": (132.8, -1.4), "Papua Barat Daya": (131.3, -1.0),
 "Papua": (138.5, -4.5), "Papua Tengah": (136.5, -4.0), "Papua Pegunungan": (139.0, -4.2), "Papua Selatan": (139.5, -7.0),
}


def prov_xy(name: str):
    n = name.strip().lower()
    for k, v in PROV.items():
        if k.lower() == n:
            return v
    for k, v in PROV.items():
        if k.lower() in n or n in k.lower():
            return v
    return None


def risk_level(m: float) -> str:
    return "Hijau" if m < 4.5 else "Kuning" if m < 5.5 else "Oranye" if m < 6 else "Merah"


def quake(iso, lat, lon, m, dp, wilayah, felt="", tsunami=""):
    g = risk_level(m)
    return dict(k="Gempa bumi", d=iso, y=lat, x=lon, m=m, dp=dp, w=wilayah, f=felt, ts=tsunami, c=RC[g],
                lv=f"{g} · {RN[g]} (analisis internal)", lb=f"M {m}", sh="c", src="BMKG · Data Gempabumi Terbuka")


def nowcast(prov, lon, lat, periode, detail):
    return dict(k="Cuaca ekstrem", w=f"Provinsi {prov}", x=lon, y=lat, c="#3f8fd2", lv="Peringatan dini aktif",
                tt=periode, lb="Hujan lebat", sh="t", det=detail, src="BMKG · Peringatan Dini Cuaca")


def regional(kind, prov, level, detail, periode):
    sh, lb = ("s", f"Kering · {level}") if kind == "Kekeringan" else ("d", f"Hujan tinggi · {level}")
    xy = prov_xy(prov)
    if not xy:
        return None
    e = dict(k=kind, w=f"Provinsi {prov}", x=xy[0], y=xy[1], c=RC[LC[level]], lv=f"{level} (status BMKG)", tt=periode,
             lb=lb, sh=sh, det=detail,
             src="BMKG · Peringatan Dini " + ("Kekeringan Meteorologis" if kind == "Kekeringan" else "Curah Hujan Tinggi"))
    if kind == "Hujan tinggi":
        e["note"] = "Ini peringatan potensi curah hujan tinggi, bukan laporan kejadian banjir atau longsor."
    return e


def volcano(name, lon, lat, detail, tt="Laporan terbaru"):
    return dict(k="Gunung api", w=f"Gunung {name}", x=lon, y=lat, c=RC["Oranye"], lv="Level III (Siaga)",
                tt=tt, lb=f"{name} · Siaga", sh="t", det=detail,
                st="Laporan resmi PVMBG (MAGMA Indonesia)", pos="Koordinat puncak gunung (perkiraan)", gm=f"Gunung {name}",
                note="Hanya gunung berstatus Siaga yang tampil. Daftar lengkap ada di MAGMA Indonesia.",
                src="PVMBG · MAGMA Indonesia")


def bnpb(kind, wilayah, lon, lat, waktu, detail, gm):
    f = kind == "Karhutla"
    return dict(k=kind, w=wilayah, x=lon, y=lat, c="#e0541e" if f else "#1f9aa8", lv="Kejadian dilaporkan BNPB", tt=waktu,
                lb=kind, sh="f" if f else "p", det=detail, gm=gm, st="Laporan resmi BNPB",
                pos="Perkiraan titik kabupaten, bukan lokasi tepat",
                note="Dari ringkasan harian BNPB. Hanya kejadian yang dilaporkan BNPB, bukan seluruh kejadian di Indonesia.",
                src="BNPB · Perkembangan Situasi dan Penanganan Bencana di Tanah Air")
