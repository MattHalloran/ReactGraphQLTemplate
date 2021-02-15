from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app, db
from src.models import AccountStatus, Sku, SkuStatus, ImageUses, Plant, PlantTrait, PlantTraitOptions
from src.handlers import BusinessHandler, UserHandler, SkuHandler, EmailHandler, OrderHandler
from src.handlers import PhoneHandler, PlantHandler, PlantTraitHandler, ImageHandler, ContactInfoHandler, OrderItemHandler
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from src.config import Config
from src.utils import get_image_meta, find_available_file_names
from sqlalchemy import exc
import traceback
from base64 import b64encode, b64decode
import json
import os
from functools import wraps

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
PREFIX = '/api'
with open(os.path.join(os.path.dirname(__file__),"consts/codes.json"), 'r') as f:
    StatusCodes = json.load(f)
with open(os.path.join(os.path.dirname(__file__),"consts/codes.json"), 'r') as f:
    RoutePaths = json.load(f)

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
    data = json.loads(dict_str)
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
            return {"status": StatusCodes['ERROR_UNKNOWN']}

    return decorated

# =========== End Helper Methods ========================

@app.route(f'{PREFIX}/test', methods=['POST'])
@handle_exception
def test():
    '''Used for testing client/server connection'''
    print('IN TEST METHOD')
    return {
        "test_value": 1234,
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/test_cross_origin', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def test_cross_origin():
    '''Used for testing client/server connection'''
    print('IN CROSS ORIGIN TEST METHOD')
    return {
        "test_value": 4321,
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/register', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def register():
    data = getData('first_name', 'last_name', 'business', 'email', 'phone', 'password', 'existing_customer')
    email = EmailHandler.create(data[3], True)
    phone = PhoneHandler.create(data[4], '+1', '', True, True)
    business = BusinessHandler.create(data[2], email, phone, True)
    user = UserHandler.create(data[0], data[1], '', data[5], data[6])
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
        status = StatusCodes['FAILURE_EMAIL_EXISTS']
        return {"status": status}
    status = StatusCodes['SUCCESS']
    return {"token": generate_token(app, user),
            "user": UserHandler.to_dict(user),
            "status": status}


@app.route(f'{PREFIX}/get_token', methods=['POST'])
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
            "status": StatusCodes['SUCCESS'],
        }
    else:
        account_status = UserHandler.get_user_lock_status(email)
        print(f'User account status is {account_status}')
        status = StatusCodes['ERROR_UNKNOWN']
        if account_status == -1:
            status = StatusCodes['FAILURE_NO_USER']
        elif account_status == AccountStatus.SOFT_LOCK.value:
            status = StatusCodes['FAILURE_SOFT_LOCKOUT']
        elif account_status == AccountStatus.HARD_LOCK.value:
            status = StatusCodes['FAILURE_HARD_LOCKOUT']
        return jsonify(status=status)


@app.route(f'{PREFIX}/reset_password_request', methods=['POST'])
@handle_exception
def send_password_reset_request():
    email = getData('email')
    reset_password(email)
    return {"status": StatusCodes['SUCCESS']}


@app.route(f'{PREFIX}/is_token_valid', methods=["POST"])
@handle_exception
def is_token_valid():
    token = getJson('token')
    print(f'GOT INCOMINGGGGGGGGGGGGGGGGGGG {token}')
    is_valid = verify_token(app, token) if (token is not None) else False

    if is_valid:
        status = StatusCodes['SUCCESS']
        return jsonify(token_is_valid=True, status=status)
    else:
        status = StatusCodes['FAILURE_NOT_VERIFIED']
        return jsonify(token_is_valid=False, status=status)


if __name__ == '__main__':
    app.run()


# Returns list of filters to sort the inventory by
@app.route(f'{PREFIX}/fetch_inventory_filters', methods=["POST"])
@handle_exception
def fetch_inventory_filters():
    # NOTE: keys must match the field names in plant or sku (besides status)
    return {
        "size": SkuHandler.uniques(Sku.size),
        "optimal_light": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.OPTIMAL_LIGHT),
        "drought_tolerance": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.DROUGHT_TOLERANCE),
        "grown_height": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWN_HEIGHT),
        "grown_spread": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWN_SPREAD),
        "growth_rate": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWTH_RATE),
        "salt_tolerance": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SALT_TOLERANCE),
        "light_ranges": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.LIGHT_RANGE),
        "attracts_pollinators_and_wildlifes": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.ATTRACTS_POLLINATORS_AND_WILDLIFE),
        "soil_moistures": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_MOISTURE),
        "soil_phs": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_PH),
        "soil_types": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_TYPE),
        "zones": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.ZONE),
        "status": StatusCodes['SUCCESS']
    }


