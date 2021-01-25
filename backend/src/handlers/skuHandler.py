from src.handlers.handler import Handler
from src.handlers.plantHandler import PlantHandler
from src.models import SkuDiscount, Sku, Size


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
        return ['size']

    @staticmethod
    def required_fields():
        return ['size']

    @staticmethod
    def to_dict(model: Size):
        return model.size


class SkuHandler(Handler):

    @staticmethod
    def model_type():
        return Sku

    @staticmethod
    def all_fields():
        return ['availability', 'is_discountable', 'plant']

    @staticmethod
    def required_fields():
        return ['plant']

    @staticmethod
    def to_dict(model: Sku):
        as_dict = Handler.simple_fields_to_dict(model, ['availability', 'is_discountable', 'sku'])
        as_dict['plant'] = PlantHandler.to_dict(model.plant)
        as_dict['sizes'] = [SizeHandler.to_dict(size) for size in model.sizes]
        as_dict['discounts'] = [SkuDiscountHandler.to_dict(discount) for discount in model.discounts]
        return as_dict

    @staticmethod
    def add_discount(model: Sku, discount):
        if not model.is_discountable:
            return False
        if discount in model.discounts:
            return False
        model.discounts.append(discount)
        return True
