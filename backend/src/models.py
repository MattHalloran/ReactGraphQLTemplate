# Common model imports
from src.api import db
from enum import Enum
from sqlalchemy import Column, Integer, String, DECIMAL, Float, Boolean, ForeignKey
import time
from src.utils import salt


# Used to help prevent typos. You may be wondering if you could
# use TABLE.__tablename__ instead, and the answer is no. This would
# cause two-way coupling, and python doesn't support forward declarations
# Enum = class name, value = table name
class Tables(Enum):
    # Normal tables
    ADDRESS = 'address'
    BUSINESS = 'business'
    BUSINESS_DISCOUNT = 'business_discount'
    CONTACT_INFO = 'contact_info'
    EMAIL = 'email'
    FEEDBACK = 'feedback'
    IMAGE = 'image'
    ORDER = 'order'
    ORDER_ITEM = 'order_item'
    PHONE = 'phone'
    PLANT = 'plant'
    PLANT_TRAIT = 'plant_trait'
    PLANT_TRAIT_ASSOCIATION = 'plant_trait_association'
    ROLE = 'role'
    SIZE = 'size'
    SKU = 'sku'
    SKU_DISCOUNT = 'sku_discount'
    USER = 'user'
    # Joining tables
    BUSINESS_DISCOUNTS = 'business_discounts'
    PLANT_TRAITS = 'plant_traits'
    SKU_DISCOUNTS = 'sku_discounts'
    SKU_SIZES = 'sku_sizes'
    USER_ROLES = 'user_roles'


# A joining table for the two-way relationship between users and roles.
# A user can have many roles, and a role can be shared by many users
userRoles = db.Table(Tables.USER_ROLES.value,
                     Column('id', Integer, primary_key=True),
                     Column('user_id', Integer, ForeignKey(f'{Tables.USER.value}.id')),
                     Column('role_id', Integer, ForeignKey(f'{Tables.ROLE.value}.id'))
                     )

# A joining table for the many-to-many relationship
# between user discounts and businesses
businessDiscounts = db.Table(Tables.BUSINESS_DISCOUNTS.value,
                             Column('id', Integer, primary_key=True),
                             Column('business_id', Integer, ForeignKey(f'{Tables.BUSINESS.value}.id')),
                             Column('business_discount_id', Integer, ForeignKey(f'{Tables.BUSINESS_DISCOUNT.value}.id'))
                             )

# A joining table for the many-to-many relationship
# between SKUs and their discounts
skuDiscounts = db.Table(Tables.SKU_DISCOUNTS.value,
                        Column('id', Integer, primary_key=True),
                        Column('sku_id', Integer, ForeignKey(f'{Tables.SKU.value}.id')),
                        Column('sku_discount_id', Integer, ForeignKey(f'{Tables.SKU_DISCOUNT.value}.id'))
                        )

# A joining table for the two-way relationship between skus and sizes.
skuSizes = db.Table(Tables.SKU_SIZES.value,
                    Column('id', Integer, primary_key=True),
                    Column('sku_id', Integer, ForeignKey(f'{Tables.SKU.value}.id')),
                    Column('size_id', Integer, ForeignKey(f'{Tables.SIZE.value}.id'))
                    )

