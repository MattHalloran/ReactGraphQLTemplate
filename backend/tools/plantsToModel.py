# Converts a json of plants info into rows in the database model
# Admins can associate SKUs with these plants, or create custom plants
import json
import os
import sys
import glob
import requests
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.api import db, create_app   # NOQA
from src.config import Config   # NOQA
from src.models import PlantTraitOptions, ImageUses  # NOQA
from src.handlers.handler import Handler  # NOQA
from src.handlers.skuHandler import SkuHandler  # NOQA
from src.handlers.imageHandler import ImageHandler  # NOQA
from src.handlers.plantHandler import PlantTraitHandler, PlantHandler  # NOQA
from src.utils import get_image_meta, find_available_file_names  # NOQA

# Will create a SKU for every plant added
AUTO_CREATE_SKU = True
IN_FILE = '/Users/matthewhalloran/Documents/NLNWebsite/backend/plant_info/combined-output.json'

app = create_app()


def get_trait(trait: PlantTraitOptions, value: str):
    '''Returns the id of a PlantTrait object matching the specified values.
    If none exists, a new object will be added to the database'''
    if value is None:
        return None
    trait_obj = PlantTraitHandler.from_values(trait, value)
    if trait_obj is None:
        trait_obj = Handler.create(PlantTraitHandler, trait.value, value)
        db.session.add(trait_obj)
        # ID is not created until the object is committed
        db.session.commit()
    return trait_obj


def update_relationship_field(field_data,
                              trait: PlantTraitOptions,
                              model_obj,
                              model_field_name: str):
    '''Updates a model's relationship field using a list or string'''
    if field_data is None or model_obj is None:
        return
    if isinstance(field_data, str):
        return get_trait(trait, field_data)
    elif isinstance(field_data, list):
        for item in field_data:
            getattr(model_obj, model_field_name).append(get_trait(trait, item))


def download_and_store_imgs(urls: list, alt: str, use: ImageUses):
    image_objects = []
    for url in urls:
        # On plantnet, this will change the url to a larger image
        url = url.replace('/s/', '/m/')
        # File name created from url. This allows for a check to see
        # if the image has already been downloaded
        file_name = url[url.rindex('/')+1:]
        thumb_file_name = f'{file_name}-thumb'
        # If image has already been downloaded
        if glob.glob(f'{Config.PLANT_DIR}/{file_name}.*'):
            print(f'Image already downloaded: {file_name}')
            # TODO if database was dropped, this will return None instead of creating a new object
            image = ImageHandler.from_file_name(file_name)
            image_objects.append(image)
            continue
        # Request image from url
        response = requests.get(url)
        if not response.ok:
            print(f'Failed to retrieve image from {url}')
            image_objects.append(None)
            continue
        image = response.content
        content_type = response.headers['Content-Type']
        extension = content_type[content_type.rindex('/')+1:]
        (img_hash, thumbnail, img_width, img_height) = get_image_meta(image)
        if ImageHandler.is_hash_used(img_hash):
            print(f'Hash collision! For image {url}')
            image_objects.append(None)
            continue
        # Save image and thumbnail to files
        with open(f'{Config.PLANT_DIR}/{file_name}.{extension}', 'wb') as f:
            f.write(image)
        thumbnail.save(f'{Config.PLANT_DIR}/{thumb_file_name}.{extension}')
        # Now create a model object to associate with the image
        img_row = Handler.create(ImageHandler,
                                 Config.PLANT_DIR,
                                 file_name,
                                 thumb_file_name,
                                 extension,
                                 alt,
                                 img_hash,
                                 use,
                                 img_width,
                                 img_height)
        db.session.add(img_row)
        db.session.commit()
    return image_objects


