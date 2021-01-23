from src.handlers.handler import Handler
from src.models import Phone


class PhoneHandler(Handler):

    @staticmethod
    def model_type():
        return Phone

    @staticmethod
    def all_fields():
        return ['unformatted_number', 'country_code', 'is_mobile', 'receives_delivery_updates']

    @staticmethod
    def required_fields():
        return ['unformatted_number']

    @staticmethod
    def to_dict(model: Phone):
        return Handler.simple_fields_to_dict(model, PhoneHandler.all_fields())
