from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app
from src.models import db, User, Plant, AccountStatuses, Image
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from src.config import Config
from sqlalchemy import exc
import ast
import traceback
from enum import Enum
from base64 import b64encode
import json

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


# Must keep this in sync with the frontend auth code enums
class AuthCodes(Enum):
    REGISTER_SUCCESS = 300
    REGISTER_ERROR_EMAIL_EXISTS = 400
    REGISTER_ERROR_UNKNOWN = 500
    FETCH_PROTECTED_DATA_REQUEST = 600
    RECEIVE_PROTECTED_DATA = 700
    TOKEN_FOUND = 800
    TOKEN_NOT_FOUND_NO_USER = 900
    TOKEN_NOT_FOUND_SOFT_LOCKOUT = 910
    TOKEN_NOT_FOUND_HARD_LOCKOUT = 920
    TOKEN_NOT_FOUND_ERROR_UNKNOWN = 1000
    RESET_PASSWORD_SUCCESS = 1100
    RESET_PASSWORD_ERROR_UNKNOWN = 1200
    TOKEN_VERIFIED = 1300
    TOKEN_NOT_VERIFIED = 1400
    FETCH_INVENTORY_SUCCESS = 1500
    FETCH_INVENTORY_ERROR_UNKNOWN = 1600
    FETCH_INVENTORY_PAGE_SUCCESS = 1700
    FETCH_INVENTORY_PAGE_ERROR_UNKNOWN = 1800
    FETCH_GALLERY_SUCCESS = 1900
    FETCH_GALLERY_ERROR_UNKNOWN = 2000
    FETCH_GALLERY_IMAGE_SUCCESS = 2100
    FETCH_GALLERY_IMAGE_ERROR_UNKNOWN = 2200


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
            status = AuthCodes.REGISTER_ERROR_EMAIL_EXISTS.value
            return {"status": status}
        status = AuthCodes.REGISTER_SUCCESS.value
        return {"token": generate_token(app, user),
                "user": user.to_json(),
                "status": status}
    except Exception:
        print(traceback.format_exc())
        status = AuthCodes.REGISTER_ERROR_UNKNOWN.value
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
                "status": AuthCodes.TOKEN_FOUND.value,
            }
        else:
            account_status = User.get_user_lock_status(data['email'])
            print(f'User account status is {account_status}')
            status = AuthCodes.TOKEN_NOT_FOUND_ERROR_UNKNOWN.value
            if account_status == -1:
                status = AuthCodes.TOKEN_NOT_FOUND_NO_USER.value
            elif account_status == AccountStatuses.SOFT_LOCK.value:
                status = AuthCodes.TOKEN_NOT_FOUND_SOFT_LOCKOUT.value
            elif account_status == AccountStatuses.HARD_LOCK.value:
                status = AuthCodes.TOKEN_NOT_FOUND_HARD_LOCKOUT.value
            return jsonify(status=status)
    except Exception:
        print(traceback.format_exc())
        return {"status": AuthCodes.TOKEN_NOT_FOUND_ERROR_UNKNOWN.value}


@app.route('/api/reset_password_request', methods=['POST'])
def send_password_reset_request():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        reset_password(data['email'])
        return {"status": AuthCodes.RESET_PASSWORD_SUCCESS.value}
    except Exception:
        print(traceback.format_exc())
        return {"status": AuthCodes.RESET_PASSWORD_ERROR_UNKNOWN.value}


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    token = incoming['token']
    is_valid = verify_token(app, token) if (token is not None) else False

    if is_valid:
        status = AuthCodes.TOKEN_VERIFIED.value
        return jsonify(token_is_valid=True, status=status)
    else:
        status = AuthCodes.TOKEN_NOT_VERIFIED.value
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
        "status": AuthCodes.FETCH_INVENTORY_SUCCESS.value
    }


# Returns inventory data for the given inventory IDs
@app.route("/api/fetch_inventory_page", methods=["POST"])
def fetch_inventory_page():
    incoming = request.get_json()
    return [Plant.from_id(id) for id in incoming['ids']]


@app.route("/api/upload_image", methods=["POST"])
def upload_image():
    incoming = request.get_json()
    print('TODO')


# Returns display information of all gallery photos.
@app.route("/api/fetch_gallery", methods=["POST"])
def fetch_gallery():
    images_data = [img.to_json() for img in Image.query.all()]
    print('boop le snoot')
    print(images_data)
    return {
        "images_meta": json.dumps(images_data),
        "status": AuthCodes.FETCH_GALLERY_SUCCESS.value
    }


# Returns an image stored in the gallery folder
@app.route("/api/gallery/<path:filename>", methods=["POST"])
def gallery_image(filename):
    print('IN GALLERY IMAGE METHOD YAY')
    print(filename)
    with open(f'{Config.GALLERY_DIR}/{filename}', 'rb') as open_file:
        print('BOOP in the file read WOOOOOO BABYYYYY')
        byte_content = open_file.read()
    base64_bytes = b64encode(byte_content)
    base64_string = base64_bytes.decode('utf-8')
    return {
        "image": base64_string,
        "status": AuthCodes.FETCH_GALLERY_IMAGE_SUCCESS.value
    }


# First verifies that the user is an admin, then updates company contact info
@app.route("/api/update_contact_info", methods=["POST"])
def update_contact_info():
    incoming = request.get_json()
    print('TODO')
    return False
