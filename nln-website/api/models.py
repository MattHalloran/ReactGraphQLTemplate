#To create database,
#1) navigate to this directory in terminal
#2) from query import db
#3) db.create_all()
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy import declarative_base
import enum
from api import db, Base

season_types = ["Spring",
    "Summer",
    "Fall",
    "Winter"]
season_portion = ["Whole",
    "Early",
    "Mid",
    "Late"]
exposure_types = ["Full Sun",
    "Partial Sun",
    "Partial Shade",
    "Full Shade"]
growth_rates = ["Fast",
    "Moderate",
    "Slow",
    "Very Slow"]


userRoles = db.Table('userRoles',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
    )

#All users of the system, such as customers and admins
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(60), nullable=False)
    orders = db.relationship('Order', backref='customer', lazy=True)
    roles = db.relationship('Role', secondary=userRoles, backref='user', lazy=True)

    def __repr__(self):
        return f"User('{self.id}', '{self.username}', '{self.email}')"

#Roles assigned to an account, which are currently only customer and admin
class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)
    users = db.relationship('User', secondary=userRoles, backref='role', lazy=True)

class Plant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    horticopia_id = db.Column(db.Integer, unique=True)
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
    size = db.Column(db.String(20))
    availability = db.Column(db.String(20))
    image_files = db.Column(db.String(1000))
    comment = db.Column(db.String(1000))

    def __repr__(self):
        return f"Plant('{self.id}', '{self.horticopia_id}', '{self.latin_name}', '{self.common_name}')"

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)
    delivery_address = db.Column(db.String(100), nullable=False)
    special_instructions = db.Column(db.String)
    desired_delivery_date = db.Column(db.String(30))#TODO change to a datetime eventually
    items = db.relationship('OrderItem', backref='Order', lazy=True)

    def __repr__(self):
        return f"Order('{self.id}', '{self.user_id}', '{self.status}')"

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    plant_id = db.Column(db.Integer, db.ForeignKey('plant.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    def __repr__(self):
        return f"OrderItem('{self.order_id}', '{self.plant_id}', '{self.quantity}')"