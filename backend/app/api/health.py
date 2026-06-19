from flask import Blueprint, current_app, jsonify

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    return jsonify(
        status="ok",
        service="arskymap-backend",
        dev_mode=current_app.config.get("DEV_MODE", False),
    )
