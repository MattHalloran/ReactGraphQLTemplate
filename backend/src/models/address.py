# Common model imports
from src.api import db
from src.models.tables import Tables


# One of the delivery addresses associated with a business
class Address(db.Model):
    __tablename__ = Tables.ADDRESS.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    # Optional tag associated with address (ex: 'Main address')
    tag = db.Column(db.String(100))
    # Optional name, sometimes required for internal mail delivery systems
    name = db.Column(db.String(100))
    # ISO 3166 country code
    country = db.Column(db.String(2), nullable=False, default='US')
    # State/Province/Region (ISO code when available [ex: NJ])
    administrative_area = db.Column(db.String(30), nullable=False)
    # County/District (currently unused)
    sub_administrative_area = db.Column(db.String(30))
    # City/Town
    locality = db.Column(db.String(50), nullable=False)
    # Postal/Zip code
    postal_code = db.Column(db.String(10), nullable=False)
    # Street Address
    throughfare = db.Column(db.String(150), nullable=False)
    # Apartment, Suite, P.O. box number, etc.
    premise = db.Column(db.String(20))
    # Any special delivery instructions the user would like to add
    delivery_instructions = db.Column(db.String(1000))
    # ----------------End columns-------------------

    def __init__(self,
                 tag: str,
                 name: str,
                 country: str,
                 administrative_area: str,
                 locality: str,
                 postal_code: str,
                 throughfare: str,
                 premise: str,
                 delivery_instructions: str):
        self.tag = tag
        self.name = name
        self.country = country
        self.administrative_area = administrative_area
        self.locality = locality
        self.postal_code = postal_code
        self.throughfare = throughfare
        self.premise = premise
        self.delivery_instructions = delivery_instructions

    def to_json(self):
        return {
            "tag": self.tag,
            "name": self.name,
            "country": self.country,
            "administrative_area": self.administrative_area,
            "sub_administrative_area": self.sub_administrative_area,
            "locality": self.locality,
            "postal_code": self.postal_code,
            "throughfare": self.throughfare,
            "premise": self.premise,
            "delivery_instructions": self.delivery_instructions
        }

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
