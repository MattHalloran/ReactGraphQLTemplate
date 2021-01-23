from src.handlers.Handler import Handler
from src.models import Feedback


class FeedbackHandler(Handler):

    @staticmethod
    def model_type():
        return Feedback

    @staticmethod
    def all_fields():
        return ['text']

    @staticmethod
    def required_fields():
        return ['text']

    @staticmethod
    def to_dict(model: Feedback):
        return Handler.simple_fields_to_dict(model, FeedbackHandler.all_fields())
