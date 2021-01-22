from src.handlers.handler import Handler
from src.models import ContactInfo


class ContactInfoHandler(Handler):

    @staticmethod
    def model_type():
        return ContactInfo

    @property
    def all_fields(self):
        return ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    @property
    def required_fields(self):
        return []

    @staticmethod
    def to_dict(model: ContactInfo):
        return Handler.simple_fields_to_dict(model, ContactInfoHandler.all_fields)
