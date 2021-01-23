from src.handlers.handler import Handler
from src.models import ContactInfo


class ContactInfoHandler(Handler):

    @staticmethod
    def model_type():
        return ContactInfo

    @staticmethod
    def all_fields():
        return ['name', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

    @staticmethod
    def required_fields():
        return []

    @staticmethod
    def to_dict(model: ContactInfo):
        return Handler.simple_fields_to_dict(model, ContactInfoHandler.all_fields())
