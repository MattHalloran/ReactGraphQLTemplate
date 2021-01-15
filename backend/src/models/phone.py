# Common model imports
from src.api import db
from src.models.tables import Tables


# Stores information related to a phone number
class Phone(db.Model):
    __tablename__ = Tables.PHONE.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    # ex: could be (555) 867-5309, 555-867-5309, 5558675309, etc. DOES NOT INCLUDE COUNTRY CODE
    unformatted_number = db.Column(db.String(50), nullable=False, unique=True)
    country_code = db.Column(db.String(10), default='+1')
    carrier = db.Column(db.String(50))  # Currently unused
    is_mobile = db.Column(db.Boolean, default=True)
    receives_delivery_updates = db.Column(db.Boolean, default=True)
    # ----------------End columns-------------------

    def __init__(self, number: str, is_mobile: bool, receives_delivery_updates: bool):
        self.unformatted_number = number
        self.is_mobile = is_mobile
        self.receives_delivery_updates = receives_delivery_updates

    def to_json(self):
        return {
            "number": self.number,
            "country_code": self.country_code,
            "is_mobile": self.is_mobile,
            "receives_delivery_updates": self.receives_delivery_updates,
        }

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
