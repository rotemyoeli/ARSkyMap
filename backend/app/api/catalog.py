from flask import Blueprint, current_app, jsonify

bp = Blueprint("catalog", __name__, url_prefix="/api/catalog")


def current_user():
    """Resolve the request's user.

    When DEV_MODE is on, auth is bypassed with a stub user so the wedge
    (save/annotate/watch) can be built before real auth lands. Returns None
    when unauthenticated in production.
    """
    if current_app.config.get("DEV_MODE"):
        return {"id": "dev-user", "dev": True}
    # TODO(M2): real auth (token/session) here.
    return None


@bp.get("")
def list_items():
    user = current_user()
    if user is None:
        return jsonify(error="unauthorized"), 401
    # TODO(M2): query CatalogItem for this user.
    return jsonify(user=user, items=[])
