# Delete stored asset images that are no longer associated with
# Image rows in the database (happens if the database was dropped)
import os
from os import listdir
from os.path import isfile, join, dirname
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.api import db, create_app  # NOQA
from src.config import Config  # NOQA
from src.models import Image # NOQA
from src.handlers import ImageHandler # NOQA

app = create_app()


def find_unused_images():
    '''Returns a list of all image file names not assocated with model objects'''
    # TODO these joins were written before the image storing was changed from absolute to relative paths. WILL DEFINITELY BREAK
    img_files = [join(Config.PLANT_FOLDER, f) for f in listdir(Config.PLANT_FOLDER) if isfile(join(Config.PLANT_FOLDER, f))] + \
                [join(Config.GALLERY_FOLDER, f) for f in listdir(Config.GALLERY_FOLDER) if isfile(join(Config.GALLERY_FOLDER, f))]
    with app.app_context():
        image_ids = ImageHandler.all_ids()
        for id in image_ids:
            image_obj = ImageHandler.from_id(id)
            file_path = f'../{Config.BASE_IMAGE_DIR}/{image_obj.folder}/{image_obj.file_name}.{image_obj.extension}'
            if file_path in img_files:
                img_files.remove(file_path)
    return img_files


def delete_unused_images():
    img_files = find_unused_images()
    for file in img_files:
        os.remove(file)


if __name__ == '__main__':
    delete_unused_images()
