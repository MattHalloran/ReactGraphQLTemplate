from src.handlers.handler import Handler
from src.handlers.addressHandler import AddressHandler
from src.models import OrderItem, Order, OrderStatus


class OrderItemHandler(Handler):

    @staticmethod
    def model_type():
        return OrderItem

    @staticmethod
    def all_fields():
        return ['quantity', 'sku']

    @staticmethod
    def required_fields():
        return ['quantity', 'sku']

    @staticmethod
    def to_dict(model: OrderItem):
        return Handler.simple_fields_to_dict(model, OrderItemHandler.all_fields())


class OrderHandler(Handler):

    @staticmethod
    def model_type():
        return Order

    @staticmethod
    def all_fields():
        return ['delivery_address', 'special_instructions', 'desired_delivery_date', 'items']

    @staticmethod
    def required_fields():
        return ['delivery_address', 'desired_delivery_date', 'items']

    @staticmethod
    def to_dict(model: Order):
        as_dict = Handler.simple_fields_to_dict(model, ['status', 'special_instructions', 'desired_delivery_date'])
        as_dict['items'] = [OrderItemHandler.to_dict(item) for item in model.items]
        as_dict['delivery_address'] = AddressHandler.to_dict(model.delivery_address)
        as_dict['customer'] = {"id": model.customer.id}
        return as_dict

    @staticmethod
    def set_status(model: Order, status: OrderStatus):
        model.status = status.value
