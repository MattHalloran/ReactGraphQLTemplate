from src.handlers.handler import Handler
from src.models import Role


class RoleHandler(Handler):

    @staticmethod
    def model_type():
        return Role

    @property
    def all_fields(self):
        return ['title', 'description']

    @property
    def required_fields(self):
        return ['title']

    @staticmethod
    def to_dict(model):
        return Handler.simple_fields_to_dict(model, RoleHandler.all_fields)

    @staticmethod
    def get_customer_role():
        return Role.query.filter_by(title='Customer').first()

    @staticmethod
    def get_admin_role():
        return Role.query.filter_by(title='Admin').first()
