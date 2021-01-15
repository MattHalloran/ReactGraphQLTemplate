# Common model imports
from src.api import db
from src.models.tables import Tables
from enum import Enum
# Relationship dependencies
from src.models.order import Order
from src.models.role import Role
from src.models.phone import Phone
from src.models.email import Email
from src.models.feedback import Feedback
# Join table dependencies
from src.models.joinTables import userRoles
# Model-specific imports
import time
import bcrypt
from src.auth import verify_token


class AccountStatuses(Enum):
    UNLOCKED = 1
    WAITING_APPROVAL = 2
    SOFT_LOCK = 3
    HARD_LOCK = 4


# All users of the system, such as customers and admins
class User(db.Model):
    __tablename__ = Tables.USER.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(30), nullable=False)
    last_name = db.Column(db.String(30), nullable=False)
    pronouns = db.Column(db.String(50), nullable=False, default='they/them/theirs')
    theme = db.Column(db.String(20), nullable=False, default='light')
    image_file = db.Column(db.String(20), nullable=False, default='default.jpg')
    password = db.Column(db.String(255), nullable=False)
    login_attempts = db.Column(db.Integer, nullable=False, default=0)
    last_login_attempt = db.Column(db.Float, nullable=False, default=time.time())  # UTC seconds since epoch
    session_token = db.Column(db.String(250))
    account_status = db.Column(db.Integer, nullable=False, default=0)
    # One-to-many relationship between a customer and their personal phone numbers
    personal_phone = db.relationship(Phone.__class__.__name__, backref='user')
    # One-to-many relationship between a customer and their personal email addresses
    personal_email = db.relationship(Email.__class__.__name__, backref='user')
    # One-to-many relationship between a customer and their previous orders
    orders = db.relationship(Order.__class__.__name__, backref='customer', lazy=True)
    # Many-to-many relationship between a customer and roles
    roles = db.relationship(Role.__class__.__name__, secondary=userRoles, backref='users', lazy=True)
    # One-to-one relationship between a customer and their current cart
    cart = db.relationship(Order.__class__.__name__, uselist=False)
    # One-to-many relationship between a customer and the feedback they've given
    feedbacks = db.relationship(Feedback.__class__.__name__, backref='user')
    # ----------------End columns-------------------

    LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT = 3
    SOFT_LOCKOUT_DURATION_SECONDS = 15*60
    LOGIN_ATTEMPS_TO_HARD_LOCKOUT = 10

    def __init__(self,
                 first_name: str,
                 last_name: str,
                 pronouns: str,
                 password: str,
                 existing_customer: bool):
        self.last_login_attempt = time.time()
        self.first_name = first_name
        self.last_name = last_name
        self.pronouns = pronouns
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
            user.last_login_attempt = time.time()
            user.login_attempts += 1
            db.session.commit()
            print(f'User login attempts: {user.login_attempts}')
            # Return user if password is valid
            if (user.login_attempts <= User.LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT and
               bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))):
                user.login_attempts = 0  # Reset login attemps
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

    def set_token(self, token: str):
        '''Sets session token, which is used to validate
        near-term authenticated requests'''
        self.session_token = token
        db.session.commit()

    @staticmethod
    def get_profile_data(email, token, app):
        '''Returns user profile data, after
        verifying the session token'''
        # Check if user esists
        user = User.query.filter_by(email=email).first()
        if not user:
            return 'No user with that email'
        # Check if supplied token is equal to the user's token
        if not token == user.session_token:
            return 'Tokens do not match'
        # Check if user token is still valid
        if not verify_token(app, user.session_token):
            return 'Token could not be verified'
        # If all checks pass, return profile data
        return {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "pronouns": user.pronouns,
            "theme": user.theme,
            "email": user.email,
            "phone_number": user.phone_number,
            "image_file": user.image_file,
            "orders": [order.to_json() for order in user.orders],
            "roles": [role.to_json() for role in user.roles],
            "discounts": [discount.to_json() for discount in user.discounts]
        }

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