def plants_to_model():
    # Load dependencies
    from src.models import ImageUses
    from src.handlers.handler import Handler

    # Load json from file
    with open(IN_FILE, 'rb') as infile:
        plant_data = json.load(infile)

    with app.app_context():
        for plant in plant_data:
            # First, collect all data that doesn't need to be appended to a relationship
            plant_args = {
                'latin_name': plant['latin_name'],
                'plantnet_url': plant.get('plantnet_url', None),
                'yards_url': plant.get('yards_url', None),
                'description': plant.get('description', None),
                'jersey_native': plant.get('jersey_native', False)
            }

            # Now collect one-to-one relationship ids
            def o2oHelper(key: str, field: str, trait_option: PlantTraitOptions):
                trait = get_trait(trait_option, plant.get(field, None))
                if trait:
                    plant_args[key] = trait.id
            field_arguments = [
                ['drought_tolerance_id', 'drought_tolerance', PlantTraitOptions.DROUGHT_TOLERANCE],
                ['grown_height_id', 'grown_height', PlantTraitOptions.GROWN_HEIGHT],
                ['grown_spread_id', 'grown_spread', PlantTraitOptions.GROWN_SPREAD],
                ['growth_rate_id', 'growth_rate', PlantTraitOptions.GROWTH_RATE],
                ['optimal_light_id', 'optimal_light', PlantTraitOptions.OPTIMAL_LIGHT],
                ['salt_tolerance_id', 'salt_tolerance', PlantTraitOptions.SALT_TOLERANCE],
            ]
            [o2oHelper(*args) for args in field_arguments]

            # Create a plant object using the collected data
            plant_obj = Handler.create(PlantHandler, plant_args['latin_name'])
            Handler.update(PlantHandler, plant_obj, plant_args)
            # Now collect many-to-many relationship data
            update_relationship_field(plant.get('attracts_pollinators_and_wildlife', None),
                                      PlantTraitOptions.ATTRACTS_POLLINATORS_AND_WILDLIFE,
                                      plant_obj,
                                      'attracts_pollinators_and_wildlifes')
            update_relationship_field(plant.get('bloom_times', None),
                                      PlantTraitOptions.BLOOM_TIME,
                                      plant_obj,
                                      'bloom_times')
            update_relationship_field(plant.get('bloom_colors', None),
                                      PlantTraitOptions.BLOOM_COLOR,
                                      plant_obj,
                                      'bloom_colors')
            update_relationship_field(plant.get('zones', None),
                                      PlantTraitOptions.ZONE,
                                      plant_obj,
                                      'zones')
            update_relationship_field(plant.get('physiographic_region', None),
                                      PlantTraitOptions.PHYSIOGRAPHIC_REGION,
                                      plant_obj,
                                      'physiographic_regions')
            update_relationship_field(plant.get('plant_type', None),
                                      PlantTraitOptions.PLANT_TYPE,
                                      plant_obj,
                                      'plant_types')
            update_relationship_field(plant.get('soil_moisture', None),
                                      PlantTraitOptions.SOIL_MOISTURE,
                                      plant_obj,
                                      'soil_moistures')
            update_relationship_field(plant.get('soil_ph', None),
                                      PlantTraitOptions.SOIL_PH,
                                      plant_obj,
                                      'soil_phs')
            update_relationship_field(plant.get('soil_type', None),
                                      PlantTraitOptions.SOIL_TYPE,
                                      plant_obj,
                                      'soil_types')
            update_relationship_field(plant.get('light_range', None),
                                      PlantTraitOptions.LIGHT_RANGE,
                                      plant_obj,
                                      'light_ranges')
            if (image_dict := plant.get('plantnet_images', None)):
                def download_helper(key: str, field: str, alt: str, use: ImageUses):
                    '''Helper method for downloading images and adding relationships
                    to those images in the plant object'''
                    if (images := image_dict.get(key, None)):
                        rows = download_and_store_imgs(images, alt, use)
                        for row in rows:
                            getattr(plant_obj, field).append(row)
                latin_name = plant_args['latin_name']
                field_arguments = [
                    # [key in dict, name of model's field, image alt, ImageUses]
                    ['flower', 'flower_images', f'Flowers of {latin_name}', ImageUses.PLANT_FLOWER],
                    ['leaf', 'leaf_images', f'Leaves of {latin_name}', ImageUses.PLANT_LEAF],
                    ['fruit', 'fruit_images', f'Fruits of {latin_name}', ImageUses.PLANT_FRUIT],
                    ['bark', 'bark_images', f'Bark of {latin_name}', ImageUses.PLANT_BARK],
                    ['habit', 'habit_images', f'{latin_name} in its habitat', ImageUses.PLANT_HABIT]
                ]
                [download_helper(*args) for args in field_arguments]
            print(f'Adding plant to db session: {plant_obj}')
            db.session.add(plant_obj)
            if AUTO_CREATE_SKU:
                sku_obj = Handler.create(SkuHandler, True, plant_obj)
                db.session.add(sku_obj)
            db.session.commit()
            print('YESSSS')
        db.session.commit()


if __name__ == '__main__':
    plants_to_model()