from src.handlers.handler import Handler
from src.models import Email


class EmailHandler(Handler):

    @staticmethod
    def model_type():
        return Email

    @property
    def all_fields(self):
        return ['email_address', 'received_delivery_updates']

    @property
    def required_fields(self):
        return ['email_address']

    @staticmethod
    def to_dict(model: Email):
        return Handler.simple_fields_to_dict(model, EmailHandler.all_fields)
