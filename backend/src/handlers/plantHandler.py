from src.handlers.handler import Handler
from src.models import Plant


class PlantHandler(Handler):

    @staticmethod
    def model_type():
        return Plant

    @property
    def all_fields(self):
        return ['latin_name', 'common_name', 'description', 'fragrant',
                'zone', 'width', 'height', 'deer_resistant', 'growth_rate',
                'attract', 'bark_type', 'exposure', 'bloom_type', 'leaf_color',
                'fall_leaf_color']

    @property
    def required_fields(self):
        return ['latin_name']

    @staticmethod
    def to_dict(model: Plant):
        return Handler.simple_fields_to_dict(model, PlantHandler.all_fields)
