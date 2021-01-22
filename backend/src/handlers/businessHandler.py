from src.handlers.handler import Handler
from src.handlers.addressHandler import AddressHandler
from src.handlers.userHandler import UserHandler
from src.handlers.phoneHandler import PhoneHandler
from src.handler.emailHandler import EmailHandler
from src.models import BusinessDiscount, Business
from src.models import Address
from src.models import User


class BusinessDiscountHandler(Handler):

    @staticmethod
    def model_type():
        return BusinessDiscount

    @property
    def all_fields(self):
        return ['discount', 'title', 'comment', 'terms']

    @property
    def required_fields(self):
        return ['discount', 'title']

    @staticmethod
    def to_dict(model: BusinessDiscount):
        return Handler.simple_fields_to_dict(model, BusinessDiscountHandler.all_fields)


class BusinessHandler(Handler):

    @staticmethod
    def model_type():
        return Business

    @property
    def all_fields(self):
        return ['name', 'email', 'Email', 'phone', 'subscribed_to_newsletters']

    @property
    def required_fields(self):
        return ['name']

    @staticmethod
    def to_dict(model: Business):
        as_dict = Handler.simple_fields_to_dict(model, ['name', 'subscribed_to_newsletters'])
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
