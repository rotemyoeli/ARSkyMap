"""TLE / element-set ingest from CelesTrak.

M0 feasibility spike: pull a small set of element sets from CelesTrak's public GP
endpoint, classify each object (payload / rocket body / debris), and upsert into the
`satellites` table. Later milestones add nightly scheduling and python-sgp4 pass
precompute for "overhead tonight" + watched-object alerts.

IMPORTANT (risk §13): read the Space-Track / CelesTrak redistribution terms before
mirroring at scale. We pull a bounded number of groups here for the spike only, and
we never serve silently-stale TLEs — every row carries `epoch` + `updated_at`.
"""

from datetime import datetime, timedelta

import requests

from app.extensions import db
from app.models.satellite import Satellite

# CelesTrak GP API, TLE (3-line) format. `stations` carries the ISS (ZARYA);
# `cosmos-2251-debris` is a well-known debris cloud for the debris lens.
CELESTRAK_GP = "https://celestrak.org/NORAD/elements/gp.php"
# Richer-but-bounded set for the debris lens + Starlink trains. One fetch per group per
# ingest run (respect CelesTrak rate guidance, BLK-004). Caps applied per group below.
DEFAULT_GROUPS = (
    "stations",            # ISS + crewed/station objects
    "active",              # active payloads (bright, recognisable)
    "starlink",            # Starlink (train detection, D5)
    "cosmos-2251-debris",  # debris clouds (sustainability lens, D3)
    "iridium-33-debris",
    "fengyun-1c-debris",
)
REQUEST_TIMEOUT = 30  # seconds
USER_AGENT = "ARSkyMap/0.1 (M0 spike; contact rotemyoeliai@gmail.com)"


def classify(name: str) -> str:
    """Best-effort object-type classification from the catalog name.

    CelesTrak names suffix debris with "DEB" and rocket bodies with "R/B".
    """
    upper = name.upper()
    if " DEB" in upper or upper.endswith("DEB"):
        return "DEBRIS"
    if "R/B" in upper:
        return "ROCKET BODY"
    return "PAYLOAD"


def parse_epoch(tle_line1: str) -> datetime | None:
    """Decode the epoch encoded in TLE line 1, columns 19-32 (YYDDD.DDDDDDDD)."""
    try:
        year2 = int(tle_line1[18:20])
        day_of_year = float(tle_line1[20:32])
    except (ValueError, IndexError):
        return None
    year = 2000 + year2 if year2 < 57 else 1900 + year2
    return datetime(year, 1, 1) + timedelta(days=day_of_year - 1)


def parse_tle_text(text: str):
    """Yield (norad_id, name, line1, line2) tuples from a 3-line TLE blob."""
    lines = [ln.rstrip() for ln in text.splitlines() if ln.strip()]
    for i in range(0, len(lines) - 2, 3):
        name, line1, line2 = lines[i], lines[i + 1], lines[i + 2]
        if not (line1.startswith("1 ") and line2.startswith("2 ")):
            continue
        try:
            norad_id = int(line1[2:7])
        except ValueError:
            continue
        yield norad_id, name.strip(), line1, line2


def fetch_group(group: str) -> str:
    resp = requests.get(
        CELESTRAK_GP,
        params={"GROUP": group, "FORMAT": "tle"},
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.text


def run_ingest(groups=DEFAULT_GROUPS, limit_per_group: int | None = 60) -> dict:
    """Fetch the given CelesTrak groups and upsert them into `satellites`.

    `limit_per_group` caps how many objects we keep per group (the spike only needs a
    handful; debris groups can be large). Returns a summary dict.
    """
    fetched = 0
    upserted = 0
    errors = []

    for group in groups:
        try:
            text = fetch_group(group)
        except requests.RequestException as exc:
            errors.append({"group": group, "error": str(exc)})
            continue

        count = 0
        for norad_id, name, line1, line2 in parse_tle_text(text):
            if limit_per_group is not None and count >= limit_per_group:
                break
            count += 1
            fetched += 1

            sat = db.session.get(Satellite, norad_id)
            if sat is None:
                sat = Satellite(norad_id=norad_id)
                db.session.add(sat)
            sat.name = name
            sat.object_type = classify(name)
            sat.tle_line1 = line1
            sat.tle_line2 = line2
            sat.epoch = parse_epoch(line1)
            upserted += 1

    db.session.commit()
    return {
        "groups": list(groups),
        "fetched": fetched,
        "upserted": upserted,
        "errors": errors,
        "ran_at": datetime.utcnow().isoformat() + "Z",
    }