# A joining table for the two-way relationship between skus and sizes.
plantTraits = db.Table(Tables.PLANT_TRAITS.value,
                       Column('id', Integer, primary_key=True),
                       Column('plant_id', Integer, ForeignKey(f'{Tables.PLANT.value}.id')),
                       Column('trait_id', Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
                       )


# One of the delivery addresses associated with a business
class Address(db.Model):
    # Default values for fields in __init__
    defaults = {
        'country': 'US'
    }

    __tablename__ = Tables.ADDRESS.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    # Optional tag associated with address (ex: 'Main address')
    tag = Column(String(100))
    # Optional name, sometimes required for internal mail delivery systems
    name = Column(String(100))
    # ISO 3166 country code
    country = Column(String(2), nullable=False, default=defaults['country'])
    # State/Province/Region (ISO code when available [ex: NJ])
    administrative_area = Column(String(30), nullable=False)
    # County/District (currently unused)
    sub_administrative_area = Column(String(30))
    # City/Town
    locality = Column(String(50), nullable=False)
    # Postal/Zip code
    postal_code = Column(String(10), nullable=False)
    # Street Address
    throughfare = Column(String(150), nullable=False)
    # Apartment, Suite, P.O. box number, etc.
    premise = Column(String(20))
    # Any special delivery instructions the user would like to add
    delivery_instructions = Column(String(1000))
    user_id = db.Column(Integer, ForeignKey(f'{Tables.USER.value}.id'))
    business_id = db.Column(Integer, ForeignKey(f'{Tables.BUSINESS.value}.id'))
    # ----------------End columns-------------------

    def __init__(self,
                 tag: str,
                 name: str,
                 country: str,
                 administrative_area: str,
                 locality: str,
                 postal_code: str,
                 throughfare: str,
                 premise: str,
                 delivery_instructions: str):
        self.tag = tag
        self.name = name
        self.country = country
        self.administrative_area = administrative_area
        self.locality = locality
        self.postal_code = postal_code
        self.throughfare = throughfare
        self.premise = premise
        self.delivery_instructions = delivery_instructions

    def __repr__(self):
        return f"{self.__tablename__}({self.presmise})"


class BusinessDiscount(db.Model):
    # Default values for fields in __init__
    defaults = {
        'discount': 0
    }

    __tablename__ = Tables.BUSINESS_DISCOUNT.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    # A number between 0 < 1, representing the discount percent in dollars (at least currently)
    discount = Column(DECIMAL(4, 4), nullable=False, default=defaults['discount'])
    # A short string explaining what the discount is for
    title = Column(String(100), nullable=False)
    comment = Column(String(1000))
    # Terms and conditions that apply to the discount
    terms = Column(String(5000))
    # ----------------End columns-------------------

    def __init__(self, discount: float, title: str, comment: str, terms: str):
        self.discount = discount
        self.title = title
        self.comment = comment
        self.terms = terms

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.title}')"


# For storing current and old contact info states
class ContactInfo(db.Model):
    __tablename__ = Tables.CONTACT_INFO.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    time_set = Column(Float, nullable=False, default=time.time())  # In UTC seconds
    monday = Column(String(200), nullable=False)
    tuesday = Column(String(200), nullable=False)
    wednesday = Column(String(200), nullable=False)
    thursday = Column(String(200), nullable=False)
    friday = Column(String(200), nullable=False)
    saturday = Column(String(200), nullable=False)
    sunday = Column(String(200), nullable=False)
    # ----------------End columns-------------------

    def __init__(self,
                 name: str,
                 monday: str,
                 tuesday: str,
                 wednesday: str,
                 thursday: str,
                 friday: str,
                 saturday: str,
                 sunday: str):
        self.time_set = time.time()
        self.name = name
        self.monday = monday
        self.tuesday = tuesday
        self.wednesday = wednesday
        self.thursday = thursday
        self.friday = friday
        self.saturday = saturday
        self.sunday = sunday

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}')"


# Stores information related to an email address
class Email(db.Model):
    # Default values for fields in __init__
    defaults = {
        'receives_delivery_updates': True
    }

    __tablename__ = Tables.EMAIL.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    email_address = Column(String(100), nullable=False, unique=True)
    receives_delivery_updates = Column(Boolean, default=defaults['receives_delivery_updates'])
    user_id = db.Column(Integer, ForeignKey(f'{Tables.USER.value}.id'))
    business_id = db.Column(Integer, ForeignKey(f'{Tables.BUSINESS.value}.id'))
    # ----------------End columns-------------------

    def __init__(self, email_address: str, receives_delivery_updates: bool):
        self.email_address = email_address
        self.receives_delivery_updates = receives_delivery_updates

    def __repr__(self):
        return f"{self.__tablename__}({self.email_address})"


# Allows users to give feedback about the website or business
class Feedback(db.Model):
    __tablename__ = Tables.FEEDBACK.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    text = Column(String(5000), nullable=False)
    user_id = db.Column(Integer, ForeignKey(f'{Tables.USER.value}.id'))
    # ----------------End columns-------------------

    def __init__(self, text: str):
        self.text = text

    def __repr__(self):
        return f"{self.__tablename__}({self.id})'"


class ImageUses(Enum):
    HERO = 1
    GALLERY = 2
    PLANT_FLOWER = 3
    PLANT_LEAF = 4
    PLANT_FRUIT = 5
    PLANT_BARK = 6
    PLANT_HABIT = 7


