import time
import bcrypt
from src.api import db
from enum import Enum


# Enum = class name, value = table nameƒ
class Tables(Enum):
    PLANT = 'plant'
    USER = 'user'
    ORDER = 'order'
    DISCOUNT = 'discount'
    ROLE = 'role'
    USER_ROLES = 'user_roles'
    USER_DISCOUNTS = 'user_discounts'
    ITEM_DISCOUNTS = 'item_discounts'
    ORDER_ITEM = 'order_item'
    FEEDBACK = 'feedback'
    IMAGE = 'image'
    CONTACT_INFO = 'contact_info'


class AccountStatuses(Enum):
    UNLOCKED = 1
    WAITING_APPROVAL = 2
    SOFT_LOCK = 3
    HARD_LOCK = 4

class ImageUses(Enum):
    HERO = 1
    GALLERY = 2

# season_types = ["Spring",
#                 "Summer",
#                 "Fall",
#                 "Winter"]
# season_portion = ["Whole",
#                   "Early",
#                   "Mid",
#                   "Late"]
# exposure_types = ["Full Sun",
#                   "Partial Sun",
#                   "Partial Shade",
#                   "Full Shade"]
# growth_rates = ["Fast",
#                 "Moderate",
#                 "Slow",
#                 "Very Slow"]


# A joining table for the two-way relationship between users and roles.
# A user can have many roles, and a role can be shared by many users
userRoles = db.Table(Tables.USER_ROLES.value,
                     db.Column('id', db.Integer, primary_key=True),
                     db.Column('user_id', db.Integer, db.ForeignKey(f'{Tables.USER.value}.id')),
                     db.Column('role_id', db.Integer, db.ForeignKey(f'{Tables.ROLE.value}.id'))
                     )

# A joining table for the many-to-many relationship
# between user discounts and users
userDiscounts = db.Table(Tables.USER_DISCOUNTS.value,
                         db.Column('id', db.Integer, primary_key=True),
                         db.Column('user_id', db.Integer, db.ForeignKey(f'{Tables.USER.value}.id')),
                         db.Column('user_discount_id', db.Integer, db.ForeignKey(f'{Tables.DISCOUNT.value}.id'))
                         )

# A joining table for the many-to-many relationship
# between inventory discounts and inventory items
itemDiscounts = db.Table(Tables.ITEM_DISCOUNTS.value,
                         db.Column('id', db.Integer, primary_key=True),
                         db.Column('plant_id', db.Integer, db.ForeignKey(f'{Tables.PLANT.value}.id')),
                         db.Column('plant_discount_id', db.Integer, db.ForeignKey(f'{Tables.DISCOUNT.value}.id'))
                         )


# All users of the system, such as customers and admins
class User(db.Model):
    __tablename__ = Tables.USER.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    theme = db.Column(db.String(20), nullable=False, default='light')
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(255), nullable=False)
    login_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_login_attempt = db.Column(db.Float, nullable=False, default=time.time())  # UTC seconds since epoch
    account_status = db.Column(db.Integer, nullable=False, default=0)
    # One-to-many relationship between a customer and their previous orders
    orders = db.relationship('Order', backref='customer', lazy=True)
    # Many-to-many relationship between a customer and roles
    roles = db.relationship('Role', secondary=userRoles, backref='users', lazy=True)
    # Many-to-many relation ship between a customer and discounts that apply to them
    # (i.e. discounts they can apply to any discountable item)
    discounts = db.relationship('Discount', secondary=userDiscounts, backref='users')
    # One-to-one relationship between a customer and their current cart
    cart = db.relationship('Order', uselist=False)
    # ----------------End columns-------------------

    LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3
    SOFT_LOCKOUT_DURATION_SECONDS = 15*60
    LOGIN_ATTEMPS_TO_HARD_LOCKOUT = 10

    def __init__(self, name: str, email: str, password: str, existing_customer: bool):
        self.last_login_attempt = time.time()
        self.name = name
        self.email = email
        self.password = User.hashed_password(password)
        self.roles.append(Role.get_customer_role())
        # If they've ordered from here before (but before online ordering was available),
        # they are allowed to shop before approval
        if existing_customer:
            self.account_status = AccountStatuses.UNLOCKED.value
        else:
            self.account_status = AccountStatuses.WAITING_APPROVAL.value

    @staticmethod
    def hashed_password(password: str):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def get_user_from_credentials(email: str, password: str):
        user = User.query.filter_by(email=email).first()
        if user:
            # Reset login attempts after 15 minutes
            if (time.time() - user.last_login_attempt) > User.SOFT_LOCKOUT_DURATION_SECONDS:
                print('Resetting soft account lock')
                user.login_attempts = 0
                db.session.commit()
            user.last_login_attempt = time.time()
            user.login_attempts += 1
            db.session.commit()
            print(f'User login attempts: {user.login_attempts}')
            # Return user if password is valid
            if (user.login_attempts <= User.LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT and
               bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))):
                user.login_attempts = 0
                db.session.commit()
                return user
            if user.login_attempts > User.LOGIN_ATTEMPS_TO_HARD_LOCKOUT:
                print(f'Hard-locking user {email}')
                user.account_status = AccountStatuses.HARD_LOCK.value
                db.session.commit()
            elif user.login_attempts > User.LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT:
                print(f'Soft-locking user {email}')
                user.account_status = AccountStatuses.SOFT_LOCK.value
                db.session.commit()
        return None

    @staticmethod
    def get_user_lock_status(email: str):
        '''Returns -1 if account doesn't exist,
        account status otherwise'''
        try:
            user = User.query.filter_by(email=email).first()
            return user.account_status
        except Exception:
            print(f'Could not find account status for {email}')
            return -1

    def to_json(self):
        return {"name": self.name, "theme": self.theme, "roles": [r.to_json() for r in self.roles]}

    def __repr__(self):
        return f"{self.__tablename__}({self.to_json()})"


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


