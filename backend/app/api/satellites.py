"""Public read API for tracked objects (TLEs) consumed by the AR client.

Honesty rule (HANDOFF): never serve silently-stale TLEs. Each object carries its
`epoch` and `updated_at`, and the envelope exposes the freshest `updated_at` so the
client can render a "last updated" badge.
"""

from flask import Blueprint, jsonify, request

from app.models.satellite import Satellite

bp = Blueprint("satellites", __name__, url_prefix="/api/satellites")

MAX_LIMIT = 500


@bp.get("")
def list_satellites():
    """List tracked objects with their TLEs.

    Query params:
      type  — optional filter: PAYLOAD | ROCKET BODY | DEBRIS | UNKNOWN
      limit — optional cap (default 100, max 500)
    """
    obj_type = request.args.get("type")
    try:
        limit = min(int(request.args.get("limit", 100)), MAX_LIMIT)
    except ValueError:
        limit = 100

    q = Satellite.query
    if obj_type:
        q = q.filter(Satellite.object_type == obj_type.upper())
    rows = q.order_by(Satellite.norad_id).limit(limit).all()

    items = [
        {
            **sat.to_dict(),
            "tle_line1": sat.tle_line1,
            "tle_line2": sat.tle_line2,
        }
        for sat in rows
    ]
    last_updated = max(
        (sat.updated_at for sat in rows if sat.updated_at), default=None
    )

    return jsonify(
        count=len(items),
        last_updated=last_updated.isoformat() if last_updated else None,
        items=items,
    )