# Stores metadata for images used on website (gallery, plants, etc), but NOT profile pictures
class Image(db.Model):
    __tablename__ = Tables.IMAGE.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    directory = Column(String(250), nullable=False)
    file_name = Column(String(100), nullable=False)
    thumbnail_file_name = Column(String(100), nullable=False)
    extension = Column(String(10), nullable=False)
    alt = Column(String(100))
    hash = Column(String(100), unique=True, nullable=False)
    used_for = Column(Integer, nullable=False)
    width = Column(Integer, nullable=False)
    height = Column(Integer, nullable=False)
    plant_id = db.Column(Integer, ForeignKey(f'{Tables.PLANT.value}.id'))
    # ---------------End columns-----------------

    SUPPORTED_IMAGE_TYPES = ['bmp', 'gif', 'png', 'jpg', 'jpeg', 'ico']

    def __init__(self,
                 directory: str,
                 file_name: str,
                 thumbnail_file_name: str,
                 extension: str,
                 alt: str,
                 hash: str,
                 used_for: ImageUses,
                 width: int,
                 height: int):
        if extension not in self.SUPPORTED_IMAGE_TYPES:
            raise Exception('File extension not supported for images')
        if used_for not in ImageUses:
            raise Exception('Must pass a valid used_for value')
        self.directory = directory
        self.file_name = file_name
        self.thumbnail_file_name = thumbnail_file_name
        self.extension = extension
        self.alt = alt
        self.hash = hash
        self.used_for = used_for.value
        self.width = width
        self.height = height

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.file_name}')"


# Stores information related to a phone number
class Phone(db.Model):
    # Default values for fields in __init__
    defaults = {
        'country_code': '+1',
        'is_mobile': True,
        'receives_delivery_updates': True
    }

    __tablename__ = Tables.PHONE.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    # ex: could be (555) 867-5309, 555-867-5309, 5558675309, etc. DOES NOT INCLUDE COUNTRY CODE
    unformatted_number = Column(String(50), nullable=False, unique=True)
    country_code = Column(String(10), default=defaults['country_code'])
    carrier = Column(String(50))  # Currently unused
    is_mobile = Column(Boolean, default=defaults['is_mobile'])
    receives_delivery_updates = Column(Boolean, default=defaults['receives_delivery_updates'])
    user_id = db.Column(Integer, ForeignKey(f'{Tables.USER.value}.id'))
    business_id = db.Column(Integer, ForeignKey(f'{Tables.BUSINESS.value}.id'))
    # ----------------End columns-------------------

    def __init__(self,
                 unformatted_number: str,
                 country_code: str,
                 is_mobile: bool,
                 receives_delivery_updates: bool):
        self.unformatted_number = unformatted_number
        self.country_code = country_code
        self.is_mobile = is_mobile
        self.receives_delivery_updates = receives_delivery_updates

    def __repr__(self):
        return f"{self.__tablename__}({self.unformatted_number()})"


class PlantTraitOptions(Enum):
    DROUGHT_TOLERANCE = 'Drought tolerance'
    GROWN_HEIGHT = 'Grown height'
    GROWN_SPREAD = 'Grown spread'
    GROWTH_RATE = 'Growth rate'
    JERSERY_NATIVE = 'Jersey native'
    OPTIMAL_LIGHT = 'Optimal light'
    PLANT_TYPE = 'Plant type'
    SALT_TOLERANCE = 'Salt tolerance'
    ATTRACTS_POLLINATORS_AND_WILDLIFE = 'Attracts pollinators and wildlife'
    BLOOM_TIME = 'Bloom time'
    BLOOM_COLOR = 'Bloom color'
    ZONE = 'Zone'
    PHYSIOGRAPHIC_REGION = 'Physiographic Region'
    SOIL_MOISTURE = 'Soil Moisture'
    SOIL_PH = 'Soil PH'
    SOIL_TYPE = 'Soil Type'
    LIGHT_RANGE = 'Light Range'


# class PlantTraitAssociation(db.Model):
#     __tablename__ = Tables.PLANT_TRAIT_ASSOCIATION
#     # ---------------Start columns-----------------
#     plant_id = Column(Integer, ForeignKey(f'{Tables.PLANT.value}.id'), primary_key=True)
#     trait_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'), primary_key=True)
#     # ----------------End columns-------------------
#     plant = db.relationship('Plant', uselist=False)
#     trait = db.relationship('PlantTrait', back_populates='plants')

#     def __repr__(self):
#         return f"{self.__tablename__}({self.plant_id}, {self.trait_id})"


class PlantTrait(db.Model):
    __tablename__ = Tables.PLANT_TRAIT.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    trait = Column(String(50), nullable=False)
    value = Column(String(250), nullable=False)
    # ----------------End columns-------------------
    #plants = db.relationship('PlantTraitAssociation', back_populates='trait')

    def __init__(self, trait: str, value: str):
        self.trait = trait
        self.value = value

    def __repr__(self):
        return f"{self.__tablename__}({self.id}, {self.trait}, {self.value})"


