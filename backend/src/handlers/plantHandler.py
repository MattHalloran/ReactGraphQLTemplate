from src.api import db
from src.handlers.handler import Handler
from src.handlers.imageHandler import ImageHandler
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

        def array_to_dict(model_dict: dict, to_dict, field: str, key=None):
            '''Helper method for creating json data from an array'''
            if not key:
                key = field
            data = getattr(model, field, None)
            if not data:
                return
            if len(data) > 0:
                model_dict[key] = [to_dict(d) for d in data]

        def img_array_to_dict(model_dict: dict, field: str, key=None):
            array_to_dict(model_dict, ImageHandler.to_dict, field, key)

        def trait_array_to_dict(model_dict: dict, field: str, key=None):
            array_to_dict(model_dict, PlantTraitHandler.to_dict, field, key)

        as_dict = Handler.simple_fields_to_dict(model, PlantHandler.all_fields())

        img_fields = ['flower_images', 'leaf_images', 'fruit_images',
                      'bark_images', 'habit_images']
        [img_array_to_dict(as_dict, field) for field in img_fields]

        trait_fields = ['attracts_pollinators_and_wildlifes', 'bloom_times', 'bloom_colors',
                        'zones', 'plant_types', 'physiographic_regions', 'soil_moistures',
                        'soil_phs', 'soil_types', 'light_ranges']
        [trait_array_to_dict(as_dict, field) for field in trait_fields]

        return as_dict