# Returns IDs of all inventory items available to the customer.
# Also returns required info to display the first page of results
@app.route(f'{PREFIX}/fetch_inventory', methods=["POST"])
@handle_exception
def fetch_inventory():
    # Grab sort option
    (sorter, page_size, admin) = getData('sorter', 'page_size', 'admin')
    # Find all SKUs available to the customer
    skus = None
    if (admin):
        skus = [SkuHandler.from_id(id) for id in SkuHandler.all_ids()]
    else:
        skus = SkuHandler.all_available_skus()
    sort_map = {
        'az': (lambda s: s.plant.latin_name if s.plant else '', False),
        'za': (lambda s: s.plant.latin_name if s.plant else '', True),
        'lth': (lambda s: s.price, False),
        'htl': (lambda s: s.price, True),
        'new': (lambda s: s.date_added, True),
        'old': (lambda s: s.date_added, True),
    }
    print(f'SORTER ISSSSS {sorter}')
    # Sort the SKUs
    sort_data = sort_map.get(sorter, None)
    if sort_data is None:
        print('Could not find the correct sorter')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    skus.sort(key=sort_data[0], reverse=sort_data[1])
    sku_page = skus[0: min(len(skus), page_size)]
    page_results = [SkuHandler.to_dict(sku) for sku in sku_page]
    return {
        "all_skus": [sku.sku for sku in skus],
        "page_results": page_results,
        "status": StatusCodes['SUCCESS']
    }


# Returns IDs of plant templates in the database,
# as well as info to display the first page
@app.route(f'{PREFIX}/fetch_plants', methods=["POST"])
@handle_exception
def fetch_plants():
    ids = PlantHandler.all_ids()
    page_results = [PlantHandler.to_dict(PlantHandler.from_id(id)) for id in ids]
    return {
        "all_plants": ids,
        "page_results": page_results,
        "status": StatusCodes['SUCCESS']
    }


# Returns inventory data for the given inventory IDs
@app.route(f'{PREFIX}/fetch_inventory_page', methods=["POST"])
@handle_exception
def fetch_inventory_page():
    skus = getData('skus')
    return {
        "data": [SkuHandler.to_dict(SkuHandler.from_sku(sku)) for sku in skus],
        "status": StatusCodes['SUCCESS']
    }


