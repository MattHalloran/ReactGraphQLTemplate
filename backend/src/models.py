import time
import bcrypt
from src.api import db
from types import SimpleNamespace

# Created this in an effort to minimize typos.
# Please use this table to reference class names
tables_dict = {
    "Plant": "Plant",
    "User": "User",
    "Order": "Order",
    "Role": "Role",
    "userRoles": "userRoles",
    "userDiscounts": "userDiscounts",
    "itemDiscounts": "itemDiscounts",
    "Discount": "Discount",
    "Order": "Order",
    "OrderItem": "OrderItem",
    "Feedback": "Feedback"
}
TABLES = SimpleNamespace(**tables_dict)

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

account_statuses = {
    "UNLOCKED": 0,
    "WAITING_APPROVAL": 1,
    "SOFT_LOCK": 2,
    "HARD_LOCK": 3
}

# A joining table for the two-way relationship between users and roles.
# A user can have many roles, and a role can be shared by many users
userRoles = db.Table(TABLES.userRoles,
                     db.Column('id', db.Integer, primary_key=True),
                     db.Column('user_id', db.Integer, db.ForeignKey(f'{TABLES.User}.id')),
                     db.Column('role_id', db.Integer, db.ForeignKey(f'{TABLES.Role}.id'))
                     )

# A joining table for the many-to-many relationship
# between user discounts and users
userDiscounts = db.Table(TABLES.userDiscounts,
                         db.Column('id', db.Integer, primary_key=True),
                         db.Column('user_id', db.Integer, db.ForeignKey(f'{TABLES.User}.id')),
                         db.Column('user_discount_id', db.Integer, db.ForeignKey(f'{TABLES.Discount}.id'))
                         )

# A joining table for the many-to-many relationship
# between inventory discounts and inventory items
itemDiscounts = db.Table(TABLES.itemDiscounts,
                         db.Column('id', db.Integer, primary_key=True),
                         db.Column('plant_id', db.Integer, db.ForeignKey(f'{TABLES.Plant}.id')),
                         db.Column('plant_discount_id', db.Integer, db.ForeignKey(f'{TABLES.Discount}.id'))
                         )


# All users of the system, such as customers and admins
class User(db.Model):
    __tablename__ = f'{TABLES.User}'
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), unique=True)
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(255), nullable=False)
    login_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_login_attempt = db.Column(db.Float, nullable=False, default=time.time())  # UTC seconds since epoch
    account_status = db.Column(db.Integer, nullable=False, default=0)
    # One-to-many relationship between a customer and their previous orders
    orders = db.relationship(f'{TABLES.Order}', backref='customer', lazy=True)
    # Many-to-many relationship between a customer and roles
    roles = db.relationship(f'{TABLES.Role}', secondary=userRoles, backref='users', lazy=True)
    # Many-to-many relation ship between a customer and discounts that apply to them
    # (i.e. discounts they can apply to any discountable item)
    discounts = db.relationship(f'{TABLES.Discount}', secondary=userDiscounts, backref='users')
    # One-to-one relationship between a customer and their current cart
    cart = db.relationship(f'{TABLES.Order}', uselist=False)
    # ----------------End columns-------------------

    LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3
    SOFT_LOCKOUT_DURATION_SECONDS = 15*60
    LOGIN_ATTEMPS_TO_HARD_LOCKOUT = 10

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
                user.account_status = account_statuses.HARD_LOCK
                db.session.commit()
            elif user.login_attempts > User.LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT:
                print(f'Soft-locking user {email}')
                user.account_status = account_statuses.SOFT_LOCK
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

    def __repr__(self):
        return f"User('{self.id}', '{self.name}', '{self.email}')"


# Roles assigned to an account, which are currently only customer and admin
class Role(db.Model):
    __tablename__ = f'{TABLES.Role}'
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(20), unique=True, nullable=False)
    description = db.Column(db.String(2000))
    # ----------------End columns-------------------

    def __repr__(self):
        return f"Role('{self.id}', '{self.title}')"


# A base class for discounts that can either be applied to:
#   1) one or more inventory items, or
#   2) one or more customers
# These discounts are not stacked; whichever discount is the greatest will be applied
class Discount(db.Model):
    __tablename__ = f'{TABLES.Discount}'
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
    __tablename__ = f'{TABLES.Plant}'
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
    discounts = db.relationship(f'{TABLES.Discount}', secondary=itemDiscounts, backref='items')
    # ----------------End columns-------------------

    def add_horticopia_data(self, horticopia_id):
        # TODO
        return False

    def __repr__(self):
        return f"Plant('{self.id}', '{self.horticopia_id}', '{self.latin_name}', '{self.common_name}')"


class Order(db.Model):
    __tablename__ = f'{TABLES.Order}'
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey(f'{TABLES.User}.id'), nullable=False)
    status = db.Column(db.Integer, nullable=False, default=0)
    delivery_address = db.Column(db.String(100), nullable=False)
    special_instructions = db.Column(db.String)
    desired_delivery_date = db.Column(db.Float, nullable=False)
    items = db.relationship(f'{TABLES.OrderItem}', backref='Order', lazy=True)
    # ----------------End columns-------------------

    def __init__(self, customer, delivery_address, special_instructions, desired_delivery_date, items):
        self.customer_id = customer.id
        self.delivery_address = delivery_address
        self.special_instructions = special_instructions
        self.desired_delivery_date = desired_delivery_date
        self.items = items

    def __repr__(self):
        return f"Order('{self.id}', '{self.user_id}', '{self.status}')"


class OrderItem(db.Model):
    __tablename__ = f'{TABLES.OrderItem}'
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey(f'{TABLES.Order}.id'), nullable=False)
    plant_id = db.Column(db.Integer, db.ForeignKey(f'{TABLES.Plant}.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    # ----------------End columns-------------------

    def __repr__(self):
        return f"OrderItem('{self.order_id}', '{self.plant_id}', '{self.quantity}')"


# Allows users to give feedback about the website or business
class Feedback(db.Model):
    __tablename__ = f'{TABLES.Feedback}'
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    context = db.Column(db.String(5000), nullable=False)
    contact_email = db.Column(db.String(100))
    contact_phone = db.Column(db.String(20))
    # ----------------End columns-------------------

    def __repr__(self):
        return f"Feedback('{self.id}', '{self.context}')'"