class Plant(db.Model):
    __tablename__ = Tables.PLANT.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    latin_name = Column(String(100), unique=True, nullable=False)
    common_name = Column(String(100))
    plantnet_url = Column(String(250))
    yards_url = Column(String(250))
    description = Column(String(5000))
    jersey_native = Column(Boolean)

    deer_resistance_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    drought_tolerance_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    grown_height_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    grown_spread_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    growth_rate_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    optimal_light_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    salt_tolerance_id = Column(Integer, ForeignKey(f'{Tables.PLANT_TRAIT.value}.id'))
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-one relationships
    deer_resistance = db.relationship('PlantTrait', uselist=False, foreign_keys=[deer_resistance_id])
    drought_tolerance = db.relationship('PlantTrait', uselist=False, foreign_keys=[drought_tolerance_id])
    grown_height = db.relationship('PlantTrait', uselist=False, foreign_keys=[grown_height_id])
    grown_spread = db.relationship('PlantTrait', uselist=False, foreign_keys=[grown_spread_id])
    growth_rate = db.relationship('PlantTrait', uselist=False, foreign_keys=[growth_rate_id])
    optimal_light = db.relationship('PlantTrait', uselist=False, foreign_keys=[optimal_light_id])
    salt_tolerance = db.relationship('PlantTrait', uselist=False, foreign_keys=[salt_tolerance_id])
    # One-to-many relationships
    flower_images = db.relationship('Image', lazy=True,
                                    primaryjoin=f"and_(Plant.id==Image.plant_id, Image.used_for=='{ImageUses.PLANT_FLOWER.value}')")
    leaf_images = db.relationship('Image', lazy=True,
                                  primaryjoin=f"and_(Plant.id==Image.plant_id, Image.used_for=='{ImageUses.PLANT_LEAF.value}')")
    fruit_images = db.relationship('Image', lazy=True,
                                   primaryjoin=f"and_(Plant.id==Image.plant_id, Image.used_for=='{ImageUses.PLANT_FRUIT.value}')")
    bark_images = db.relationship('Image', lazy=True,
                                  primaryjoin=f"and_(Plant.id==Image.plant_id, Image.used_for=='{ImageUses.PLANT_BARK.value}')")
    habit_images = db.relationship('Image', lazy=True,
                                   primaryjoin=f"and_(Plant.id==Image.plant_id, Image.used_for=='{ImageUses.PLANT_HABIT.value}')")
    # Many-to-many relationships
    attracts_pollinators_and_wildlifes = db.relationship('PlantTrait',
                                                         secondary=plantTraits,
                                                         primaryjoin=id == plantTraits.c.plant_id,
                                                         secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                                         PlantTrait.trait == PlantTraitOptions.ATTRACTS_POLLINATORS_AND_WILDLIFE.value)
    bloom_times = db.relationship('PlantTrait',
                                  secondary=plantTraits,
                                  primaryjoin=id == plantTraits.c.plant_id,
                                  secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                  PlantTrait.trait == PlantTraitOptions.BLOOM_TIME.value)
    bloom_colors = db.relationship('PlantTrait',
                                   secondary=plantTraits,
                                   primaryjoin=id == plantTraits.c.plant_id,
                                   secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                   PlantTrait.trait == PlantTraitOptions.BLOOM_COLOR.value)
    zones = db.relationship('PlantTrait',
                            secondary=plantTraits,
                            primaryjoin=id == plantTraits.c.plant_id,
                            secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                            PlantTrait.trait == PlantTraitOptions.ZONE.value)
    plant_types = db.relationship('PlantTrait',
                                  secondary=plantTraits,
                                  primaryjoin=id == plantTraits.c.plant_id,
                                  secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                  PlantTrait.trait == PlantTraitOptions.PLANT_TYPE.value)
    physiographic_regions = db.relationship('PlantTrait',
                                            secondary=plantTraits,
                                            primaryjoin=id == plantTraits.c.plant_id,
                                            secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                            PlantTrait.trait == PlantTraitOptions.PHYSIOGRAPHIC_REGION.value)
    soil_moistures = db.relationship('PlantTrait',
                                     secondary=plantTraits,
                                     primaryjoin=id == plantTraits.c.plant_id,
                                     secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                     PlantTrait.trait == PlantTraitOptions.SOIL_MOISTURE.value)
    soil_phs = db.relationship('PlantTrait',
                               secondary=plantTraits,
                               primaryjoin=id == plantTraits.c.plant_id,
                               secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                               PlantTrait.trait == PlantTraitOptions.SOIL_PH.value)
    soil_types = db.relationship('PlantTrait',
                                 secondary=plantTraits,
                                 primaryjoin=id == plantTraits.c.plant_id,
                                 secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                 PlantTrait.trait == PlantTraitOptions.SOIL_TYPE.value)
    light_ranges = db.relationship('PlantTrait',
                                   secondary=plantTraits,
                                   primaryjoin=id == plantTraits.c.plant_id,
                                   secondaryjoin=PlantTrait.id == plantTraits.c.trait_id and
                                   PlantTrait.trait == PlantTraitOptions.LIGHT_RANGE.value)
    # -------------End relationships----------------

    def __init__(self, latin_name: str):
        self.latin_name = latin_name

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.latin_name}', '{self.common_name}')"