# Returns display information of all gallery photos.
@app.route(f'{PREFIX}/fetch_gallery', methods=["POST"])
@handle_exception
def fetch_gallery():
    images_data = [ImageHandler.to_dict(img) for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
    print('boop le snoot')
    print(images_data)
    return {
        "images_meta": json.dumps(images_data),
        "status": StatusCodes['SUCCESS']
    }


# Returns thumbnails for a list of images
@app.route(f'{PREFIX}/image_thumbnails', methods=["POST"])
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
        with open(f'{Config.BASE_IMAGE_DIR}/{img.folder}/{img.thumbnail_file_name}.{img.extension}', 'rb') as open_file:
            byte_content = open_file.read()
        base64_bytes = b64encode(byte_content)
        base64_string = base64_bytes.decode('utf-8')
        thumbnail_data.append(base64_string)
    return {
        "thumbnails": thumbnail_data,
        "status": StatusCodes['SUCCESS']
    }


# Returns an image from its hash
@app.route(f'{PREFIX}/image_hash', methods=["POST"])
@handle_exception
def image_from_hash():
    img_hash = getJson('hash')
    print(f'trying to get image from hash {img_hash}')
    # Get image data from its hash
    img = ImageHandler.from_hash(img_hash)
    if not img:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    b64 = ImageHandler.get_b64(img)
    return {
        "image": b64,
        "alt": img.alt,
        "status": StatusCodes['SUCCESS']
    }


# Returns an image from its hash
@app.route(f'{PREFIX}/image_sku', methods=["POST"])
@handle_exception
def image_from_sku():
    sku_code = getJson('sku')
    print(f'trying to get image from sku {sku_code}')
    # Get image data from its hash
    sku = SkuHandler.from_sku(sku_code)
    print(f'SKU IS {sku}')
    if not sku:
        print('FAILED TO FIND SKU ROW')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    b64 = SkuHandler.get_display_image(sku)
    if not b64:
        print(' NO B64444444 ')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    return {
        "image": b64,
        "alt": 'TODO',
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/upload_availability', methods=["POST"])
@handle_exception
def upload_availability():
    # Check to make sure requestor is an admin TODO
    (data) = getJson('data')
    # TODO


# TODO - check image size and extension to make sure it is valid
@app.route(f'{PREFIX}/upload_gallery_image', methods=["POST"])
@handle_exception
def upload_gallery_image():
    (names, extensions, images) = getForm('name', 'extension', 'image')
    print(f'NUMBER OF IMAGESSSS: {len(images)}')
    status = StatusCodes['SUCCESS']
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
            status = StatusCodes['ERROR_SOME_IMAGES_ALREADY_UPLOADED']
            failed_indexes.append(i)
            continue
        (img_name, thumb_name) = find_available_file_names(Config.GALLERY_FOLDER, img_name, img_extension)
        img_path = f'{Config.BASE_IMAGE_DIR}/{Config.GALLERY_FOLDER}/{img_name}.{img_extension}'
        thumbnail_path = f'{Config.BASE_IMAGE_DIR}/{Config.GALLERY_FOLDER}/{thumb_name}.{img_extension}'
        # Save image
        with open(img_path, 'wb') as f:
            f.write(b64decode(img_data))
        # Save image thumbnail
        thumbnail.save(thumbnail_path)
        # Add image data to database
        img_row = ImageHandler.create(Config.GALLERY_FOLDER,
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


@app.route(f'{PREFIX}/fetch_contact_info', methods=["POST"])
@handle_exception
def fetch_contact_info():
    print('TODOOOO')
    return False


# First verifies that the user is an admin, then updates company contact info
@app.route(f'{PREFIX}/update_contact_info', methods=["POST"])
@handle_exception
def update_contact_info():
    json = request.form.to_dict(flat=False)
    id = json['id']
    contact = ContactInfoHandler.from_id(id)
    if contact is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    ContactInfoHandler.update(json)
    db.session.commit()
    return {"status": StatusCodes['SUCCESS']}


@app.route(f'{PREFIX}/fetch_profile_info', methods=["POST"])
@handle_exception
def fetch_profile_info():
    (email, token) = getJson('email', 'token')
    print(f'boopies {email} {token}')
    user_data = UserHandler.get_profile_data(email, token, app)
    if user_data is str:
        print('FAILEDDDD')
        print(user_data)
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    print('SUCESS BABYYYYY')
    print(user_data)
    user_data['status'] = StatusCodes['SUCCESS']
    return user_data


@app.route(f'{PREFIX}/fetch_customers', methods=["POST"])
@handle_exception
def fetch_customers():
    # Grab data
    (email, token) = getJson('email', 'token')
    # Verify authorization
    session_check = UserHandler.is_valid_session(email, token, app)
    if not session_check['valid'] or not UserHandler.is_admin(session_check['user']):
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    # Grab all users that have a customer role
    users = [UserHandler.to_dict(UserHandler.from_id(id)) for id in UserHandler.all_ids()]
    customers = [u for u in users if UserHandler.is_customer(u)]
    return {
        "customers": customers,
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/set_like_sku', methods=["POST"])
@handle_exception
def set_like_sku():
    '''Like or unlike an inventory item'''
    # Grab data
    (email, token, sku_str, liked) = getData('email', 'token', 'sku', 'liked')
    # Verify authorization
    session_check = UserHandler.is_valid_session(email, token, app)
    if not session_check['valid'] or not UserHandler.is_customer(session_check['user']):
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    user = session_check['user']
    sku = SkuHandler.from_sku(sku_str)
    # Like SKU
    if liked:
        if sku not in user.likes:
            user.likes.append(sku)
    # Unlike SKU
    else:
        if sku in user.likes:
            user.likes.remove(sku)
    db.session.commit()
    # Return updated user data
    user_data = UserHandler.to_dict(user)
    user_data['status'] = StatusCodes['SUCCESS']
    return user_data


@app.route(f'{PREFIX}/set_sku_in_cart', methods=["POST"])
@handle_exception
def set_sku_in_cart():
    '''Adds or removes an item from the user's cart
    Returns an updated json of the user'''
    # Grab data
    (email, token, sku_str, quantity, in_cart) = getData('email', 'token', 'sku', 'quantity', 'in_cart')
    # Verify authorization
    session_check = UserHandler.is_valid_session(email, token, app)
    if not session_check['valid'] or not UserHandler.is_customer(session_check['user']):
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    user = session_check['user']
    sku = SkuHandler.from_sku(sku_str)
    # Find or create cart
    cart = None
    if len(user.orders) == 0:
        cart = OrderHandler.create(user.id)
        db.session.add(cart)
    else:
        cart = user.orders[-1]
    print(f'CART HERE IS {cart.items}')
    # Add/Remove quantity from existing order item, if any have a matching SKU
    matching_order_item = None
    for item in cart.items:
        if item.sku == sku:
            if in_cart:
                item.quantity += quantity
            else:
                item.quantity = max(0, item.quantity - quantity)
            matching_order_item = item
            break
    # Remove order item, if quantity dropped to 0
    if matching_order_item and matching_order_item.quantity == 0:
        cart.items.remove(matching_order_item)
        matching_order_item.delete()
    # Create a new order item, if adding and no matching SKU found
    if not matching_order_item and in_cart:
        order_item = OrderItemHandler.create(quantity, sku)
        db.session.add(order_item)
        cart.items.append(order_item)
    db.session.commit()
    user_data = UserHandler.to_dict(user)
    user_data['status'] = StatusCodes['SUCCESS']
    return user_data


# Hide/Unhide or delete a SKU
@app.route(f'{PREFIX}/modify_sku', methods=["POST"])
@handle_exception
def modify_sku():
    '''Like or unlike an inventory item'''
    (email, token, sku, operation) = getData('sku', 'operation')
    # Verify authorization
    session_check = UserHandler.is_valid_session(email, token, app)
    if not session_check['valid'] or not UserHandler.is_admin(session_check['user']):
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    sku_obj = SkuHandler.from_sku(sku)
    if sku_obj is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    operation_to_status = {
        'HIDE': SkuStatus.INACTIVE.value,
        'UNHIDE': SkuStatus.ACTIVE.value,
        'DELETE': SkuStatus.DELETED.value
    }
    if operation in operation_to_status:
        sku_obj.status = operation_to_status[operation]
        db.session.commit()
        return {"status": StatusCodes['SUCCESS']}
    return {"status": StatusCodes['ERROR_UNKNOWN']}


# Change the account status of a user
@app.route(f'{PREFIX}/modify_user', methods=["POST"])
@handle_exception
def modify_user():
    '''Like or unlike an inventory item'''
    (email, token, id, operation) = getData('id', 'operation')
    # Verify authorization
    session_check = UserHandler.is_valid_session(email, token, app)
    if not session_check['valid'] or not UserHandler.is_admin(session_check['user']):
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    user = UserHandler.from_id(id)
    if user is None:
        print('USER NOT FOUND')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    operation_to_status = {
        'LOCK': AccountStatus.HARD_LOCK.value,
        'UNLOCK': AccountStatus.UNLOCKED.value,
        'APPROVE': AccountStatus.UNLOCKED.value,
        'DELETE': AccountStatus.DELETED.value
    }
    if operation in operation_to_status:
        user.account_status = operation_to_status[operation]
        db.session.commit()
        return {"status": StatusCodes['SUCCESS']}
    return {"status": StatusCodes['ERROR_UNKNOWN']}
