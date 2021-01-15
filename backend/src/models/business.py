# Common model imports
from src.api import db
from src.models.tables import Tables
# Relationship dependencies
from src.models.address import Address
from src.models.user import User
from src.models.phone import Phone
from src.models.email import Email
from src.models.discount import Discount
# Join table dependencies
from src.models.joinTables import businessDiscounts


# Orders are submitted via businesses.
# Each business has one or more users
class Business(db.Model):
    __tablename__ = Tables.BUSINESS.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subscribed_to_newsletters = db.Column(db.Boolean, default=True)
    # One-to-many relationship between a business and their delivery addresses
    delivery_addresses = db.relationship(Address.__class__.__name__, backref='business')
    # One-to-many relationship between a business and their employees (people who can order)
    employees = db.relationship(User.__class__.__name__, backref='employer', lazy=True)
    # One-to-many relationship between a business and their phone numbers (usually just 1)
    phones = db.relationship(Phone.__class__.__name__, backref='business')
    # One-to-many relationship between a business and their email addresses
    emails = db.relationship(Email.__class__.__name__, backref='business')
    # Many-to-many relation ship between a business and discounts that apply to them
    # (i.e. discounts they can apply to any discountable item)
    discounts = db.relationship(Discount.__class__.__name__, secondary=businessDiscounts, backref='businesses')
    # ----------------End columns-------------------

    def __init__(self, name: str, email: Email, phone: Phone, subscribed_to_newsletters: bool):
        self.name = name
        self.emails.append(email)
        self.phones.append(phone)
        self.subscribed_to_newsletters = subscribed_to_newsletters

    def to_json(self):
        return {
            "name": self.name,
            "subscribed_to_newsletters": self.subscribed_to_newsletters,
            "delivery_addresses": [addy.to_json() for addy in self.delivery_addresses],
            "employees": [emp.to_json() for emp in self.employees],
            "phones": [phone.to_json() for phone in self.phones],
            "emails": [email.to_json() for email in self.emails]
        }

    def add_address(self, address: Address):
        print('TODOOOOOOO')

    def add_employee(self, employee: User):
        print('TODOOOOOOOOO')

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"
