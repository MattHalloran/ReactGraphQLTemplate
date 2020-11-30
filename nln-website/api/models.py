from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy import declarative_base
import enum
import time
import bcrypt
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

account_statuses = ["Unlocked",
    "Soft lock",
    "Hard lock"]


userRoles = db.Table('userRoles',
    db.Column('id', db.Integer, primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
    )

#All users of the system, such as customers and admins
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(255), nullable=False)
    login_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_login_attempt = db.Column(db.Float, nullable=False, default=time.time()) #UTC seconds since epoch
    account_status = db.Column(db.Integer, nullable=False, default=0)
    orders = db.relationship('Order', backref='customer', lazy=True)
    roles = db.relationship('Role', secondary=userRoles, backref='user', lazy=True)

    def __init__(self, name, email, password):
        self.last_login_attempt = time.time()
        self.name = name
        self.email = email
        self.password = User.hashed_password(password)

    @staticmethod
    def hashed_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def get_user_from_credentials(email: str, password: str):
        user = User.query.filter_by(email=email).first()
        if user:
            # Reset login attempts after 15 minutes
            if (time.time() - user.last_login_attempt) > 15*60:
                print('Resetting soft account lock')
                user.login_attempts = 0
                db.session.commit()
            user.last_login_attempt = time.time()
            user.login_attempts += 1
            db.session.commit()
            print(f'User login attempts: {user.login_attempts}')
            # Return user if password is valid
            if user.login_attempts <= 3 and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                user.login_attempts = 0
                db.session.commit()
                return user
            if user.login_attempts > 3:
                print(f'Soft-locking user {email}')
                user.account_status = 1
                db.session.commit()
        return None

    @staticmethod
    def get_user_lock_status(email: str):
        '''Returns -1 if account doesn't exist,
        0 if account not locked
        1 if account soft-locked (incorrect password too many times),
        2 if account hard-locked (need admin to unlock)'''
        try:
            user = User.query.filter_by(email=email).first()
            return user.account_status
        except Exception:
            print(f'Could not find account status for {email}')
            return -1

    def __repr__(self):
        return f"User('{self.id}', '{self.name}', '{self.email}')"

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
