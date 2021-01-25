# Abstract method for model handling classes

from abc import ABC, abstractmethod


class Handler(ABC):

    @staticmethod
    @abstractmethod
    def model_type():
        raise Exception('Handler class must overrde model_type method')

    @staticmethod
    @abstractmethod
    def all_fields():
        '''Specifies all fields used by create and/or update method'''
        raise Exception('Handler class must override all_fields method')

    @staticmethod
    @abstractmethod
    def required_fields():
        '''Specifies fields required by the model's constructor
        **NOTE: Fields order must match constructor signature'''
        raise Exception('Handler class must overrde required_fields method')

    @staticmethod
    def protected_fields():
        '''Specifies which fields should be filtered out from the update method (ex: password)'''

    @staticmethod
    @abstractmethod
    def to_dict(model):
        '''Represent object as a dictionary'''
        raise Exception('Handler class must override to_dict method')

    @staticmethod
    def simple_fields_to_dict(model, simple_fields: list):
        '''Used to simplify field representations in to_dict that are just self.whatever'''
        simple_dict = {}
        for field in simple_fields:
            simple_dict[field] = model.__dict__.get(field, 'ERROR: Could not retrieve field')
        return simple_dict

    @staticmethod
    def filter_data(data: dict, keep: list, remove=[]):
        '''Prepares dict for creating/updating model.
        All keysnot in keep are removed.
        All keys in remove are removed'''
        keeped_filter = {key: data.get(key) for key in keep}
        if remove:
            for k in remove:
                keeped_filter.pop(k, None)
        return keeped_filter

    @staticmethod
    def data_has_required(required_fields: list, data: dict):
        '''Returns true if the dictionary contains all specified fields'''
        return all([field in data for field in required_fields])

    @staticmethod
    def create_from_dict(handler, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        # If any required fields are missing
        if not Handler.data_has_required(handler.required_fields(), data):
            raise Exception('Cannot create object: one or more required fields missing')
        # Filter data
        filtered_data = Handler.filter_data(data, handler.all_fields())
        # Before creating the model object, first try to set default values
        # of fields that have not been provided
        if hasattr(handler.model_type(), 'defaults'):
            for key in handler.model_type().defaults.keys():
                if not filtered_data.get(key):
                    filtered_data[key] = handler.model_type().defaults[key]
        return handler.model_type()(*filtered_data)

    @staticmethod
    def create_from_args(handler, *args):
        return handler.model_type()(*args)

    @staticmethod
    def create(handler, *args):
        '''Create a new model object'''
        # If a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            return Handler.create_from_dict(handler, args[0])
        # If arguments are passed in to match the model's __init___
        else:
            return Handler.create_from_args(handler, *args)

    @staticmethod
    def update_from_dict(handler, obj, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        filtered_data = Handler.filter_data(data, handler.all_fields(), handler.protected_fields())
        for key in filtered_data.keys():
            obj.__dict__[key] = filtered_data[key]

    @staticmethod
    def update(handler, obj, *args):
        '''Update an existing model object'''
        # Ensure a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            Handler.update_from_dict(handler, obj, args[0])
        else:
            raise Exception('Updates can only be performed using dicts')

    @staticmethod
    def from_id(modelType: type, id: int):
        result = modelType.query.get(id)
        return result if result else None

    @staticmethod
    def all_ids(modelType: type):
        return modelType.query.with_entities(modelType.id).all()
