from abc import ABC, abstractmethod
from sqlalchemy.orm.collections import InstrumentedList
from src.api import db
from src.config import Config
from src.utils import resize_image, priceStringToDecimal
from base64 import b64encode
from sqlalchemy import func
import bcrypt
import os
import traceback
import re
from typing import Optional, Tuple, NoReturn, List


# Abstract method for model handling classes
class Handler(ABC):

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

    @classmethod
    def convert_to_model(cls, obj):
        '''Returns the input as a model type'''
        if type(obj) is int:
            return cls.from_id(obj)
        return obj

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
            simple_dict[field] = getattr(model, field, 'ERROR: Could not retrieve field')
        return simple_dict

    @staticmethod
    def filter_data(data: dict, keep: list, remove=[]):
        '''Prepares dict for creating/updating model.
        All keys not in keep are removed.
        All keys in remove are removed'''
        filtered = {}
        for key in keep:
            if key in data.keys():
                filtered[key] = data[key]
        if remove:
            for k in remove:
                filtered.pop(k, None)
        return filtered

    @staticmethod
    def data_has_required(required_fields: list, data: dict):
        '''Returns true if the dictionary contains all specified fields'''
        return all([field in data for field in required_fields])

    @classmethod
    def create_from_dict(cls, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        # Before creating the model object, first try to set default values
        # of fields that have not been provided
        if hasattr(cls.ModelType, 'defaults'):
            for key in cls.ModelType.defaults.keys():
                if not data.get(key):
                    data[key] = cls.ModelType.defaults[key]
        # If any required fields are missing
        if not cls.data_has_required(cls.required_fields(), data):
            raise Exception('Cannot create object: one or more required fields missing')
        # Filter data
        filtered_data = cls.filter_data(data, cls.required_fields())
        return cls.ModelType(*filtered_data)

    @classmethod
    def create_from_args(cls, *args):
        return cls.ModelType(*args)

    @classmethod
    def create(cls, *args):
        '''Create a new model object'''
        # If a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            return cls.create_from_dict(args[0])
        # If arguments are passed in to match the model's __init___
        else:
            return cls.create_from_args(*args)

    @classmethod
    def update_from_dict(cls, obj, data: dict):
        '''Used to create a new model, if data has passed preprocess checks'''
        filtered_data = cls.filter_data(data, cls.all_fields(), cls.protected_fields())
        for key in filtered_data.keys():
            setattr(obj, key, filtered_data[key])

    @classmethod
    def update(cls, obj, *args):
        '''Update an existing model object'''
        # Ensure a dict of values is passed in
        if len(args) == 1 and type(args[0]) is dict:
            cls.update_from_dict(obj, args[0])
        else:
            raise Exception('Updates can only be performed using dicts')

    @classmethod
    def from_id(cls, id: int):
        result = cls.ModelType.query.get(id)
        return result if result else None

    @classmethod
    def all_ids(cls):
        return [o[0] for o in cls.ModelType.query.with_entities(cls.ModelType.id).all()]

    @classmethod
    def all_objs(cls, *args):
        '''Converts passed ids to objects.
        If no ids passed in, defaults to all ids'''
        id_list = args
        if len(args) == 0:
            id_list = cls.all_ids()
        elif len(args) == 1 and type(args[0]) is list:
            id_list = args[0]
        return [cls.from_id(id) for id in id_list]

    @classmethod
    def all_dicts(cls, *args):
        '''Converts passed ids to objects.
        If no ids passed in, defaults to all ids'''
        id_list = args
        if len(args) == 0:
            id_list = cls.all_ids()
        elif len(args) == 1 and (type(args[0]) is list or type(args[0]) is InstrumentedList):
            id_list = args[0]
        return [cls.to_dict(id) for id in id_list]

    @classmethod
    def uniques(cls, column):
        '''Return all unique values for a column'''
        return [o[0] for o in cls.ModelType.query.with_entities(column).distinct(column).all()]

    @classmethod
    def update_relationship_list(cls, relationship, relationship_handler, data):
        '''Uses a list of dictionaries to update a model's relationship list
        Arguments:
        1) relationship - the model's relationship array
        1) relationship type - the handler type of the relationship objects
        2) data - the data to update the field with'''
        if not isinstance(relationship, list):
            print('Error: relationship must be an array')
            return False
        # Any item without an id is new, so we can track all ids in the dict
        # to determine which items have been added/deleted
        i_ids = [it.id for it in relationship]  # IDs in the items list
        d_ids = []  # IDs in the data list
        for d_obj in data:
            try:
                # Object is not new - update
                if (d_id := d_obj.get('id', None)):
                    d_ids.append(d_id)
                    d_model = relationship_handler.from_id(d_id)
                    relationship_handler.update(d_model, d_obj)
                # Object is new - create
                else:
                    new_model = relationship_handler.create(d_obj)
                    relationship_handler.update(new_model, d_obj)
                    db.session.add(new_model)
                    relationship.append(new_model)
            except Exception:
                print(traceback.format_exc())
        for old in i_ids:
            # Object not found in data - delete
            if old not in d_ids:
                old_model = relationship_handler.from_id(old)
                db.session.delete(old_model)
                relationship.remove(old_model)

class BusinessHandler(Handler):
    ModelType = Business

    @staticmethod
    def all_fields() -> List[str]:
        return ['name', 'email', 'Email', 'phone', 'subscribed_to_newsletters']

    @staticmethod
    def required_fields() -> List[str]:
        return ['name']

    @classmethod
    def to_dict(cls, model: Business) -> dict:
        model = cls.convert_to_model(model)
        as_dict = BusinessHandler.simple_fields_to_dict(model, ['name', 'subscribed_to_newsletters'])
        #as_dict['delivery_addresses'] = AddressHandler.all_dicts(model.delivery_addresses)
        #as_dict['employees'] = UserHandler.all_dicts(model.employees)
        #as_dict['phones'] = PhoneHandler.all_dicts(model.phones)
        #as_dict['emails'] = EmailHandler.all_dicts(model.emails)
        return as_dict

    @staticmethod
    def add_address(model: Business, address: Address) -> bool:
        if address not in model.delivery_addresses:
            model.delivery_addresses.append(address)
            return True
        return False

    @staticmethod
    def add_employee(model: Business, employee: User) -> bool:
        if employee not in model.employees:
            model.employees.append(employee)
            return True
        return False


# Possible image sizes stored, and their max size
class ImageSizes(Enum):
    XS = (64, 64)
    S = (128, 128)
    M = (256, 256)
    ML = (512, 512)
    L = (1024, 1024)


class ImageHandler(Handler):
    ModelType = Image

    @staticmethod
    def all_fields() -> List[str]:
        return ['folder', 'file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @staticmethod
    def required_fields() -> List[str]:
        return ['folder', 'file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @classmethod
    def to_dict(cls, model: Image) -> dict:
        model = cls.convert_to_model(model)
        return ImageHandler.simple_fields_to_dict(model, ['id', 'hash', 'alt', 'used_for', 'width', 'height'])

    @staticmethod
    def label_from_dimensions(width: int, height: int) -> str:
        '''Returns closest size label, based on provided width and height'''
        if width > ImageSizes.L.value[0] or height > ImageSizes.L.value[1]:
            return 'l'
        if width > ImageSizes.ML.value[0] or height > ImageSizes.ML.value[1]:
            return 'ml'
        if width > ImageSizes.M.value[0] or height > ImageSizes.M.value[1]:
            return 'm'
        if width > ImageSizes.S.value[0] or height > ImageSizes.S.value[1]:
            return 's'
        return 'xs'

    @staticmethod
    def dimensions_from_label(label: str) -> Tuple[int, int]:
        '''Returns dimensions of size label'''
        if label == 'l':
            return ImageSizes.L.value
        if label == 'ml':
            return ImageSizes.ML.value
        if label == 'm':
            return ImageSizes.M.value
        if label == 's':
            return ImageSizes.S.value
        return ImageSizes.XS.value

    @classmethod
    def create_from_scratch(cls, data: str, alt: str, dest_folder: str, used_for: ImageUses):
        '''Creates a new image model without having to worry about file names, thumbnail, etc'''
        from src.utils import salt, find_available_file_names, get_image_meta
        from mimetypes import guess_extension
        from base64 import b64decode
        img_name = salt(30)
        # ex: guess_extension(image/jpeg)
        img_ext = guess_extension(data[data.index(':')+1:data.index(';')])
        # Data is stored in base64, and the beginning of the
        # string is not needed
        just_data = data[data.index('base64,')+7:]
        decoded = b64decode(just_data)
        (hash, width, height) = get_image_meta(decoded)
        # If image already exists, return it
        if (existing := ImageHandler.from_hash(hash)):
            print('Image already in server!')
            return existing
        # Find the size label for the image
        label = ImageHandler.label_from_dimensions(width, height)
        img_name = find_available_file_names(dest_folder, img_name, img_ext)
        img_path = f'{Config.BASE_IMAGE_DIR}/{dest_folder}/{img_name}-{label}{img_ext}'
        # Save image
        with open(img_path, 'wb') as f:
            f.write(decoded)
        # Add image data to database
        img_row = cls.create(dest_folder,
                             img_name,
                             img_ext,
                             alt,
                             hash,
                             used_for,
                             width,
                             height)
        db.session.add(img_row)
        db.session.commit()
        return img_row
        
    @classmethod
    def get_b64(cls, key: str, size: str) -> Optional[str]:
        '''Returns the base64 string representation of an image in the requested size,
        or the next best size available'''
        base64_prefix = 'data:image/jpeg;base64,'
        if not (model := ImageHandler.from_hash(key)):
            return None
        # First, check if the image exists in the exact requested size
        file_path = f'{Config.BASE_IMAGE_DIR}/{model.folder}/{model.file_name}-{size}.{model.extension}'
        if os.path.exists(file_path):
            # Read image file
            with open(file_path, 'rb') as open_file:
                byte_content = open_file.read()
            # Convert image to a base64 string
            base64_bytes = b64encode(byte_content)
            base64_string = base64_bytes.decode('utf-8')
            return base64_prefix + base64_string
        # If it didn't exist, try to find a larger version and scale it down
        larger_labels = ['l', 'ml', 'm', 's', 'xs']
        requested_index = larger_labels.index(size)
        if requested_index >= 0:
            larger_labels = larger_labels[:requested_index+1]
        for size_label in larger_labels:
            file_path = f'{Config.BASE_IMAGE_DIR}/{model.folder}/{model.file_name}-{size_label}.{model.extension}'
            if os.path.exists(file_path):
                # Load file
                with open(file_path, 'rb') as open_file:
                    byte_content = open_file.read()
                # Resize file
                resized = resize_image(byte_content, ImageHandler.dimensions_from_label(size))
                # Store and return file
                store_path = f'{Config.BASE_IMAGE_DIR}/{model.folder}/{model.file_name}-{size}.{model.extension}'
                resized.save(store_path)
                with open(store_path, 'rb') as open_file:
                    byte_content = open_file.read()
                # Convert image to a base64 string
                base64_bytes = b64encode(byte_content)
                base64_string = base64_bytes.decode('utf-8')
                return base64_prefix + base64_string
        # If a larger size didn't exist, try to return a smaller size
        smaller_labels = ['l', 'ml', 'm', 's', 'xs']
        requested_index = smaller_labels.index(size)
        if requested_index >= 0:
            smaller_labels = smaller_labels[requested_index:]
        for size_label in smaller_labels:
            file_path = f'{Config.BASE_IMAGE_DIR}/{model.folder}/{model.file_name}-{size_label}.{model.extension}'
            if os.path.exists(file_path):
                # Load file
                with open(file_path, 'rb') as open_file:
                    byte_content = open_file.read()
                base64_bytes = b64encode(byte_content)
                base64_string = base64_bytes.decode('utf-8')
                return base64_prefix + base64_string
        # Finally, if no image found, return None
        return None

    @staticmethod
    def from_used_for(used_for: ImageUses):
        return db.session.query(Image).filter_by(used_for=used_for.value).all()

    @staticmethod
    def from_file_name(file_name: str):
        return db.session.query(Image).filter_by(file_name=file_name).one_or_none()

    @staticmethod
    def from_hash(hash: str):
        if hash is None:
            return None
        return db.session.query(Image).filter_by(hash=hash).one_or_none()

    @staticmethod
    def is_hash_used(hash: str):
        print(f'CHECKING IF HASH USED {hash}')
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None


class OrderItemHandler(Handler):
    ModelType = OrderItem

    @staticmethod
    def all_fields() -> List[str]:
        return ['quantity', 'sku']

    @staticmethod
    def required_fields() -> List[str]:
        return []

    @classmethod
    def to_dict(cls, model: OrderItem) -> dict:
        model = cls.convert_to_model(model)
        return {
            'id': model.id,
            'quantity': model.quantity,
            'sku': SkuHandler.to_dict(model.sku),
        }


class OrderHandler(Handler):
    ModelType = Order

    @staticmethod
    def all_fields() -> List[str]:
        return ['is_delivery', 'delivery_address', 'special_instructions', 'desired_delivery_date', 'items', 'user_id']

    @staticmethod
    def required_fields() -> List[str]:
        return ['quantity', 'sku']

    @classmethod
    def to_dict(cls, model: Order) -> dict:
        model = cls.convert_to_model(model)
        as_dict = OrderHandler.simple_fields_to_dict(model, ['status', 'special_instructions', 'is_delivery', 'desired_delivery_date'])
        as_dict['id'] = model.id
        as_dict['items'] = OrderItemHandler.all_dicts(model.items)
        as_dict['delivery_address'] = AddressHandler.to_dict(model.delivery_address)
        customer = UserHandler.from_id(model.user_id)
        as_dict['customer'] = {
            "id": customer.id,
            "first_name": customer.first_name,
            "last_name": customer.last_name,
            "pronouns": customer.pronouns,
            "emails": EmailHandler.all_dicts(customer.personal_email),
            "phones": PhoneHandler.all_dicts(customer.personal_phone),
        }
        return as_dict

    @staticmethod
    def from_status(status: int):
        '''Return all orders that match the provided status'''
        return db.session.query(Order).filter_by(status=status).all()

    @staticmethod
    def set_status(model: Order, status: int) -> NoReturn:
        model.status = status

    @classmethod
    def update_from_dict(cls, obj, data: dict):
        items_data = data['items']
        if len(items_data) == 0:
            OrderHandler.empty_order(obj)
        else:
            # Any item without an id is new, so we can track all ids in the dict
            # to determine which items have been deleted
            data_ids = []
            old_ids = [it.id for it in obj.items]
            for item in items_data:
                if (item_id := item.get('id', None)):
                    data_ids.append(item_id)
                    item_obj = OrderItemHandler.from_id(item_id)
                    OrderItemHandler.update(item_obj, {'quantity': item['quantity']})
                else:
                    quantity = item['quantity']
                    sku = SkuHandler.from_sku(item['sku'])
                    new_item = OrderItemHandler.create(quantity, sku)
                    db.session.add(new_item)
                    obj.items.append(new_item)
            for old in old_ids:
                # If id is not in the data list, then delete it
                if old not in data_ids:
                    old_item = OrderItemHandler.from_id(old)
                    db.session.delete(old_item)

        if (notes := data.get('special_instructions', None)):
            obj.special_instructions = notes
        if (date := data.get('desired_delivery_date', None)):
            obj.desired_delivery_date = date
        if (addy_id := data.get('address_id', None)):
            obj.address_id = addy_id
        is_delivery = data.get('is_delivery', None)
        if is_delivery is not None:
            obj.is_delivery = is_delivery

    @classmethod
    def empty_order(cls, model: Order) -> bool:
        '''Remove all items in the order.
        Returns True if successful'''
        try:
            model = cls.convert_to_model(model)
            for item in model.items:
                db.session.delete(item)
            model.items = []
            db.session.commit()
            return True
        except Exception:
            print('Failed to empty order!')
            return False




class PlantTraitHandler(Handler):
    ModelType = PlantTrait

    @staticmethod
    def all_fields() -> List[str]:
        return ['trait', 'value']

    @staticmethod
    def required_fields() -> List[str]:
        return ['trait', 'value']

    @classmethod
    def to_dict(cls, model: PlantTrait) -> dict:
        model = cls.convert_to_model(model)
        return PlantTraitHandler.simple_fields_to_dict(model, PlantTraitHandler.all_fields())

    @staticmethod
    def from_values(trait: PlantTraitOptions, value: str):
        '''Returns the PlantTrait object that matches the specified values, or None'''
        return db.session.query(PlantTrait).filter_by(trait=trait.value, value=value).one_or_none()

    @classmethod
    def uniques_by_trait(cls, trait: PlantTraitOptions) -> List[str]:
        '''Return all unique values for a given trait'''
        return [o[0] for o in cls.ModelType.query.with_entities(PlantTrait.value).filter_by(trait=trait.value).distinct(PlantTrait.value).all()]


class PlantHandler(Handler):
    ModelType = Plant

    @staticmethod
    def all_fields() -> List[str]:
        return ['latin_name', 'common_name', 'plantnet_url', 'yards_url', 'description',
                'jersey_native', 'drought_tolerance_id', 'grown_height_id',
                'grown_spread_id', 'growth_rate_id', 'optimal_light_id', 'salt_tolerance_id']

    @staticmethod
    def required_fields() -> List[str]:
        return ['latin_name']

    @classmethod
    def basic_dict(cls, model: Plant) -> dict:
        '''Similar to the normal to_dict method, but without SKU data'''
        model = cls.convert_to_model(model)

        def array_to_dict(model_dict: dict, to_dict, field: str, key=None):
            '''Helper method for creating json data from an array'''
            if not key:
                key = field
            data = getattr(model, field, None)
            if not data:
                return
            if isinstance(data, list):
                if len(data) > 0:
                    model_dict[key] = [to_dict(d) for d in data]
            else:
                model_dict[key] = to_dict(data)

        # Start with a dictionary of basic values
        as_dict = PlantHandler.simple_fields_to_dict(model, PlantHandler.all_fields())

        # Add data for every image
        img_fields = ['flower_images', 'leaf_images', 'fruit_images',
                      'bark_images', 'habit_images']
        [array_to_dict(as_dict, ImageHandler.to_dict, field) for field in img_fields]

        # Add data for trait fields
        trait_fields = ['deer_resistance', 'drought_tolerance', 'grown_height', 'grown_spread',
                        'growth_rate', 'optimal_light', 'salt_tolerance',
                        'attracts_pollinators_and_wildlifes', 'bloom_times', 'bloom_colors',
                        'zones', 'plant_types', 'physiographic_regions', 'soil_moistures',
                        'soil_phs', 'soil_types', 'light_ranges']
        for field in trait_fields:
            trait_obj = getattr(model, field)
            as_dict[field] = trait_obj.value if trait_obj else None
        as_dict['id'] = model.id
        display_image = cls.get_display_image(model)
        if display_image:
            as_dict['display_key'] = display_image.hash
        return as_dict

    @classmethod
    def to_dict(cls, model: Plant) -> dict:
        model = cls.convert_to_model(model)
        data = cls.basic_dict(model)
        data['skus'] = [SkuHandler.to_dict(sku) for sku in PlantHandler.skus(model) if sku.status == SkuStatus.ACTIVE.value]
        return data

    @classmethod
    def has_available_sku(cls, model) -> bool:
        '''Returns True if there are any SKUs VISIBLE TO THE CUSTOMER
        that are associated with this plant'''
        model = cls.convert_to_model(model)
        return db.session.query(Sku).filter_by(plant_id=model.id, status=SkuStatus.ACTIVE.value).count() > 0

    @classmethod
    def skus(cls, model):
        '''Returns all SKU objects associated with the plant model'''
        model = cls.convert_to_model(model)
        return db.session.query(Sku).filter_by(plant_id=model.id).all()

    @classmethod
    def available_skus(cls, model):
        '''Returns all available SKU objects associated with the plant model'''
        model = cls.convert_to_model(model)
        return db.session.query(Sku).filter_by(plant_id=model.id, status=SkuStatus.ACTIVE.value).all()

    @staticmethod
    def cheapest(model):
        '''Returns the lowest SKU price associated with this plant, or -1'''
        skus = PlantHandler.available_skus(model)
        if skus is None:
            return -1
        return SkuHandler.cheapest(skus)

    @staticmethod
    def priciest(model):
        '''Returns the highest SKU price associated with this plant, or -1'''
        skus = PlantHandler.available_skus(model)
        if skus is None:
            return -1
        return SkuHandler.priciest(skus)

    @staticmethod
    def newest(model):
        '''Returns the newest SKU associated with this plant, or -1'''
        skus = PlantHandler.available_skus(model)
        if skus is None:
            return -1
        return SkuHandler.newest(skus)

    @staticmethod
    def oldest(model):
        '''Returns the oldest SKU associated with this plant, or -1'''
        skus = PlantHandler.available_skus(model)
        if skus is None:
            return -1
        return SkuHandler.oldest(skus)

    @staticmethod
    def set_display_image(model: Plant, image: Image) -> NoReturn:
        model.display_img = image
        model.display_img_id = image.id
        db.session.commit()

    @staticmethod
    def get_display_image(model: Plant):
        '''Returns an Image model for the SKUs display image, or None
        if not found'''
        # If the sku has a display image TODO doesn't account for full or thumb
        if model.display_img:
            return model.display_img
        if len(model.flower_images) > 0:
            return model.flower_images[0]
        if len(model.leaf_images) > 0:
            return model.leaf_images[0]
        if len(model.fruit_images) > 0:
            return model.fruit_images[0]
        if len(model.bark_images) > 0:
            return model.bark_images[0]
        if len(model.habit_images) > 0:
            return model.habit_images[0]
        return None


class RoleHandler(Handler):
    ModelType = Role

    @staticmethod
    def all_fields() -> List[str]:
        return ['title', 'description']

    @staticmethod
    def required_fields() -> List[str]:
        return ['title']

    @classmethod
    def to_dict(cls, model) -> dict:
        model = cls.convert_to_model(model)
        return RoleHandler.simple_fields_to_dict(model, RoleHandler.all_fields())

    @staticmethod
    def get_customer_role():
        return Role.query.filter_by(title='Customer').first()

    @staticmethod
    def get_admin_role():
        return Role.query.filter_by(title='Admin').first()


class SkuHandler(Handler):
    ModelType = Sku

    @staticmethod
    def all_fields() -> List[str]:
        return ['sku', 'size', 'price', 'availability', 'is_discountable', 'status']

    @staticmethod
    def required_fields() -> List[str]:
        return []

    @classmethod
    def to_dict(cls, model: Sku) -> dict:
        model = cls.convert_to_model(model)
        as_dict = SkuHandler.simple_fields_to_dict(model, SkuHandler.all_fields())
        as_dict['id'] = model.id
        as_dict['discounts'] = SkuDiscountHandler.all_dicts(model.discounts)
        as_dict['status'] = model.status
        as_dict['plant'] = PlantHandler.basic_dict(model.plant)
        return as_dict

    @staticmethod
    def add_discount(model: Sku, discount) -> bool:
        if not model.is_discountable:
            return False
        if discount in model.discounts:
            return False
        model.discounts.append(discount)
        return True

    @staticmethod
    def set_plant(model: Sku, plant: Plant) -> NoReturn:
        model.plant = plant

    @staticmethod
    def all_available_skus():
        return db.session.query(Sku).filter_by(status=SkuStatus.ACTIVE.value).all()

    @staticmethod
    def from_sku(sku: str):
        return db.session.query(Sku).filter_by(sku=sku).one_or_none()

    @staticmethod
    def from_plant_id(id: int):
        '''Returns all SKUs associated with a plant id'''
        return db.session.query(Sku).filter_by(plant_id=id).all()

    @staticmethod
    def from_plant(plant: Plant):
        '''Returns all SKUs associated with a plant object'''
        return SkuHandler.from_plant_id(plant.id)

    @staticmethod
    def cheapest(skus):
        if skus is None:
            return -1
        sorted_skus = sorted(skus, key=lambda s: priceStringToDecimal(s.price), reverse=False)
        return priceStringToDecimal(sorted_skus[0].price)

    @staticmethod
    def priciest(skus):
        if skus is None:
            return -1
        sorted_skus = sorted(skus, key=lambda s: priceStringToDecimal(s.price), reverse=True)
        return priceStringToDecimal(sorted_skus[0].price)

    @staticmethod
    def newest(skus):
        if skus is None:
            return -1
        return sorted(skus, key=lambda s: s.date_added, reverse=False)[0].date_added

    @staticmethod
    def oldest(skus):
        if skus is None:
            return -1
        return sorted(skus, key=lambda s: s.date_added, reverse=True)[0].date_added

    @classmethod
    def hide_all(cls) -> NoReturn:
        '''Hides all SKUs from the customer'''
        skus = cls.all_objs()
        for sku in skus:
            sku.status = SkuStatus.INACTIVE.value
        db.session.commit()


class UserHandler(Handler):
    ModelType = User

    @staticmethod
    def all_fields() -> List[str]:
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def required_fields() -> List[str]:
        return ['first_name', 'last_name', 'pronouns', 'password', 'existing_customer']

    @staticmethod
    def protected_fields() -> List[str]:
        return ['existing_customer', 'password', 'login_attempts']

    @classmethod
    def update(cls, obj: User, *args):
        data = args[0]
        success = True
        if first_name := data.get('first_name', None):
            obj.first_name = first_name
        if last_name := data.get('last_name', None):
            obj.last_name = last_name
        if pronouns := data.get('pronouns', None):
            obj.pronouns = pronouns
        if business := data.get('business', None):
            bizz_obj = BusinessHandler.create(business)
            db.session.add(bizz_obj)
            db.session.commit()
            obj.business_id = bizz_obj.id
        obj.theme = data.get('theme', obj.theme)
        if emails := data.get('emails', None):
            success = cls.update_relationship_list(obj.personal_email, EmailHandler, emails) and success
        if phones := data.get('phones', None):
            success = cls.update_relationship_list(obj.personal_phone, PhoneHandler, phones) and success
        if existing_customer := data.get('existing_customer', None):
            if not obj.account_approved and existing_customer:
                obj.account_approved = True
        if (password := data.get('password', None)):
            obj.password = User.hashed_password(password)
        if orders := data.get('orders', None):
            for o in orders:
                if order_obj := OrderHandler.from_id(o['id']):
                    success = OrderHandler.update_from_dict(cart_obj, cart) and success
        db.session.commit()
        return obj

    @classmethod
    def create(cls, *args):
        user = super(UserHandler, cls).create(*args)
        # All users are customers by default
        user.roles.append(RoleHandler.get_customer_role())
        cls.update(user, *args)
        return user

    @classmethod
    def to_dict(cls, model: User) -> dict:
        model = cls.convert_to_model(model)
        as_dict = UserHandler.simple_fields_to_dict(model, ['first_name', 'last_name', 'pronouns', 'existing_customer', 'theme'])
        as_dict['id'] = model.id
        as_dict['tag'] = model.tag
        as_dict['account_status'] = model.account_status
        as_dict['business'] = BusinessHandler.to_dict(model.business_id)
        as_dict['roles'] = RoleHandler.all_dicts(model.roles)
        as_dict['emails'] = EmailHandler.all_dicts(model.personal_email)
        as_dict['phones'] = PhoneHandler.all_dicts(model.personal_phone)
        if len(model.orders) > 0:
            as_dict['cart'] = OrderHandler.to_dict(UserHandler.get_cart(model))
        else:
            as_dict['cart'] = []
        if len(model.likes) > 0:
            as_dict['likes'] = SkuHandler.all_dicts(model.likes)
        else:
            as_dict['likes'] = []
        return as_dict

    @staticmethod
    def all_customers():
        users = UserHandler.all_objs()
        return [UserHandler.to_dict(user) for user in users if UserHandler.is_customer(user)]

    @staticmethod
    def tag_from_email(email: str) -> Optional[str]:
        user = UserHandler.from_email(email)
        if user:
            return user.tag
        return None

    @staticmethod
    def from_tag(tag: str):
        return db.session.query(User).filter_by(tag=tag).one_or_none()

    @staticmethod
    def from_email(email: str):
        return User.query.filter(User.personal_email.any(func.lower(Email.email_address) == func.lower(email))).first()

    @staticmethod
    def email_in_use(email: str):
        '''Returns True if the email is being used by an active account'''
        users = UserHandler.from_email(email)
        if users is None:
            return True
        return any(user.account_status != AccountStatus.DELETED.value for user in users)

    @staticmethod
    def phone_in_use(phone: str):
        '''Returns True if the phone is being used by an active account'''
        formatted_phone = re.sub("[^0-9]", "", phone)
        # Only users that haven't been deleted
        users = User.query.filter(User.account_status != AccountStatus.DELETED.value).all()
        all_phones = [u.personal_phone for u in users]
        # 2d to 1d
        all_phones = sum(all_phones, [])
        numbers = [p.unformatted_number for p in all_phones]
        # Format numbers
        numbers = [re.sub("[^0-9]", "", n) for n in numbers]
        return any([num == formatted_phone for num in numbers])

    @staticmethod
    def is_customer(user: User) -> bool:
        print(RoleHandler.all_dicts(user.roles))
        return any(r.title == 'Customer' for r in user.roles)

    @staticmethod
    def is_password_valid(user: User, password: str) -> bool:
        return bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8'))

    @staticmethod
    def pack_session(user: User, token: str):
        '''Returns a formatted session object,
        with extra information about the user'''
        return {
            'tag': user.tag,
            'token': token,
            'theme': user.theme,
            'roles': RoleHandler.all_dicts(user.roles),
            'orders': OrderHandler.all_dicts(user.orders)
        }

    @staticmethod
    def get_profile_data(tag: str):
        '''Returns user profile data'''
        # Check if user esists
        user = UserHandler.from_tag(tag)
        if not user:
            return None
        return {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "pronouns": user.pronouns,
            "theme": user.theme,
            "emails": EmailHandler.all_dicts(user.personal_email),
            "phones": PhoneHandler.all_dicts(user.personal_phone),
            "image_file": user.image_file,
            "orders": OrderHandler.all_dicts(user.orders),
            "roles": RoleHandler.all_dicts(user.roles),
            "likes": SkuHandler.all_dicts(user.likes)
        }

    @staticmethod
    def get_cart(user: User):
        '''Returns the user's cart, or None'''
        if user is None or not UserHandler.is_customer(user):
            return None
        cart = None
        if len(user.orders) == 0 or user.orders[-1].status != OrderStatus['DRAFT']:
            cart = OrderHandler.create(user.id)
            db.session.add(cart)
            user.orders.append(cart)
            db.session.commit()
        else:
            cart = user.orders[-1]
        return cart
