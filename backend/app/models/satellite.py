from datetime import datetime

from app.extensions import db


class Satellite(db.Model):
    """A tracked orbital object: payload, rocket body, or debris.

    Populated by the nightly TLE ingest (CelesTrak / Space-Track, terms-compliant).
    """

    __tablename__ = "satellites"

    norad_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    # PAYLOAD | ROCKET BODY | DEBRIS | UNKNOWN  -> drives the debris/sustainability lens
    object_type = db.Column(db.String(32), default="UNKNOWN", index=True)
    tle_line1 = db.Column(db.Text)
    tle_line2 = db.Column(db.Text)
    epoch = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "norad_id": self.norad_id,
            "name": self.name,
            "object_type": self.object_type,
            "epoch": self.epoch.isoformat() if self.epoch else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
