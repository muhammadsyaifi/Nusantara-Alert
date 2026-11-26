"""Adapter berkas JSON untuk sumber yang belum punya akses otomatis.
- data/volcano.json      : gunung api berstatus Siaga dari laporan MAGMA Indonesia (PVMBG)
- data/bnpb_events.json  : kejadian dari ringkasan harian BNPB
Perbarui berkas ini dari situs resminya (magma.esdm.go.id, bnpb.go.id) atau ganti dengan scraper/API resmi."""
import json
from pathlib import Path

import events as E

DATA = Path(__file__).resolve().parent.parent / "data"


def _load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def volcanoes():
    return [E.volcano(*row) for row in _load("volcano.json")]


def bnpb_events():
    return [E.bnpb(*row) for row in _load("bnpb_events.json")]
