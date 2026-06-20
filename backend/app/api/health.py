from flask import Blueprint, jsonify

bp = Blueprint("health", __name__, url_prefix="/api")


@bp.get("/health")
def health():
    # Public liveness only. Do NOT expose DEV_MODE / auth-bypass state to unauthenticated
    # callers (security review SP-1, information disclosure).
    return jsonify(status="ok", service="arskymap-backend")
