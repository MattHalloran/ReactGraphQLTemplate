# Common model imports
from src.api import db
from src.models.tables import Tables


# Allows users to give feedback about the website or business
class Feedback(db.Model):
    __tablename__ = Tables.FEEDBACK.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    context = db.Column(db.String(5000), nullable=False)
    contact_email = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    # ----------------End columns-------------------

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.context}')'"
