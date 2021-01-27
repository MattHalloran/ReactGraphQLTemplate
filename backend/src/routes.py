from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app, db
from src.models import User, AccountStatus, Plant, Sku, Image, ImageUses, ContactInfo
from src.handlers.handler import Handler
from src.handlers.businessHandler import BusinessHandler
from src.handlers.userHandler import UserHandler
from src.handlers.skuHandler import SkuHandler
from src.handlers.emailHandler import EmailHandler
from src.handlers.phoneHandler import PhoneHandler
from src.handlers.plantHandler import PlantHandler
from src.handlers.imageHandler import ImageHandler
from src.handlers.contactInfoHandler import ContactInfoHandler
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from src.config import Config
from src.utils import get_image_meta, find_available_file_names
from sqlalchemy import exc
import ast
import traceback
from enum import Enum
from base64 import b64encode, b64decode
import json
from os import path
from functools import wraps

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

# ============= Helper Methods ========================


# Helper method for grabbing form data from the request
def getForm(*names):
    if (len(names) == 1):
        return request.form.getlist(names[0])
    return [request.form.getlist(name) for name in names]


# Helper method for grabbing json data from the request
def getJson(*names):
    incoming = request.get_json()
    if (len(names) == 1):
        return incoming[names[0]]
    return [incoming[name] for name in names]


# Helper method for grabbing data from the request
def getData(*names):
    byte_data = request.data
    dict_str = byte_data.decode('UTF-8')
    data = ast.literal_eval(dict_str)
    if (len(names) == 1):
        return data[names[0]]
    return [data[name] for name in names]


