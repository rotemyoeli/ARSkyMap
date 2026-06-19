from datetime import datetime

from app.extensions import db


class CatalogItem(db.Model):
    """A user's saved/annotated object — the product wedge ("the moat lives here").

    Tap-to-save: tag + note + watch status, synced per user.
    """

    __tablename__ = "catalog_items"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), index=True, nullable=False)
    norad_id = db.Column(db.Integer, nullable=False, index=True)
    tag = db.Column(db.String(64))
    note = db.Column(db.Text)
    watch = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "norad_id": self.norad_id,
            "tag": self.tag,
            "note": self.note,
            "watch": self.watch,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
