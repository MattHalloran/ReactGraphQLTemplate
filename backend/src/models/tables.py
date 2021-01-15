from enum import Enum


# Enum = class name, value = table name
class Tables(Enum):
    PLANT = 'plant'
    SIZE = 'size'
    PLANT_SIZES = 'plant_sizes'
    ADDRESS = 'address'
    BUSINESS = 'business'
    USER = 'user'
    ORDER = 'order'
    DISCOUNT = 'discount'
    ROLE = 'role'
    USER_ROLES = 'user_roles'
    BUSINESS_DISCOUNTS = 'business_discounts'
    ITEM_DISCOUNTS = 'item_discounts'
    ORDER_ITEM = 'order_item'
    FEEDBACK = 'feedback'
    IMAGE = 'image'
    CONTACT_INFO = 'contact_info'
    PHONE = 'phone'
    EMAIL = 'email'