# Wraps functions in try/except
def handle_exception(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            print(traceback.format_exc())
            return {"status": AuthCodes.ERROR_UNKNOWN.value}

    return decorated

# =========== End Helper Methods ========================


@app.route('/api/register', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def register():
    data = getData('first_name', 'last_name', 'business', 'email', 'phone', 'password', 'existing_customer')
    email = Handler.create(EmailHandler, data[3], True)
    phone = Handler.create(PhoneHandler, data[4], '+1', '', True, True)
    business = Handler.create(BusinessHandler, data[2], email, phone, True)
    user = Handler.create(UserHandler, data[0], data[1], '', data[5], data[6])
    user.personal_email.append(email)
    db.session.add(email)
    db.session.add(phone)
    db.session.add(business)
    db.session.add(user)
    try:
        db.session.commit()
        welcome(data[3])
    # Most likely means that a user with that email already exists
    except exc.IntegrityError:
        print(traceback.format_exc())
        status = AuthCodes.FAILURE_EMAIL_EXISTS.value
        return {"status": status}
    status = AuthCodes.SUCCESS.value
    return {"token": generate_token(app, user),
            "user": UserHandler.to_dict(user),
            "status": status}


@app.route('/api/get_token', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def get_token():
    (email, password) = getData('email', 'password')
    user = UserHandler.get_user_from_credentials(email, password)
    if user:
        token = generate_token(app, user)
        print(f'RECEIVED TOKEN!!!!!! {token}')
        UserHandler.set_token(user, token)
        db.session.commit()
        return {
            "user": UserHandler.to_dict(user),
            "token": token,
            "status": AuthCodes.SUCCESS.value,
        }
    else:
        account_status = UserHandler.get_user_lock_status(email)
        print(f'User account status is {account_status}')
        status = AuthCodes.ERROR_UNKNOWN.value
        if account_status == -1:
            status = AuthCodes.FAILURE_NO_USER.value
        elif account_status == AccountStatus.SOFT_LOCK.value:
            status = AuthCodes.FAILURE_SOFT_LOCKOUT.value
        elif account_status == AccountStatus.HARD_LOCK.value:
            status = AuthCodes.FAILURE_HARD_LOCKOUT.value
        return jsonify(status=status)


@app.route('/api/reset_password_request', methods=['POST'])
@handle_exception
def send_password_reset_request():
    email = getData('email')
    reset_password(email)
    return {"status": AuthCodes.SUCCESS.value}


@app.route("/api/is_token_valid", methods=["POST"])
@handle_exception
def is_token_valid():
    token = getJson('token')
    print(f'GOT INCOMINGGGGGGGGGGGGGGGGGGG {token}')
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
@handle_exception
def fetch_inventory():
    skus = SkuHandler.all_skus()
    page_results = [SkuHandler.to_dict(SkuHandler.from_sku(sku)) for sku in skus]
    return {
        "all_skus": skus,
        "page_results": page_results,
        "status": AuthCodes.SUCCESS.value
    }


# Returns inventory data for the given inventory IDs
@app.route("/api/fetch_inventory_page", methods=["POST"])
@handle_exception
def fetch_inventory_page():
    skus = getJson('skus')
    return {
        "data": [SkuHandler.to_dict(sku) for sku in skus],
        "status": AuthCodes.SUCCESS.value
    }


# Returns display information of all gallery photos.
@app.route("/api/fetch_gallery", methods=["POST"])
@handle_exception
def fetch_gallery():
    images_data = [ImageHandler.to_dict(img) for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
    print('boop le snoot')
    print(images_data)
    return {
        "images_meta": json.dumps(images_data),
        "status": AuthCodes.SUCCESS.value
    }


# Returns thumbnails for a list of images
@app.route("/api/image_thumbnails", methods=["POST"])
@handle_exception
def image_thumbnails():
    hashes = getJson('hashes')
    print(f'here boopy boop {hashes}')
    thumbnail_data = []
    for hash in hashes:
        img = ImageHandler.from_hash(hash)
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
@app.route("/api/image_hash", methods=["POST"])
@handle_exception
def image_from_hash():
    img_hash = getJson('hash')
    print(f'trying to get image from hash {img_hash}')
    # Get image data from its hash
    img = ImageHandler.from_hash(img_hash)
    if not img:
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    b64 = ImageHandler.get_b64(img)
    return {
        "image": b64,
        "alt": img.alt,
        "status": AuthCodes.SUCCESS.value
    }


# Returns an image from its hash
@app.route("/api/image_sku", methods=["POST"])
@handle_exception
def image_from_sku():
    sku_code = getJson('sku')
    print(f'trying to get image from sku {sku_code}')
    # Get image data from its hash
    sku = SkuHandler.from_sku(sku_code)
    if not sku:
        print('FAILED TO FIND SKU ROW')
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    b64 = SkuHandler.get_display_image(sku)
    if not b64:
        print(' NO B64444444 ')
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    return {
        "image": b64,
        "alt": 'TODO',
        "status": AuthCodes.SUCCESS.value
    }


# TODO - check image size and extension to make sure it is valid
@app.route("/api/upload_gallery_image/", methods=["POST"])
@handle_exception
def upload_gallery_image():
    (names, extensions, images) = getForm('name', 'extension', 'image')
    print(f'NUMBER OF IMAGESSSS: {len(images)}')
    status = AuthCodes.SUCCESS.value
    passed_indexes = []
    failed_indexes = []
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
        if ImageHandler.is_hash_used(img_hash):
            print('Image already in backend!')
            status = AuthCodes.ERROR_SOME_IMAGES_ALREADY_UPLOADED.value
            failed_indexes.append(i)
            continue
        (img_name, thumb_name) = find_available_file_names(Config.GALLERY_DIR, img_name, img_extension)
        img_path = f'{Config.GALLERY_DIR}/{img_name}.{img_extension}'
        thumbnail_path = f'{Config.GALLERY_DIR}/{thumb_name}.{img_extension}'
        # Save image
        with open(img_path, 'wb') as f:
            f.write(b64decode(img_data))
        # Save image thumbnail
        thumbnail.save(thumbnail_path)
        # Add image data to database
        img_row = Handler.create(ImageHandler,
                                 Config.GALLERY_DIR,
                                 img_name,
                                 thumbnail_name,
                                 img_extension,
                                 'TODO',
                                 img_hash,
                                 ImageUses.GALLERY,
                                 img_width,
                                 img_height)
        db.session.add(img_row)
        db.session.commit()
        passed_indexes.append(i)
    return {"passed_indexes": passed_indexes,
            "failed_indexes": failed_indexes,
            "status": status}


@app.route("/api/fetch_contact_info", methods=["POST"])
@handle_exception
def fetch_contact_info():
    print('TODOOOO')
    return False


# First verifies that the user is an admin, then updates company contact info
@app.route("/api/update_contact_info", methods=["POST"])
@handle_exception
def update_contact_info():
    json = request.form.to_dict(flat=False)
    id = json['id']
    contact = Handler.from_id(ContactInfo, id)
    if contact is None:
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    Handler.update(ContactInfoHandler, json)
    db.session.commit()
    return {"status": AuthCodes.SUCCESS.value}


@app.route("/api/fetch_profile_info", methods=["POST"])
@handle_exception
def fetch_profile_info():
    (email, token) = getJson('email', 'token')
    print(f'boopies {email} {token}')
    user_data = UserHandler.get_profile_data(email, token, app)
    if user_data is str:
        print('FAILEDDDD')
        print(user_data)
        return {"status": AuthCodes.ERROR_UNKNOWN.value}
    print('SUCESS BABYYYYY')
    print(user_data)
    user_data['status'] = AuthCodes.SUCCESS.value
    return user_data
