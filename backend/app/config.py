import os

basedir = os.path.abspath(os.path.dirname(__file__))


def _db_uri() -> str:
    """Resolve the database URI.

    Railway injects DATABASE_URL. Locally, falls back to the docker-compose
    Postgres if reachable, otherwise a SQLite file so the app boots with zero setup.
    """
    url = os.environ.get("DATABASE_URL")
    if not url:
        return "sqlite:///" + os.path.join(basedir, "..", "dev.db")
    # SQLAlchemy needs the postgresql:// scheme; some providers hand out postgres://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


_DEV_MODE = os.environ.get("DEV_MODE", "false").lower() in ("1", "true", "yes")


def _secret_key() -> str:
    """No predictable default in production (security review SP-1)."""
    key = os.environ.get("SECRET_KEY")
    if key:
        return key
    if _DEV_MODE:
        return "dev-only-insecure-key"  # only when DEV_MODE is explicitly on
    raise RuntimeError("SECRET_KEY must be set when DEV_MODE is off (no insecure default in production)")


class Config:
    SECRET_KEY = _secret_key()
    SQLALCHEMY_DATABASE_URI = _db_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # DEV_MODE bypasses auth for pre-launch development. Never enable in production.
    DEV_MODE = _DEV_MODE
