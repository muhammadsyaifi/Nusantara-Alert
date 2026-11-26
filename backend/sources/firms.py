"""Titik panas satelit asli dari NASA FIRMS (butuh MAP_KEY gratis: https://firms.modaps.eosdis.nasa.gov/api/)."""
import csv
import io

import httpx

AREA = "94,-11,141,6"  # barat,selatan,timur,utara: wilayah Indonesia


async def hotspots(client: httpx.AsyncClient, key: str, source: str = "VIIRS_SNPP_NRT", days: int = 1):
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/{source}/{AREA}/{days}"
    r = await client.get(url, timeout=60)
    r.raise_for_status()
    pts = []
    for row in csv.DictReader(io.StringIO(r.text)):
        try:
            conf = (row.get("confidence") or "n").strip().lower()[:1]
            pts.append([round(float(row["longitude"]), 3), round(float(row["latitude"]), 3),
                        round(float(row.get("frp") or 0), 1), conf if conf in "hnl" else "n"])
        except (KeyError, ValueError):
            continue
    return pts
