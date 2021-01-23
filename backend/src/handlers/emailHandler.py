from src.handlers.handler import Handler
from src.models import Email


class EmailHandler(Handler):

    @staticmethod
    def model_type():
        return Email

    @staticmethod
    def all_fields():
        return ['email_address', 'received_delivery_updates']

    @staticmethod
    def required_fields():
        return ['email_address']

    @staticmethod
    def to_dict(model: Email):
        return Handler.simple_fields_to_dict(model, EmailHandler.all_fields())
