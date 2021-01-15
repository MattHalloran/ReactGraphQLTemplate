# Common model imports
from src.api import db
from src.models.tables import Tables


# Stores information related to an email address
class Email(db.Model):
    __tablename__ = Tables.PHONE.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    email_address = db.Column(db.String(100), nullable=False, unique=True)
    receives_delivery_updates = db.Column(db.Boolean, default=True)
    # ----------------End columns-------------------

    def __init__(self, email_address: str, receives_delivery_updates: bool):
        self.email_address = email_address
        self.receives_delivery_updates = receives_delivery_updates

    def to_json(self):
        return {
            "email_address": self.email_address,
            "receives_delivery_updates": self.receives_delivery_updates,
        }

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