# A base class for discounts that can either be applied to:
#   1) one or more inventory items, or
#   2) one or more customers
# These discounts are not stacked; whichever discount is the greatest will be applied
class Discount(db.Model):
    __tablename__ = Tables.DISCOUNT.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    # A number between 0 < 1, representing the discount percent in dollars (at least currently)
    discount = db.Column(db.DECIMAL(4, 4), nullable=False, default=0)
    # A short string explaining what the discount is for. Optional
    title = db.Column(db.String(100))
    # A string with any other relevant text relating to the discount
    text_content = db.Column(db.String(2000))
    # ----------------End columns-------------------


class Plant(db.Model):
    __tablename__ = Tables.PLANT.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    horticopia_id = db.Column(db.Integer, unique=True)
    # ------------Start Horticopia fields---------------
    # Added here in case the admin wants to change something
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
    # ------------End Horticopia fields-----------------
    availability = db.Column(db.String(20))
    image_files = db.Column(db.String(1000))
    comment = db.Column(db.String(1000))
    is_discountable = db.Column(db.Boolean, nullable=False, default=True)
    # Many-to-many relation ship between an inventory item and discounts that apply to it
    discounts = db.relationship('Discount', secondary=itemDiscounts, backref='items')
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


class Order(db.Model):
    __tablename__ = Tables.ORDER.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey(f'{Tables.USER.value}.id'), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)
    delivery_address = db.Column(db.String(100), nullable=False)
    special_instructions = db.Column(db.String)
    desired_delivery_date = db.Column(db.Float, nullable=False)
    items = db.relationship('OrderItem', backref='Order', lazy=True)
    # ----------------End columns-------------------

    def __init__(self, customer, delivery_address, special_instructions, desired_delivery_date, items):
        self.customer_id = customer.id
        self.delivery_address = delivery_address
        self.special_instructions = special_instructions
        self.desired_delivery_date = desired_delivery_date
        self.items = items

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.user_id}', '{self.status}')"


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


# Stores metadata for images used on website (gallery, hero, etc), but NOT profile pictures
class Image(db.Model):
    __tablename__ = Tables.IMAGE.value
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(250), nullable=False)
    alt = db.Column(db.String(100))
    hash = db.Column(db.String(100), unique=True, nullable=False)
    used_for = db.Column(db.String(100), nullable=False)
    width = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Integer, nullable=False)

    def __init__(self, location: str, alt: str, hash: str, used_for: ImageUses, width: int, height: int):
        self.location = location
        self.alt = alt
        self.hash = hash
        self.used_for = used_for
        self.width = width
        self.height = height

    @staticmethod
    def is_hash_used(hash: str):
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None

    def to_json(self):
        return {"location": self.location, "alt": self.alt, "used_for": self.used_for, "width": self.width, "height": self.height}

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.location}')"


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