class SkuDiscount(db.Model):
    # Default values for fields in __init__
    defaults = {
        'discount': 0
    }

    __tablename__ = Tables.SKU_DISCOUNT.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    # A number between 0 < 1, representing the discount percent in dollars (at least currently)
    discount = Column(DECIMAL(4, 4), nullable=False, default=defaults['discount'])
    # A short string explaining what the discount is for
    title = Column(String(100), nullable=False)
    comment = Column(String(1000))
    # Terms and conditions that apply to the discount
    terms = Column(String(5000))
    # ----------------End columns-------------------

    def __init__(self, discount: float, title: str, comment: str, terms: str):
        self.discount = discount
        self.title = title
        self.comment = comment
        self.terms = terms

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.title}')"


class Size(db.Model):
    __tablename__ = Tables.SIZE.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    size = Column(String(25), nullable=False, unique=True)
    # ----------------End columns-------------------

    def __init__(self, size: str):
        self.size = size

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.size}')"


# An item available for sale
class Sku(db.Model):
    # Default values for fields in __init__
    defaults = {
        'availability': 0,
        'is_discountable': True
    }

    __tablename__ = Tables.SKU.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    sku = Column(String(32), nullable=False)
    availability = Column(Integer, nullable=False, default=defaults['availability'])
    is_discountable = Column(Boolean, nullable=False, default=defaults['is_discountable'])
    plant_id = db.Column(Integer, ForeignKey(f'{Tables.PLANT.value}.id'))
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-one relationship
    plant = db.relationship('Plant', uselist=False, foreign_keys=[plant_id])
    # Many-to-many relationships
    sizes = db.relationship('Size', secondary=skuSizes, backref='users')
    discounts = db.relationship('SkuDiscount', secondary=skuDiscounts, backref='plants')
    # -------------End relationships----------------

    def __init__(self, availability: int, is_discountable: bool, plant: Plant):
        self.sku = salt(32)
        self.availability = availability
        self.is_discountable = is_discountable
        self.plant = plant

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.availability}')"


class OrderStatus(Enum):
    CANCELED = -2
    REJECTED = -1
    PENDING = 0
    APPROVED = 1
    SCHEDULED = 2
    IN_TRANSIT = 3
    DELIVERED = 4


class OrderItem(db.Model):
    # Default values for fields in __init__
    defaults = {
        'quantity': 1
    }

    __tablename__ = Tables.ORDER_ITEM.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    quantity = Column(Integer, nullable=False, default=defaults['quantity'])
    order_id = db.Column(Integer, ForeignKey(f'{Tables.ORDER.value}.id'))
    sku_id = db.Column(Integer, ForeignKey(f'{Tables.SKU.value}.id'))
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-one relationship
    sku = db.relationship('Sku', uselist=False, foreign_keys=[sku_id])
    # -------------End relationships----------------

    def __init__(self, quantity: int, sku: Sku):
        self.quantity = quantity
        self.sku = sku

    def __repr__(self):
        return f"{self.__tablename__}({self.sku})"


