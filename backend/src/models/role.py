# Common model imports
from src.api import db
from src.models.tables import Tables


# Roles assigned to an account. Current options are:
# 1) Customer
# 2) Admin
class Role(db.Model):
    __tablename__ = Tables.ROLE.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(2000))
    # ----------------End columns-------------------

    def __init__(self, title: str, description: str):
        self.title = title
        self.description = description

    @staticmethod
    def get_customer_role():
        return Role.query.filter_by(title='Customer').first()

    @staticmethod
    def get_admin_role():
        return Role.query.filter_by(title='Admin').first()

    def to_json(self):
        return {"title": self.title, "description": self.description}

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
