from PIL import Image
from PIL.Image import ANTIALIAS
import numpy as np
from io import BytesIO

def get_image_meta(image_str: str, hash_size=8, mean=np.mean):
    """ Returns metadata about the image:
    1) Image hash, using the average hash algorithm
    2) Thumbnail
    3) Image width
    4) Image height """
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

    # Create thumbnail
    thumb = Image.open(BytesIO(image_str))
    thumb.thumbnail([256, 512], ANTIALIAS)

    return (diff_as_string, thumb, width, height)