class Order(db.Model):
    __tablename__ = Tables.ORDER.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    status = Column(Integer, nullable=False, default=OrderStatus.PENDING.value)
    special_instructions = Column(String)
    desired_delivery_date = Column(Float, nullable=False)
    delivery_address_id = db.Column(Integer, ForeignKey(f'{Tables.ADDRESS.value}.id'))
    user_id = db.Column(Integer, ForeignKey(f'{Tables.USER.value}.id'))
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-one relationship
    delivery_address = db.relationship('Address', uselist=False, foreign_keys=[delivery_address_id])
    # One-to-many relationship
    items = db.relationship('OrderItem', backref='Order', lazy=True)
    # -------------End relationships----------------

    def __init__(self,
                 delivery_address: Address,
                 special_instructions: str,
                 desired_delivery_date: float,
                 items):
        self.delivery_address = delivery_address
        self.special_instructions = special_instructions
        self.desired_delivery_date = desired_delivery_date
        self.items = items

    def __repr__(self):
        return f"{self.__tablename__}({self.id})"


# Roles assigned to an account. Current options are:
# 1) Customer
# 2) Admin
class Role(db.Model):
    __tablename__ = Tables.ROLE.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    title = Column(String(20), unique=True, nullable=False)
    description = Column(String(2000))
    # ----------------End columns-------------------

    def __init__(self, title: str, description: str):
        self.title = title
        self.description = description

    def __repr__(self):
        return f"{self.__tablename__}({self.title}, {self.description})"


class AccountStatus(Enum):
    UNLOCKED = 1
    WAITING_APPROVAL = 2
    SOFT_LOCK = 3
    HARD_LOCK = 4


# All users of the system, such as customers and admins
class User(db.Model):
    # Default values for fields in __init__
    defaults = {
        'pronouns': 'they/them/theirs',
        'theme': 'light',
        'image_file': 'default.jpg',
    }

    __tablename__ = Tables.USER.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    first_name = Column(String(30), nullable=False)
    last_name = Column(String(30), nullable=False)
    pronouns = Column(String(50), nullable=False, default=defaults['pronouns'])
    theme = Column(String(20), nullable=False, default=defaults['theme'])
    image_file = Column(String(20), nullable=False, default=defaults['image_file'])
    password = Column(String(255), nullable=False)
    login_attempts = Column(Integer, nullable=False, default=0)
    last_login_attempt = Column(Float, nullable=False, default=time.time())  # UTC seconds since epoch
    session_token = Column(String(250))
    account_status = Column(Integer, nullable=False, default=0)
    business_id = db.Column(Integer, ForeignKey(f'{Tables.BUSINESS.value}.id'))
    cart_id = db.Column(Integer, ForeignKey(f'{Tables.ORDER.value}.id'))
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-one relationship
    cart = db.relationship('Order', uselist=False, foreign_keys=[cart_id])
    # One-to-many relationships
    personal_phone = db.relationship('Phone', backref='user')
    personal_email = db.relationship('Email', backref='user')
    orders = db.relationship('Order', backref='customer', foreign_keys=[Order.user_id], lazy=True)
    feedbacks = db.relationship('Feedback', backref='user')
    # Many-to-many relationship
    roles = db.relationship('Role', secondary=userRoles, backref='users', lazy=True)
    # -------------End relationships----------------

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
        # If they've ordered from here before (but before online ordering was available),
        # they are allowed to shop before approval
        if existing_customer:
            self.account_status = AccountStatus.UNLOCKED.value
        else:
            self.account_status = AccountStatus.WAITING_APPROVAL.value

    @staticmethod
    def hashed_password(password: str):
        import bcrypt
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def __repr__(self):
        return f"{self.__tablename__}({self.id})"


# Orders are submitted via businesses.
# Each business has one or more users
class Business(db.Model):
    # Default values for fields in __init__
    defaults = {
        'subscribed_to_newsletters': True,
    }

    __tablename__ = Tables.BUSINESS.value
    # ---------------Start columns-----------------
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    subscribed_to_newsletters = Column(Boolean, default=defaults['subscribed_to_newsletters'])
    # ----------------End columns-------------------
    # ------------Start relationships---------------
    # One-to-many relationships
    phones = db.relationship('Phone', backref='business')
    emails = db.relationship('Email', backref='business')
    delivery_addresses = db.relationship('Address', backref='business')
    employees = db.relationship('User', backref='employer', lazy=True)
    # Many-to-many relationship
    # Discounts only apply to discountable items
    discounts = db.relationship('BusinessDiscount', secondary=businessDiscounts, backref='businesses')
    # -------------End relationships----------------

    def __init__(self, name: str, email: Email, phone: Phone, subscribed_to_newsletters: bool):
        self.emails.append(email)
        self.phones.append(phone)
        self.name = name
        self.subscribed_to_newsletters = subscribed_to_newsletters

    def __repr__(self):
        return f"{self.__tablename__}({self.name})"
