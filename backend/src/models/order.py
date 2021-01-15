# Common model imports
from src.api import db
from src.models.tables import Tables
# Relationship dependencies
from src.models.user import User
from src.models.Address import Address


class OrderItem(db.Model):
    __tablename__ = Tables.ORDER_ITEM.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey(f'{Tables.ORDER.value}.id'), nullable=False)
    plant_id = db.Column(db.Integer, db.ForeignKey(f'{Tables.PLANT.value}.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    # ----------------End columns-------------------

    def __repr__(self):
        return f"{self.__tablename__}('{self.order_id}', '{self.plant_id}', '{self.quantity}')"


class Order(db.Model):
    __tablename__ = Tables.ORDER.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    status = db.Column(db.Integer, nullable=False, default=0)
    special_instructions = db.Column(db.String)
    desired_delivery_date = db.Column(db.Float, nullable=False)
    # One-to-many relationship between an order and items on the order
    items = db.relationship(OrderItem.__class__.__name__, backref='Order', lazy=True)
    # One-to-one relationship between an order and its delivery address
    delivery_address = db.relationship(Address.__class__.__name__, uselist=False)
    # One-to-one relationship between an order and the customer who sent the order
    customer = db.relationship(User.__class__.__name__, uselist=False)
    # ----------------End columns-------------------

    def __init__(self,
                 customer: User,
                 delivery_address: Address,
                 special_instructions: str,
                 desired_delivery_date: float,
                 items):
        self.customer = customer
        self.delivery_address = delivery_address
        self.special_instructions = special_instructions
        self.desired_delivery_date = desired_delivery_date
        self.items = items

    def to_json(self):
        return {
            "status": self.status,
            "special_instructions": self.special_instructions,
            "desired_delivery_date": self.desired_delivery_date,
            "items": [item.to_json() for item in self.items],
            "delivery_address": self.delivery_address.to_json(),
            "customer": {"id": self.customer.id}
        }

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
