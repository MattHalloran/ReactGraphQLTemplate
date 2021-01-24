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
from src.handlers.imageHandler import ImageHandler  # NOQA
from src.handlers.plantHandler import PlantTraitHandler, PlantHandler  # NOQA
from src.utils import get_image_meta, find_available_file_names  # NOQA

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
            image_objects.append(None)
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
            drought_tolerance = get_trait(PlantTraitOptions.DROUGHT_TOLERANCE,
                                          plant.get('drought_tolerance', None))
            if drought_tolerance:
                plant_args['drought_tolerance_id'] = drought_tolerance.id
            grown_height = get_trait(PlantTraitOptions.GROWN_HEIGHT,
                                     plant.get('grown_height', None))
            if grown_height:
                plant_args['grown_height_id'] = grown_height.id
            grown_spread = get_trait(PlantTraitOptions.GROWN_SPREAD,
                                     plant.get('grown_spread', None))
            if grown_spread:
                plant_args['grown_spread_id'] = grown_spread.id
            growth_rate = get_trait(PlantTraitOptions.GROWTH_RATE,
                                    plant.get('growth_rate', None))
            if growth_rate:
                plant_args['growth_rate_id'] = growth_rate.id
            optimal_light = get_trait(PlantTraitOptions.OPTIMAL_LIGHT,
                                      plant.get('optimal_light', None))
            if optimal_light:
                plant_args['optimal_light_id'] = optimal_light.id
            salt_tolerance = get_trait(PlantTraitOptions.SALT_TOLERANCE,
                                       plant.get('salt_tolerance', None))
            if salt_tolerance:
                plant_args['salt_tolerance_id'] = salt_tolerance.id
            # Create a plant object using the collected data
            plant_obj = Handler.create(PlantHandler, plant_args['latin_name'])
            Handler.update(PlantHandler, plant_obj, plant_args)
            # Collect other plant data
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
            # TODO images!!!!
            if (image_dict := plant.get('plantnet_images', None)):
                if (flower_images := image_dict.get('flower', None)):
                    download_and_store_imgs(flower_images, f"Flowers of {plant_args['latin_name']}", ImageUses.PLANT_FLOWER)
                if (leaf_images := image_dict.get('leaf', None)):
                    download_and_store_imgs(leaf_images, f"Leaves of {plant_args['latin_name']}", ImageUses.PLANT_LEAF)
                if (fruit_images := image_dict.get('fruit', None)):
                    download_and_store_imgs(fruit_images, f"Fruits of {plant_args['latin_name']}", ImageUses.PLANT_FRUIT)
                if (bark_images := image_dict.get('bark', None)):
                    download_and_store_imgs(bark_images, f"Bark of {plant_args['latin_name']}", ImageUses.PLANT_BARK)
                if (habit_images := image_dict.get('habit', None)):
                    download_and_store_imgs(habit_images, f"{plant_args['latin_name']} in its habitat", ImageUses.PLANT_HABIT)
            print(f'Adding plant to db session: {plant_obj}')
            db.session.add(plant_obj)
            db.session.commit()
            print('YESSSS')
        db.session.commit()


if __name__ == '__main__':
    plants_to_model()
