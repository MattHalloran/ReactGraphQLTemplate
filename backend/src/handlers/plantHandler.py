from src.api import db
from src.handlers.handler import Handler
from src.models import Plant, PlantTrait, PlantTraitOptions


class PlantTraitHandler(Handler):

    @staticmethod
    def model_type():
        return PlantTrait

    @staticmethod
    def all_fields():
        return ['trait', 'value']

    @staticmethod
    def required_fields():
        return ['trait', 'value']

    @staticmethod
    def to_dict(model: PlantTrait):
        return Handler.simple_fields_to_dict(model, PlantTraitHandler.all_fields())

    @staticmethod
    def from_values(trait: PlantTraitOptions, value: str):
        '''Returns the PlantTrait object that matches the specified values, or None'''
        return db.session.query(PlantTrait).filter_by(trait=trait.value, value=value).one_or_none()


class PlantHandler(Handler):

    @staticmethod
    def model_type():
        return Plant

    @staticmethod
    def all_fields():
        return ['latin_name', 'common_name', 'plantnet_url', 'yards_url', 'description',
                'jersey_native', 'drought_tolerance_id', 'grown_height_id',
                'grown_spread_id', 'growth_rate_id', 'optimal_light_id', 'salt_tolerance_id']

    @staticmethod
    def required_fields():
        return ['latin_name']

    @staticmethod
    def to_dict(model: Plant):
        return Handler.simple_fields_to_dict(model, PlantHandler.all_fields())
