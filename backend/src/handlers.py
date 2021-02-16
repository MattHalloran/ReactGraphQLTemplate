from abc import ABC, abstractmethod
from src.models import AccountStatus, Address, ContactInfo, Business, BusinessDiscount, Email, Feedback
from src.models import Image, ImageUses, Order, OrderItem, OrderStatus, Phone, Plant, PlantTrait
from src.models import PlantTraitOptions, Role, Sku, SkuStatus, SkuDiscount, User
from src.api import db
from src.config import Config
from base64 import b64encode
from src.auth import verify_token
import time
import bcrypt


# Abstract method for model handling classes
class Handler(ABC):

    @staticmethod
    @abstractmethod
    def all_fields():
        '''Specifies all fields used by create and/or update method'''
        raise Exception('Handler class must override all_fields method')

    @staticmethod
    @abstractmethod
    def required_fields():
        '''Specifies fields required by the model's constructor
        **NOTE: Fields order must match constructor signature'''
        raise Exception('Handler class must overrde required_fields method')

    @staticmethod
    def protected_fields():
        '''Specifies which fields should be filtered out from the update method (ex: password)'''

    @staticmethod
    @abstractmethod
    def to_dict(model):
        '''Represent object as a dictionary'''
        raise Exception('Handler class must override to_dict method')

    @staticmethod
    def simple_fields_to_dict(model, simple_fields: list):
        '''Used to simplify field representations in to_dict that are just self.whatever'''
        simple_dict = {}
        for field in simple_fields:
            simple_dict[field] = getattr(model, field, 'ERROR: Could not retrieve field')
        return simple_dict

    @staticmethod
    def filter_data(data: dict, keep: list, remove=[]):
        '''Prepares dict for creating/updating model.
        All keys not in keep are removed.
        All keys in remove are removed'''
        filtered = {}
        for key in keep:
            if key in data.keys():
                filtered[key] = data[key]
        if remove:
            for k in remove:
                filtered.pop(k, None)
        return filtered

    @staticmethod
    def data_has_required(required_fields: list, data: dict):
        '''Returns true if the dictionary contains all specified fields'''
        return all([field in data for field in required_fields])

    @classmethod
    def create_from_dict(cls, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        # If any required fields are missing
        if not cls.data_has_required(cls.required_fields(), data):
            raise Exception('Cannot create object: one or more required fields missing')
        # Filter data
        filtered_data = cls.filter_data(data, cls.all_fields())
        # Before creating the model object, first try to set default values
        # of fields that have not been provided
        if hasattr(cls.ModelType, 'defaults'):
            for key in cls.ModelType.defaults.keys():
                if not filtered_data.get(key):
                    filtered_data[key] = cls.ModelType.defaults[key]
        return cls.ModelType(*filtered_data)

    @classmethod
    def create_from_args(cls, *args):
        return cls.ModelType(*args)

    @classmethod
    def create(cls, *args):
        '''Create a new model object'''
        # If a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            print(f'CREATING OBJECT FROM DICT... {args[0]}')
            return cls.create_from_dict(args[0])
        # If arguments are passed in to match the model's __init___
        else:
            print('CREATING OBJECT FROM ARGS...')
            return cls.create_from_args(*args)

    @classmethod
    def update_from_dict(cls, obj, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        filtered_data = cls.filter_data(data, cls.all_fields(), cls.protected_fields())
        for key in filtered_data.keys():
            setattr(obj, key, filtered_data[key])

    @classmethod
    def update(cls, obj, *args):
        '''Update an existing model object'''
        # Ensure a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            cls.update_from_dict(obj, args[0])
        else:
            raise Exception('Updates can only be performed using dicts')

    @classmethod
    def from_id(cls, id: int):
        result = cls.ModelType.query.get(id)
        return result if result else None

    @classmethod
    def all_ids(cls):
        return [o[0] for o in cls.ModelType.query.with_entities(cls.ModelType.id).all()]

    @classmethod
    def uniques(cls, column):
        '''Return all unique values for a column'''
        return [o[0] for o in cls.ModelType.query.with_entities(column).distinct(column).all()]


class AddressHandler(Handler):
    ModelType = Address

    @staticmethod
    def all_fields():
        return ['tag', 'name', 'country', 'administrative_area',
                'locality', 'postal_code', 'throughfare', 'premise',
                'delivery_instructions']

    @staticmethod
    def required_fields():
        return ['country', 'locality', 'postal_code', 'throughfare']

    @staticmethod
    def to_dict(model: Address):
        return AddressHandler.simple_fields_to_dict(model, AddressHandler.all_fields())


class BusinessDiscountHandler(Handler):
    ModelType = BusinessDiscount

    @staticmethod
    def all_fields():
        return ['discount', 'title', 'comment', 'terms']

    @staticmethod
    def required_fields():
        return ['discount', 'title']

    @staticmethod
    def to_dict(model: BusinessDiscount):
        return BusinessDiscountHandler.simple_fields_to_dict(model, BusinessDiscountHandler.all_fields())


class BusinessHandler(Handler):
    ModelType = Business

    @staticmethod
    def all_fields():
        return ['name', 'email', 'Email', 'phone', 'subscribed_to_newsletters']

    @staticmethod
    def required_fields():
        return ['name']

    @staticmethod
    def to_dict(model: Business):
        as_dict = BusinessHandler.simple_fields_to_dict(model, ['name', 'subscribed_to_newsletters'])
        as_dict['delivery_addresses'] = [AddressHandler.to_dict(addy) for addy in model.delivery_addresses]
        as_dict['employees'] = [UserHandler.to_dict(emp) for emp in model.employees]
        as_dict['phones'] = [PhoneHandler.to_dict(phone) for phone in model.phones]
        as_dict['emails'] = [EmailHandler.to_dict(email) for email in model.emails]
        return as_dict

    @staticmethod
    def add_address(model: Business, address: Address):
        if address not in model.delivery_addresses:
            model.delivery_addresses.append(address)
            return True
        return False

    @staticmethod
    def add_employee(model: Business, employee: User):
        if employee not in model.employees:
            model.employees.append(employee)
            return True
        return False


class ContactInfoHandler(Handler):
    ModelType = ContactInfo

    @staticmethod
    def all_fields():
        return ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    @staticmethod
    def required_fields():
        return []

    @staticmethod
    def to_dict(model: ContactInfo):
        return ContactInfoHandler.simple_fields_to_dict(model, ContactInfoHandler.all_fields())


class EmailHandler(Handler):
    ModelType = Email

    @staticmethod
    def all_fields():
        return ['email_address', 'receives_delivery_updates']

    @staticmethod
    def required_fields():
        return ['email_address']

    @staticmethod
    def to_dict(model: Email):
        return EmailHandler.simple_fields_to_dict(model, EmailHandler.all_fields())


class FeedbackHandler(Handler):
    ModelType = Feedback

    @staticmethod
    def all_fields():
        return ['text']

    @staticmethod
    def required_fields():
        return ['text']

    @staticmethod
    def to_dict(model: Feedback):
        return FeedbackHandler.simple_fields_to_dict(model, FeedbackHandler.all_fields())


class ImageHandler(Handler):
    ModelType = Image

    @staticmethod
    def all_fields():
        return ['folder', 'file_name', 'thumbnail_file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @staticmethod
    def required_fields():
        return ['folder', 'file_name', 'thumbnail_file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @staticmethod
    def to_dict(model: Image):
        return ImageHandler.simple_fields_to_dict(model, ['hash', 'alt', 'used_for', 'width', 'height'])

    @staticmethod
    def get_b64(model: Image):
        '''Returns the base64 string representation of an image file'''
        # Read image file
        with open(f'{Config.BASE_IMAGE_DIR}/{model.folder}/{model.file_name}.{model.extension}', 'rb') as open_file:
            byte_content = open_file.read()
        # Convert image to a base64 string
        base64_bytes = b64encode(byte_content)
        base64_string = base64_bytes.decode('utf-8')
        return base64_string

    @staticmethod
    def from_used_for(used_for: ImageUses):
        return db.session.query(Image).filter_by(used_for=used_for.value).all()

    @staticmethod
    def from_file_name(file_name: str):
        return db.session.query(Image).filter_by(file_name=file_name).one_or_none()

    @staticmethod
    def from_hash(hash: str):
        return db.session.query(Image).filter_by(hash=hash).one_or_none()

    @staticmethod
    def is_hash_used(hash: str):
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None


class OrderItemHandler(Handler):
    ModelType = OrderItem

    @staticmethod
    def all_fields():
        return ['quantity', 'sku']

    @staticmethod
    def required_fields():
        return []

    @staticmethod
    def to_dict(model: OrderItem):
        return {
            'quantity': model.quantity,
            'sku': SkuHandler.to_dict(model.sku)
        }


class OrderHandler(Handler):
    ModelType = Order

    @staticmethod
    def all_fields():
        return ['delivery_address', 'special_instructions', 'desired_delivery_date', 'items', 'user_id']

    @staticmethod
    def required_fields():
        return ['user_id']

    @staticmethod
    def to_dict(model: Order):
        as_dict = OrderHandler.simple_fields_to_dict(model, ['status', 'special_instructions', 'desired_delivery_date'])
        as_dict['items'] = [OrderItemHandler.to_dict(item) for item in model.items]
        as_dict['delivery_address'] = AddressHandler.to_dict(model.delivery_address)
        customer = UserHandler.from_id(model.user_id)
        as_dict['customer'] = {
            "id": customer.id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
        }
        return as_dict

    @staticmethod
    def from_status(status: OrderStatus):
        '''Return all orders that match the provided status'''
        return db.session.query(Order).filter_by(status=status.value).all()

    @staticmethod
    def set_status(model: Order, status: OrderStatus):
        model.status = status.value


class PhoneHandler(Handler):
    ModelType = Phone

    @staticmethod
    def all_fields():
        return ['unformatted_number', 'country_code', 'extension', 'is_mobile', 'receives_delivery_updates']

    @staticmethod
    def required_fields():
        return ['unformatted_number']

    @staticmethod
    def to_dict(model: Phone):
        return PhoneHandler.simple_fields_to_dict(model, PhoneHandler.all_fields())


class PlantTraitHandler(Handler):
    ModelType = PlantTrait

    @staticmethod
    def all_fields():
        return ['trait', 'value']

    @staticmethod
    def required_fields():
        return ['trait', 'value']

    @staticmethod
    def to_dict(model: PlantTrait):
        return PlantTraitHandler.simple_fields_to_dict(model, PlantTraitHandler.all_fields())

    @staticmethod
    def from_values(trait: PlantTraitOptions, value: str):
        '''Returns the PlantTrait object that matches the specified values, or None'''
        return db.session.query(PlantTrait).filter_by(trait=trait.value, value=value).one_or_none()

    @classmethod
    def uniques_by_trait(cls, trait: PlantTraitOptions):
        '''Return all unique values for a given trait'''
        return [o[0] for o in cls.ModelType.query.with_entities(PlantTrait.value).filter_by(trait=trait.value).distinct(PlantTrait.value).all()]


class PlantHandler(Handler):
    ModelType = Plant

    @staticmethod
    def all_fields():
        return ['latin_name', 'common_name', 'plantnet_url', 'yards_url', 'description',
                'jersey_native', 'drought_tolerance_id', 'grown_height_id',
                'grown_spread_id', 'growth_rate_id', 'optimal_light_id', 'salt_tolerance_id']

    @staticmethod
    def required_fields():
        return ['latin_name']

    @staticmethod
    def to_dict(model: Plant):

        def array_to_dict(model_dict: dict, to_dict, field: str, key=None):
            '''Helper method for creating json data from an array'''
            if not key:
                key = field
            data = getattr(model, field, None)
            if not data:
                return
            if isinstance(data, list):
                if len(data) > 0:
                    model_dict[key] = [to_dict(d) for d in data]
            else:
                model_dict[key] = to_dict(data)

        # Start with a dictionary of basic values
        as_dict = PlantHandler.simple_fields_to_dict(model, PlantHandler.all_fields())

        # Add data for every image
        img_fields = ['flower_images', 'leaf_images', 'fruit_images',
                      'bark_images', 'habit_images']
        [array_to_dict(as_dict, ImageHandler.to_dict, field) for field in img_fields]

        # Add data for trait fields
        trait_fields = ['deer_resistance', 'drought_tolerance', 'grown_height', 'grown_spread',
                        'growth_rate', 'optimal_light', 'salt_tolerance',
                        'attracts_pollinators_and_wildlifes', 'bloom_times', 'bloom_colors',
                        'zones', 'plant_types', 'physiographic_regions', 'soil_moistures',
                        'soil_phs', 'soil_types', 'light_ranges']
        [array_to_dict(as_dict, PlantTraitHandler.to_dict, field) for field in trait_fields]

        return as_dict
    
    @staticmethod
    def from_latin(latin: str):
        return db.session.query(Plant).filter_by(latin_name=latin).one_or_none()


class RoleHandler(Handler):
    ModelType = Role

    @staticmethod
    def all_fields():
        return ['title', 'description']

    @staticmethod
    def required_fields():
        return ['title']

    @staticmethod
    def to_dict(model):
        return RoleHandler.simple_fields_to_dict(model, RoleHandler.all_fields())

    @staticmethod
    def get_customer_role():
        return Role.query.filter_by(title='Customer').first()

    @staticmethod
    def get_admin_role():
        return Role.query.filter_by(title='Admin').first()


class SkuDiscountHandler(Handler):
    ModelType = SkuDiscount

    @staticmethod
    def all_fields():
        return ['discount', 'title', 'comment', 'terms']

    @staticmethod
    def required_fields():
        return ['discount', 'title']

    @staticmethod
    def to_dict(model: SkuDiscount):
        return SkuDiscountHandler.simple_fields_to_dict(model, SkuDiscountHandler.all_fields())


class SkuHandler(Handler):
    ModelType = Sku

    @staticmethod
    def all_fields():
        return ['sku', 'size', 'price', 'availability', 'is_discountable']

    @staticmethod
    def required_fields():
        return []

    @staticmethod
    def to_dict(model: Sku):
        as_dict = SkuHandler.simple_fields_to_dict(model, SkuHandler.all_fields())
        as_dict['display_image'] = SkuHandler.get_display_image(model)
        as_dict['plant'] = PlantHandler.to_dict(model.plant)
        as_dict['discounts'] = [SkuDiscountHandler.to_dict(discount) for discount in model.discounts]
        as_dict['status'] = model.status
        return as_dict

    @staticmethod
    def set_display_image(model: Sku, image: Image):
        model.display_image = image
        model.display_img_id = image.id

    @staticmethod
    def get_display_image(model: Sku):
        '''Returns a base64 string of the Sku's display image. If none is set,
        one is decided'''
        # If the sku has a display image
        if model.display_img:
            return model.display_img
        # If an associated plant can't be found, return a default image TODO!!!!!1
        if not model.plant:
            return None
        if len(model.plant.flower_images) > 0:
            return ImageHandler.get_b64(model.plant.flower_images[0])
        if len(model.plant.leaf_images) > 0:
            return ImageHandler.get_b64(model.plant.leaf_images[0])
        if len(model.plant.fruit_images) > 0:
            return ImageHandler.get_b64(model.plant.fruit_images[0])
        if len(model.plant.bark_images) > 0:
            return ImageHandler.get_b64(model.plant.bark_images[0])
        if len(model.plant.habit_images) > 0:
            return ImageHandler.get_b64(model.plant.habit_images[0])
        # TODO default image
        return None

    @staticmethod
    def add_discount(model: Sku, discount):
        if not model.is_discountable:
            return False
        if discount in model.discounts:
            return False
        model.discounts.append(discount)
        return True

    @staticmethod
    def set_plant(model: Sku, plant: Plant):
        model.plant = plant

    @staticmethod
    def all_available_skus():
        return db.session.query(Sku).filter_by(status=SkuStatus.ACTIVE.value).all()

    @staticmethod
    def from_sku(sku: str):
        return db.session.query(Sku).filter_by(sku=sku).one_or_none()

    @staticmethod
    def from_plant(plant: Plant):
        return db.session.query(Sku).filter_by(plant_id=plant.id).one_or_none()


class UserHandler(Handler):
    ModelType = User

    @staticmethod
    def all_fields():
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def required_fields():
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def protected_fields():
        return ['existing_customer', 'password', 'login_attempts']

    @classmethod
    def create(cls, *args):
        user = super(UserHandler, cls).create(*args)
        # All users are customers by default
        user.roles.append(RoleHandler.get_customer_role())
        return user

    @staticmethod
    def to_dict(model: User):
        as_dict = UserHandler.simple_fields_to_dict(model, ['first_name', 'last_name', 'pronouns', 'existing_customer', 'theme'])
        as_dict['id'] = model.id
        as_dict['account_status'] = model.account_status
        as_dict['roles'] = [RoleHandler.to_dict(r) for r in model.roles]
        if len(model.orders) > 0:
            as_dict['cart'] = OrderHandler.to_dict(model.orders[-1])
        else:
            as_dict['cart'] = []
        if len(model.likes) > 0:
            as_dict['likes'] = [SkuHandler.to_dict(s) for s in model.likes]
        else:
            as_dict['likes'] = []
        return as_dict

    @staticmethod
    def all_customers():
        users = [UserHandler.from_id(id) for id in UserHandler.all_ids()]
        return [UserHandler.to_dict(user) for user in users if UserHandler.is_customer(user)]

    @staticmethod
    def from_email(email: str):
        return User.query.filter(User.personal_email.any(email_address=email)).first()

    @staticmethod
    def is_customer(user: User):
        return any(r.title == 'Customer' for r in user.roles)

    @staticmethod
    def is_admin(user: User):
        return any(r.title == 'Admin' for r in user.roles)

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
            print(bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')))
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
    def is_valid_session(email, token, app):
        '''Determines if the provided email and token combination
        makes a valid user session
        Returns a dict containing:
            1) a boolean indicating if the user is a customer
            2) the error message, if boolean is false
            3) the user object, if boolean is true'''
        # First, try to find the user associated with the email
        user = UserHandler.from_email(email)
        if not user:
            return {
                'valid': False,
                'error': 'No user with that email'
            }
        # Check if supplied token is equal to the user's token
        if not token == user.session_token or not verify_token(app, user.session_token):
            return {
                'valid': False,
                'error': 'Invalid token'
            }
        # Check if the user 
        return {
            'valid': True,
            'user': user
        }

    @staticmethod
    def get_profile_data(email, token, app):
        '''Returns user profile data'''
        session_check = UserHandler.is_valid_session(email, token, app)
        # Check if user esists
        user = UserHandler.from_email(email)
        if not session_check['valid'] or not user:
            return None
        return {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "pronouns": user.pronouns,
            "theme": user.theme,
            "personal_email": [EmailHandler.to_dict(email) for email in user.personal_email],
            "personal_phone": [PhoneHandler.to_dict(number) for number in user.personal_phone],
            "image_file": user.image_file,
            "orders": [OrderHandler.to_dict(order) for order in user.orders],
            "roles": [RoleHandler.to_dict(role) for role in user.roles],
            "likes": [SkuHandler.to_dict(sku) for sku in user.likes]
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

    @staticmethod
    def get_cart(user: User):
        '''Returns the user's cart, or None'''
        if user is None or not UserHandler.is_customer(user):
            return None
        cart = None
        if len(user.orders) == 0:
            cart = OrderHandler.create(user.id)
            db.session.add(cart)
            user.orders.append(cart)
            db.session.commit()
        else:
            cart = user.orders[-1]
        return cart

    @staticmethod
    def submit_order(user: User):
        '''Submits the user's cart. Returns true if successful'''
        # Get cart
        cart = UserHandler.get_cart(user)
        # If cart is empty, don't submit
        if len(cart.items) <= 0:
            return False
        cart.status = OrderStatus.PENDING.value
        # Add a new, empty order to serve as the user's next cart
        cart = OrderHandler.create(user.id)
        db.session.add(cart)
        user.orders.append(cart)
        db.session.commit()
        return True
