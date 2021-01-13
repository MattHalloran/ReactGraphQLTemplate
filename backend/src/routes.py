from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app
from src.models import db, User, Plant, AccountStatuses, Image, ImageUses
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from src.config import Config
from src.utils import get_image_meta
from sqlalchemy import exc
import ast
import traceback
from enum import Enum
from base64 import b64encode, b64decode
import json
from os import path

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


# Must keep this in sync with the frontend auth code enums
class AuthCodes(Enum):
    SUCCESS = 100
    ERROR_UNKNOWN = 200
    FAILURE_EMAIL_EXISTS = 400
    FAILURE_NO_USER = 900
    FAILURE_SOFT_LOCKOUT = 910
    FAILURE_HARD_LOCKOUT = 920
    FAILURE_NOT_VERIFIED = 1400
    ERROR_SOME_IMAGES_ALREADY_UPLOADED = 2500


@app.route('/api/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        user = User(name=data['name'], email=data['email'],
                    password=data['password'], existing_customer=data['existing_customer'])
        print(f'here4 {data["name"]} {data["email"]} {hash} {user}')
        db.session.add(user)
        try:
            db.session.commit()
            welcome(data['email'])
        # Most likely means that a user with that email already exists
        except exc.IntegrityError:
            print(traceback.format_exc())
            status = AuthCodes.FAILURE_EMAIL_EXISTS.value
            return {"status": status}
        status = AuthCodes.SUCCESS.value
        return {"token": generate_token(app, user),
                "user": user.to_json(),
                "status": status}
    except Exception:
        print(traceback.format_exc())
        status = AuthCodes.ERROR_UNKNOWN.value
        return {"status": status}


