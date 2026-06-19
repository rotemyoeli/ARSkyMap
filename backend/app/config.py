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


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    SQLALCHEMY_DATABASE_URI = _db_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # DEV_MODE bypasses auth for pre-launch development. Never enable in production.
    DEV_MODE = os.environ.get("DEV_MODE", "false").lower() in ("1", "true", "yes")
