# Common model imports
from src.api import db
from src.models.tables import Tables
# Model-specific imports
import time


# For storing current and old contact info states
class ContactInfo(db.Model):
    __tablename__ = Tables.CONTACT_INFO.value
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    time_set = db.Column(db.Float, nullable=False, default=time.time())  # In UTC seconds
    monday = db.Column(db.String(200), nullable=False)
    tuesday = db.Column(db.String(200), nullable=False)
    wednesday = db.Column(db.String(200), nullable=False)
    thursday = db.Column(db.String(200), nullable=False)
    friday = db.Column(db.String(200), nullable=False)
    saturday = db.Column(db.String(200), nullable=False)
    sunday = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}')"
