# Common model imports
from src.api import db
from src.models.tables import Tables
# Relationship dependencies
from src.models.discount import Discount
from src.models.image import Image
# Join table dependencies
from src.models.joinTables import itemDiscounts
from src.models.joinTables import plantSizes


class Size(db.Model):
    __tablename__ = Tables.SIZE.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    size = db.Column(db.String(25), nullable=False, unique=True)
    # ----------------End columns-------------------

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.size}')"


class Plant(db.Model):
    __tablename__ = Tables.PLANT.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    latin_name = db.Column(db.String(50), unique=True, nullable=False)
    common_name = db.Column(db.String(50))
    fragrant = db.Column(db.String(20))
    zone = db.Column(db.String(20))
    width = db.Column(db.String(20))
    height = db.Column(db.String(20))
    deer_resistant = db.Column(db.String(20))
    growth_rate = db.Column(db.Integer)
    attract = db.Column(db.String(20))
    bark_type = db.Column(db.String(20))
    exposure = db.Column(db.Integer)
    bloom_type = db.Column(db.Integer)
    leaf_color = db.Column(db.String(20))
    fall_leaf_color = db.Column(db.String(20))
    availability = db.Column(db.String(20))
    image_files = db.Column(db.String(1000))
    comment = db.Column(db.String(1000))
    is_discountable = db.Column(db.Boolean, nullable=False, default=True)
    # One-to-many relationship between a plant and its associated flower images
    flower_images = db.relationship(Image.__class__.__name__, backref='plant', lazy=True)
    # One-to-many relationship between a plant and its associated leaf images
    leaf_images = db.relationship(Image.__class__.__name__, backref='plant', lazy=True)
    # One-to-many relationship between a plant and its associated fruit images
    fruit_images = db.relationship(Image.__class__.__name__, backref='plant', lazy=True)
    # One-to-many relationship between a plant and its associated bark images
    bark_images = db.relationship(Image.__class__.__name__, backref='plant', lazy=True)
    # One-to-many relationship between a plant and its associated habit images
    habit_images = db.relationship(Image.__class__.__name__, backref='plant', lazy=True)
    # Many-to-many relationship between a plant and available sizes
    sizes = db.relationship(Size.__class__.__name__, secondary=plantSizes, backref='users')
    # Many-to-many relationship between an inventory item and discounts that apply to it
    discounts = db.relationship(Discount.__class__.__name__, secondary=itemDiscounts, backref='plants')
    # ----------------End columns-------------------

    @staticmethod
    def from_id(id: int):
        plant = Plant.query.get(id)
        if plant:
            return plant
        return None

    @staticmethod
    def all_plant_ids():
        return Plant.query.with_entities(Plant.id).all()

    def add_horticopia_data(self, horticopia_id):
        # TODO
        return False

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.horticopia_id}', '{self.latin_name}', '{self.common_name}')"
