from flask import Flask
from flask_cors import CORS

from .config import Config
from .extensions import db, migrate


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)
    # Scope CORS to known web origins instead of a wildcard (security review SP-2).
    # The public read-only catalogue is fine cross-origin; the authenticated catalog
    # endpoint must not be wildcard. Extra origins via CORS_ORIGINS (comma-separated).
    import os

    default_origins = [
        "https://web-production-1340.up.railway.app",
        "http://localhost:5173",
    ]
    extra = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
    CORS(app, origins=default_origins + extra)

    from .api.health import bp as health_bp
    from .api.catalog import bp as catalog_bp
    from .api.satellites import bp as satellites_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(catalog_bp)
    app.register_blueprint(satellites_bp)

    # Import models so Alembic/Flask-Migrate can discover them.
    from . import models  # noqa: F401

    register_cli(app)

    return app


def register_cli(app: Flask) -> None:
    """Developer CLI commands (M0 spike helpers)."""

    @app.cli.command("init-db")
    def init_db() -> None:
        """Create tables directly (spike convenience; migrations own prod schema)."""
        db.create_all()
        print("tables created")

    @app.cli.command("ingest")
    def ingest() -> None:
        """Fetch TLEs from CelesTrak and upsert into the satellites table."""
        from .ingest.tle import run_ingest

        db.create_all()
        summary = run_ingest()
        print(summary)
