from src.api import db
from src.handlers.handler import Handler
from src.handlers.roleHandler import RoleHandler
from src.handlers.orderHandler import OrderHandler
from src.handlers.emailHandler import EmailHandler
from src.handlers.phoneHandler import PhoneHandler
from src.models import User, AccountStatus
from src.auth import verify_token
import time
import bcrypt


class UserHandler(Handler):

    @staticmethod
    def model_type():
        return User

    @staticmethod
    def all_fields():
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def required_fields():
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def protected_fields():
        return ['existing_customer', 'password', 'login_attempts']

    @staticmethod
    def create(handler, *args):
        user = super().create(handler, args)
        # All users are customers by default
        user.roles.append(RoleHandler.get_customer_role())

    @staticmethod
    def to_dict(model: User):
        as_dict = Handler.simple_fields_to_dict(model, ['first_name', 'last_name', 'pronouns', 'existing_customer', 'theme'])
        as_dict['roles'] = [RoleHandler.to_dict(r) for r in model.roles]
        return as_dict

    @staticmethod
    def from_email(email: str):
        return User.query.filter(User.personal_email.any(email_address=email)).first()

    @staticmethod
    def get_user_from_credentials(email: str, password: str):
        user = UserHandler.from_email(email)
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
                user.account_status = AccountStatus.HARD_LOCK.value
                db.session.commit()
            elif user.login_attempts > User.LOGIN_ATTEMPTS_TO_SOFT_LOCKOUT:
                print(f'Soft-locking user {email}')
                user.account_status = AccountStatus.SOFT_LOCK.value
                db.session.commit()
        return None

    @staticmethod
    def set_token(model: User, token: str):
        '''Sets session token, which is used to validate
        near-term authenticated requests'''
        model.session_token = token

    @staticmethod
    def get_profile_data(email, token, app):
        '''Returns user profile data, after
        verifying the session token'''
        # Check if user esists
        user = UserHandler.from_email(email)
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
            "personal_email": [EmailHandler.to_dict(email) for email in user.personal_email],
            "personal_phone": [PhoneHandler.to_dict(number) for number in user.personal_phone],
            "image_file": user.image_file,
            "orders": [OrderHandler.to_dict(order) for order in user.orders],
            "roles": [RoleHandler.to_dict(role) for role in user.roles]
        }

    @staticmethod
    def get_user_lock_status(email: str):
        '''Returns -1 if account doesn't exist,
        account status otherwise'''
        try:
            user = UserHandler.from_email(email)
            return user.account_status
        except Exception:
            print(f'Could not find account status for {email}')
            return -1
