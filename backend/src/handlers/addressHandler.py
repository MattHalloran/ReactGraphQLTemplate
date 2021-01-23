from src.handlers.handler import Handler
from src.models import Address


class AddressHandler(Handler):

    @staticmethod
    def model_type():
        return Address

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
        return Handler.simple_fields_to_dict(model, AddressHandler.all_fields())
