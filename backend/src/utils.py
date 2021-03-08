from PIL import Image
from PIL.Image import ANTIALIAS
import numpy as np
from io import BytesIO
from os import path
from src.config import Config


def find_available_file_names(folder: str, img_name: str, extension: str):
    '''Using suggested image file name, returns file name
    that is not being used'''
    suggested_img_name = img_name
    path_attempts = 0
    while True and path_attempts < 100:
        img_path = f'{Config.BASE_IMAGE_DIR}/{folder}/{img_name}.{extension}'
        # If both paths are available
        if not path.exists(img_path):
            return img_name
        img_name = f'{suggested_img_name}({path_attempts})'
        path_attempts += 1
    raise Exception('Could not find an available file name!')


def resize_image(image_str: str, dim: tuple):
    img = Image.open(BytesIO(image_str))
    (curr_width, curr_height) = img.size
    width = min(curr_width, dim[0])
    height = min(curr_height, dim[1])
    img.thumbnail([width, height], ANTIALIAS)
    return img


def get_image_meta(image_str: str, hash_size=8, mean=np.mean):
    """ Returns metadata about the image:
    1) Image hash, using the average hash algorithm
    2) Image width
    3) Image height """
    if hash_size < 2:
        raise ValueError("Hash size must be greater than or equal to 2")

    # Load image using PIL to find width and height
    image = Image.open(BytesIO(image_str))
    (width, height) = image.size

    # reduce size and complexity, then covert to grayscale
    image = image.convert("L").resize((hash_size, hash_size), Image.ANTIALIAS)

    # find average pixel value; 'pixels' is an array of the pixel values, ranging from 0 (black) to 255 (white)
    pixels = np.asarray(image)
    avg = mean(pixels)

    # create string of bits
    diff = pixels > avg
    diff_as_string = ''.join(['1' if x else '0' for x in diff.flatten().tolist()])

    return (diff_as_string, width, height)


def salt(length: int):
    '''Generates a random string of letters and numbers'''
    import random
    ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chars = []
    for i in range(length):
        chars.append(random.choice(ALPHABET))
    return "".join(chars)


def priceStringToDecimal(price: str):
    from re import sub
    from decimal import Decimal
    from decimal import InvalidOperation
    try:
        return Decimal(sub(r'[^\d.]', '', price))
    except InvalidOperation:
        return 0
