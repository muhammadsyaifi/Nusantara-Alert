"""Nusantara-Alert - backend FastAPI (data resmi: BMKG, MAGMA/BNPB berkas, NASA FIRMS).
Menjalankan: uvicorn main:app --reload --port 8000  (lalu buka http://localhost:8000)"""
import asyncio
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sources import bmkg, firms, manual

TTL = int(os.getenv("CACHE_TTL", "300"))
FIRMS_KEY = os.getenv("FIRMS_MAP_KEY", "")
FRONTEND = Path(__file__).resolve().parent.parent / "frontend"

app = FastAPI(title="Nusantara-Alert")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_cache: dict = {}


async def cached(key, builder):
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < TTL:
        return hit[1]
    val = await builder()
    _cache[key] = (time.time(), val)
    return val


async def build_events():
    async with httpx.AsyncClient(headers={"User-Agent": "Nusantara-Alert/1.0"}) as c:
        names = ["BMKG gempa", "BMKG peringatan cuaca", "BMKG kekeringan", "BMKG hujan tinggi"]
        res = await asyncio.gather(bmkg.gempa(c), bmkg.nowcast(c), bmkg.kekeringan(c), bmkg.hujan_tinggi(c), return_exceptions=True)
    quakes, now, dry, rain = [([] if isinstance(r, Exception) else r) for r in res]
    status = {n: {"ok": not isinstance(r, Exception), "count": 0 if isinstance(r, Exception) else len(r),
                  "error": str(r) if isinstance(r, Exception) else None} for n, r in zip(names, res)}
    vol, bn = manual.volcanoes(), manual.bnpb_events()
    status["MAGMA (berkas manual)"] = {"ok": True, "count": len(vol), "error": None}
    status["BNPB (berkas manual)"] = {"ok": True, "count": len(bn), "error": None}
    evs = now + vol + bn + quakes + dry + rain
    for i, e in enumerate(evs):
        e["id"] = i + 1
    return {"meta": {"generated_at": datetime.now(timezone.utc).isoformat(), "sources": status}, "events": evs}


async def build_hotspots():
    if not FIRMS_KEY:
        return {"points": [], "note": "FIRMS_MAP_KEY belum diisi"}
    async with httpx.AsyncClient() as c:
        return {"points": (await firms.hotspots(c, FIRMS_KEY))[:20000]}


@app.get("/api/health")
async def health():
    return {"ok": True, "firms": bool(FIRMS_KEY)}


@app.get("/api/events")
async def events():
    return await cached("events", build_events)


@app.get("/api/hotspots")
async def hotspots():
    try:
        return await cached("hotspots", build_hotspots)
    except Exception as ex:
        return {"points": [], "note": str(ex)}


if FRONTEND.exists():
    app.mount("/", StaticFiles(directory=FRONTEND, html=True), name="web")
