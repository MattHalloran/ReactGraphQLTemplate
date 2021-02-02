from src.api import db
from src.handlers.handler import Handler
from src.handlers.imageHandler import ImageHandler
from src.handlers.plantHandler import PlantHandler
from src.models import SkuDiscount, Sku, Size, Image


class SkuDiscountHandler(Handler):

    @staticmethod
    def model_type():
        return SkuDiscount

    @staticmethod
    def all_fields():
        return ['discount', 'title', 'comment', 'terms']

    @staticmethod
    def required_fields():
        return ['discount', 'title']

    @staticmethod
    def to_dict(model: SkuDiscount):
        return Handler.simple_fields_to_dict(model, SkuDiscountHandler.all_fields())


class SizeHandler(Handler):

    @staticmethod
    def model_type():
        return Size

    @staticmethod
    def all_fields():
        return ['size', 'availability']

    @staticmethod
    def required_fields():
        return ['size']

    @staticmethod
    def to_dict(model: Size):
        Handler.simple_fields_to_dict(model, SizeHandler.all_fields())


class SkuHandler(Handler):

    @staticmethod
    def model_type():
        return Sku

    @staticmethod
    def all_fields():
        return ['is_discountable', 'plant']

    @staticmethod
    def required_fields():
        return ['plant']

    @staticmethod
    def to_dict(model: Sku):
        as_dict = Handler.simple_fields_to_dict(model, ['is_discountable', 'sku'])
        as_dict['display_image'] = SkuHandler.get_display_image(model)
        as_dict['plant'] = PlantHandler.to_dict(model.plant)
        as_dict['sizes'] = [SizeHandler.to_dict(size) for size in model.sizes]
        as_dict['discounts'] = [SkuDiscountHandler.to_dict(discount) for discount in model.discounts]
        return as_dict

    @staticmethod
    def set_display_image(model: Sku, image: Image):
        model.display_image = image
        model.display_img_id = image.id

    @staticmethod
    def get_display_image(model: Sku):
        '''Returns a base64 string of the Sku's display image. If none is set,
        one is decided'''
        # If the sku has a display image
        if model.display_img:
            return model.display_img
        # If an associated plant can't be found, return a default image TODO!!!!!1
        if not model.plant:
            return None
        if len(model.plant.flower_images) > 0:
            return ImageHandler.get_b64(model.plant.flower_images[0])
        if len(model.plant.leaf_images) > 0:
            return ImageHandler.get_b64(model.plant.leaf_images[0])
        if len(model.plant.fruit_images) > 0:
            return ImageHandler.get_b64(model.plant.fruit_images[0])
        if len(model.plant.bark_images) > 0:
            return ImageHandler.get_b64(model.plant.bark_images[0])
        if len(model.plant.habit_images) > 0:
            return ImageHandler.get_b64(model.plant.habit_images[0])
        # TODO default image
        return None

    @staticmethod
    def add_discount(model: Sku, discount):
        if not model.is_discountable:
            return False
        if discount in model.discounts:
            return False
        model.discounts.append(discount)
        return True

    @staticmethod
    def all_skus():
        return Sku.query.with_entities(Sku.sku).all()

    @staticmethod
    def from_sku(sku: str):
        return db.session.query(Sku).filter_by(sku=sku).one_or_none()
