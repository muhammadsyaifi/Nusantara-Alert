"""Adapter data resmi BMKG: gempa bumi, peringatan dini cuaca (CAP), kekeringan, curah hujan tinggi.
CATATAN: parser memakai bentuk data yang terdokumentasi/teramati. Jika BMKG mengubah format, sesuaikan di sini."""
import asyncio
import re
import xml.etree.ElementTree as ET
from datetime import datetime

import httpx
from bs4 import BeautifulSoup

import events as E

TEWS = "https://data.bmkg.go.id/DataMKG/TEWS/"
NOWCAST_RSS = "https://www.bmkg.go.id/alerts/nowcast/id"
URL_DROUGHT = "https://www.bmkg.go.id/iklim/peringatan-dini-kekeringan-meteorologis"
URL_RAIN = "https://www.bmkg.go.id/iklim/peringatan-dini-hujan-tinggi"
ZONES = {7: "WIB", 8: "WITA", 9: "WIT"}


async def _get(client: httpx.AsyncClient, url: str) -> str:
    r = await client.get(url, timeout=25, follow_redirects=True)
    r.raise_for_status()
    return r.text


def _kids(el):
    return {c.tag.split("}")[-1]: (c.text or "").strip() for c in el}


def _parse_quakes(xml: str):
    out = []
    for g in ET.fromstring(xml).iter("gempa"):
        d = _kids(g)
        try:
            pt = g.find("point/coordinates")
            if pt is not None and pt.text:
                lat, lon = [float(v) for v in pt.text.split(",")[:2]]     # format BMKG: <point><coordinates>lat,lon</coordinates></point>
            elif d.get("Coordinates"):
                lat, lon = [float(v) for v in d["Coordinates"].split(",")[:2]]
            else:
                lat = float(d["Lintang"].split()[0]) * (-1 if "LS" in d["Lintang"] else 1)
                lon = float(d["Bujur"].split()[0])
            iso = d.get("DateTime") or ""
            if not iso:
                continue
            out.append(dict(iso=iso.replace("Z", "+00:00"), lat=lat, lon=lon, m=float(d["Magnitude"]),
                            dp=int(float(re.sub(r"[^0-9.]", "", d["Kedalaman"]) or 0)), w=d.get("Wilayah", ""),
                            felt=d.get("Dirasakan", ""), ts=d.get("Potensi", "")))
        except (KeyError, ValueError):
            continue
    return out


async def gempa(client):
    terkini, dirasakan = await asyncio.gather(_get(client, TEWS + "gempaterkini.xml"), _get(client, TEWS + "gempadirasakan.xml"))
    merged = {}
    for q in _parse_quakes(terkini) + _parse_quakes(dirasakan):
        cur = merged.setdefault(q["iso"], q)
        for k in ("felt", "ts"):
            cur[k] = cur[k] or q[k]
    items = sorted(merged.values(), key=lambda q: q["iso"], reverse=True)
    return [E.quake(q["iso"], q["lat"], q["lon"], q["m"], q["dp"], q["w"], q["felt"], q["ts"]) for q in items]


def _fmt_local(iso: str) -> str:
    try:
        d = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        off = int(d.utcoffset().total_seconds() // 3600) if d.utcoffset() else 7
        return d.strftime("%d %b %Y • %H.%M ") + ZONES.get(off, f"UTC{off:+d}")
    except ValueError:
        return iso


def _centroid(poly_text: str):
    pts = []
    for pair in poly_text.split():
        try:
            la, lo = pair.split(",")
            pts.append((float(lo), float(la)))
        except ValueError:
            pass
    return (sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)) if pts else None


async def nowcast(client):
    rss = ET.fromstring(await _get(client, NOWCAST_RSS))
    links = [(i.findtext("title") or "", i.findtext("link") or "") for i in rss.iter("item")]

    async def one(title, link):
        try:
            cap = ET.fromstring(await _get(client, link))
        except Exception:
            return None
        txt = lambda tag: next((e.text or "" for e in cap.iter() if e.tag.split("}")[-1] == tag), "")
        poly = txt("polygon")
        m = re.search(r"Cuaca\s+(.+)$", txt("headline") or title)
        prov = (m.group(1) if m else title).strip()
        xy = _centroid(poly) or E.prov_xy(prov)
        if not xy:
            return None
        periode = f"{_fmt_local(txt('effective'))} s/d {_fmt_local(txt('expires'))}"
        return E.nowcast(prov, xy[0], xy[1], periode, (txt("description") or txt("headline") or title)[:400])

    res = await asyncio.gather(*(one(t, l) for t, l in links[:40] if l))
    return [r for r in res if r]


def _parse_regional(html: str, kind: str):
    soup = BeautifulSoup(html, "html.parser")
    periode = next((h.get_text(" ", strip=True) for h in soup.find_all(["h1", "h2", "h3", "h4"]) if "asarian" in h.get_text()), "Dasarian terbaru")
    out = []
    table = soup.find("table")
    for tr in (table.find_all("tr") if table else []):
        td = [c.get_text(", ", strip=True) for c in tr.find_all(["td", "th"])]
        if len(td) < 5 or td[1].lower().startswith("provinsi"):
            continue
        prov = td[1]
        parts = {lvl: v for lvl, v in zip(("Waspada", "Siaga", "Awas"), td[2:5]) if v and v != "-"}
        if not parts:
            continue
        level = "Awas" if "Awas" in parts else "Siaga" if "Siaga" in parts else "Waspada"
        detail = ". ".join(f"{k}: {parts[k]}" for k in ("Awas", "Siaga", "Waspada") if k in parts) + "."
        e = E.regional(kind, prov, level, detail, periode)
        if e:
            out.append(e)
    return out


async def kekeringan(client):
    return _parse_regional(await _get(client, URL_DROUGHT), "Kekeringan")


async def hujan_tinggi(client):
    return _parse_regional(await _get(client, URL_RAIN), "Hujan tinggi")