@app.route('/api/get_token', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_token():
    try:
        incoming = request.get_json()
        print(incoming)
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        user = User.get_user_from_credentials(data['email'], data['password'])
        if user:
            return {
                "user": user.to_json(),
                "token": generate_token(app, user),
                "status": AuthCodes.SUCCESS.value,
            }
        else:
            account_status = User.get_user_lock_status(data['email'])
            print(f'User account status is {account_status}')
            status = AuthCodes.ERROR_UNKNOWN.value
            if account_status == -1:
                status = AuthCodes.FAILURE_NO_USER.value
            elif account_status == AccountStatuses.SOFT_LOCK.value:
                status = AuthCodes.FAILURE_SOFT_LOCKOUT.value
            elif account_status == AccountStatuses.HARD_LOCK.value:
                status = AuthCodes.FAILURE_HARD_LOCKOUT.value
            return jsonify(status=status)
    except Exception:
        print(traceback.format_exc())
        return {"status": AuthCodes.ERROR_UNKNOWN.value}


@app.route('/api/reset_password_request', methods=['POST'])
def send_password_reset_request():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        reset_password(data['email'])
        return {"status": AuthCodes.SUCCESS.value}
    except Exception:
        print(traceback.format_exc())
        return {"status": AuthCodes.ERROR_UNKNOWN.value}


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    print('GOT INCOMINGGGGGGGGGGGGGGGGGGG')
    print(incoming)
    token = incoming['token']
    is_valid = verify_token(app, token) if (token is not None) else False

    if is_valid:
        status = AuthCodes.SUCCESS.value
        return jsonify(token_is_valid=True, status=status)
    else:
        status = AuthCodes.FAILURE_NOT_VERIFIED.value
        return jsonify(token_is_valid=False, status=status)


if __name__ == '__main__':
    app.run(debug=True)


# Returns IDs of all inventory items available to the customer.
# Also returns required info to display the first page of results
@app.route("/api/fetch_inventory", methods=["POST"])
def fetch_inventory():
    item_IDs = Plant.all_plant_ids()
    page_results = [Plant.from_id(id) for id in item_IDs]
    return {
        "all_plant_ids": item_IDs,
        "page_results": page_results,
        "status": AuthCodes.SUCCESS.value
    }


# Returns inventory data for the given inventory IDs
@app.route("/api/fetch_inventory_page", methods=["POST"])
def fetch_inventory_page():
    incoming = request.get_json()
    return [Plant.from_id(id) for id in incoming['ids']]


# Returns display information of all gallery photos.
@app.route("/api/fetch_gallery", methods=["POST"])
def fetch_gallery():
    images_data = [img.to_json() for img in Image.query.all()]
    print('boop le snoot')
    print(images_data)
    return {
        "images_meta": json.dumps(images_data),
        "status": AuthCodes.SUCCESS.value
    }


# Returns thumbnails for a list of images
@app.route("/api/image_thumbnails", methods=["POST"])
def image_thumbnails():
    incoming = request.get_json()
    print('here boopy boop')
    print(incoming)
    hashes = incoming['hashes']
    thumbnail_data = []
    for hash in hashes:
        img = Image.from_hash(hash)
        if not img:
            thumbnail_data.append([])
            continue
        with open(f'{img.directory}/{img.thumbnail_file_name}.{img.extension}', 'rb') as open_file:
            byte_content = open_file.read()
        base64_bytes = b64encode(byte_content)
        base64_string = base64_bytes.decode('utf-8')
        thumbnail_data.append(base64_string)
    return {
        "thumbnails": thumbnail_data,
        "status": AuthCodes.SUCCESS.value
    }


# Returns an image from its hash
@app.route("/api/image", methods=["POST"])
def image():
    incoming = request.get_json()
    print('trying to get image')
    print(incoming)
    img_hash = incoming['hash']
    # Get image data from its hash
    img = Image.from_hash(img_hash)
    if not img:
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    # Read image file
    with open(f'{img.directory}/{img.file_name}.{img.extension}', 'rb') as open_file:
        byte_content = open_file.read()
    # Convert image to a base64 string
    base64_bytes = b64encode(byte_content)
    base64_string = base64_bytes.decode('utf-8')
    return {
        "image": base64_string,
        "status": AuthCodes.SUCCESS.value
    }


# TODO - check image size and extension to make sure it is valid
@app.route("/api/upload_gallery_image/", methods=["POST"])
def upload_gallery_image():
    try:
        status = AuthCodes.SUCCESS.value
        failed_indexes = []
        # Grab data from request form
        names = request.form.getlist('name')
        extensions = request.form.getlist('extension')
        images = request.form.getlist('image')
        # Iterate through images
        for i in range(len(images)):
            img_name = names[i]
            thumbnail_name = f'{img_name}-thumb'
            img_extension = extensions[i]
            # Data is stored in base64, and the beginning of the
            # string is not needed
            img_data = images[i][len('data:image/jpeg;base64,'):]
            (img_hash, thumbnail, img_width, img_height) = get_image_meta(b64decode(img_data))
            # If image hash matches a row in the database, then the
            # image was uploaded already
            if Image.is_hash_used(img_hash):
                print('Image already in backend!')
                status = AuthCodes.ERROR_SOME_IMAGES_ALREADY_UPLOADED.value
                failed_indexes.append(i)
                continue
            # Create a path to store the image and thumbnail, that don't already exist
            img_dir = Config.GALLERY_DIR
            img_path = ''
            thumbnail_path = ''
            path_attempts = 0
            while True and path_attempts < 100:
                img_path = f'{img_dir}/{img_name}.{img_extension}'
                thumbnail_path = f'{img_dir}/{thumbnail_name}.{img_extension}'
                if not path.exists(img_path) and not path.exists(thumbnail_path):
                    break
                img_name = f'image{path_attempts}'
                thumbnail_name = f'{img_name}-thumb'
                path_attempts = path_attempts + 1
            # Save image
            with open(img_path, 'wb') as f:
                f.write(b64decode(img_data))
            # Save image thumbnail
            thumbnail.save(thumbnail_path)
            # Add image data to database
            img_row = Image(Config.GALLERY_DIR, img_name, thumbnail_name, img_extension, 'TODO', img_hash, ImageUses.GALLERY.value, img_width, img_height)
            db.session.add(img_row)
            db.session.commit()
        return {"failed_indexes": failed_indexes,
                "status": status}
    except Exception:
        print(traceback.format_exc())
        return {"status": AuthCodes.ERROR_UNKNOWN.value}


@app.route("/api/fetch_contact_info", methods=["POST"])
def fetch_contact_info():
    print('TODOOOO')
    return False


# First verifies that the user is an admin, then updates company contact info
@app.route("/api/update_contact_info", methods=["POST"])
def update_contact_info():
    incoming = request.get_json()
    print('TODOOOOOOO')
    return False
