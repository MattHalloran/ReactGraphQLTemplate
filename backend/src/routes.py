from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app, db
from src.models import AccountStatus, Plant, Sku, SkuStatus, Image, ImageUses, ContactInfo
from src.handlers import BusinessHandler, UserHandler, SkuHandler, EmailHandler, OrderHandler
from src.handlers import PhoneHandler, PlantHandler, ImageHandler, ContactInfoHandler, OrderItemHandler
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from src.config import Config
from src.utils import get_image_meta, find_available_file_names
from sqlalchemy import exc
import ast
import traceback
from base64 import b64encode, b64decode
import json
import os
from os import path
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
    print(f'AAAAAAAA {byte_data}')
    dict_str = byte_data.decode('UTF-8')
    # if isinstance(dict_str, str)
    print(f'BBBBBBBBBB {dict_str}')
    print(f'CCCCCCCCCCC {type(dict_str)}')
    data = json.loads(dict_str)
    print(f'DDDDDDDDD {type(data)}')
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
    app.run(debug=True)


# Returns list of filters to sort the inventory by
@app.route(f'{PREFIX}/fetch_inventory_filters', methods=["POST"])
@handle_exception
def fetch_inventory_filters():
    skus = Sku.query.with_entities(Sku).all()
    plants = []
    all_sizes = []
    pollinators = []
    lights = []
    moistures = []
    phs = []
    soil_types = []
    zones = []
    optimal_lights = []
    drought_tolerances = []
    grown_heights = []
    grown_spreads = []
    growth_rates = []
    salt_tolerances = []
    # Grab SKU-related filters
    for sku in skus:
        sku_sizes = [size.size for size in sku.sizes]
        new_skus = set(sku_sizes) - set(all_sizes)
        all_sizes = all_sizes + list(new_skus)
        plants.append(PlantHandler.from_id(sku.plant_id))
    # Grab plant-related filters
    for plant in plants:
        # Single value fields
        if (light := plant.optimal_light) and light.value not in optimal_lights:
            optimal_lights.append(light.value)
        if (drought := plant.drought_tolerance) and drought.value not in drought_tolerances:
            drought_tolerances.append(drought.value)
        if (height := plant.grown_height) and height.value not in grown_heights:
            grown_heights.append(height.value)
        if (spread := plant.grown_spread) and spread.value not in grown_spreads:
            grown_spreads.append(spread.value)
        if (rate := plant.growth_rate) and rate.value not in growth_rates:
            growth_rates.append(rate.value)
        if (salt := plant.salt_tolerance) and salt.value not in salt_tolerances:
            salt_tolerances.append(salt.value)

        # Multi value fields
        if plant.attracts_pollinators_and_wildlifes:
            for pollinator in plant.attracts_pollinators_and_wildlifes:
                if pollinator.value not in pollinators:
                    pollinators.append(pollinator.value)
        if plant.light_ranges:
            for light in plant.light_ranges:
                if light.value not in lights:
                    lights.append(light.value)
        if plant.soil_moistures:
            for moisture in plant.soil_moistures:
                if moisture.value not in moistures:
                    moistures.append(moisture.value)
        if plant.soil_phs:
            for ph in plant.soil_phs:
                if ph.value not in phs:
                    phs.append(ph.value)
        if plant.soil_types:
            for soil_type in plant.soil_types:
                if soil_type.value not in soil_types:
                    soil_types.append(soil_type.value)
        if plant.zones:
            for zone in plant.zones:
                if zone.value not in zones:
                    zones.append(zone.value)

    return {
        "sizes": all_sizes,
        "optimal_lights": optimal_lights,
        "drought_tolerances": drought_tolerances,
        "grown_heights": grown_heights,
        "grown_spreads": grown_spreads,
        "growth_rates": growth_rates,
        "salt_tolerances": salt_tolerances,
        "attracts_polinators_and_wildlife": pollinators,
        "soil_moistures": moistures,
        "soil_phs": phs,
        "soil_types": soil_types,
        "zones": zones,
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
        'az': (lambda s: s.plant.latin_name, False),
        'za': (lambda s: s.plant.latin_name, True),
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
        with open(f'{img.directory}/{img.thumbnail_file_name}.{img.extension}', 'rb') as open_file:
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


# TODO - check image size and extension to make sure it is valid
@app.route(f'{PREFIX}/upload_gallery_image/', methods=["POST"])
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
        (img_name, thumb_name) = find_available_file_names(Config.GALLERY_DIR, img_name, img_extension)
        img_path = f'{Config.GALLERY_DIR}/{img_name}.{img_extension}'
        thumbnail_path = f'{Config.GALLERY_DIR}/{thumb_name}.{img_extension}'
        # Save image
        with open(img_path, 'wb') as f:
            f.write(b64decode(img_data))
        # Save image thumbnail
        thumbnail.save(thumbnail_path)
        # Add image data to database
        img_row = ImageHandler.create(Config.GALLERY_DIR,
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
    # Check to make sure requestor is an admin TODO
    (email, token) = getJson('email', 'token')
    user = UserHandler.from_email(email)
    customers = [UserHandler.to_dict(UserHandler.from_id(id)) for id in UserHandler.all_ids()]
    return {
        "customers": customers,
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/set_like_sku', methods=["POST"])
@handle_exception
def set_like_sku():
    '''Like or unlike an inventory item'''
    (email, token, sku_str, liked) = getData('email', 'token', 'sku', 'liked')
    user = UserHandler.from_email(email)
    sku = SkuHandler.from_sku(sku_str)
    if liked:
        if sku not in user.likes:
            user.likes.append(sku)
    else:
        if sku in user.likes:
            user.likes.remove(sku)
    db.session.commit()
    user_data = UserHandler.to_dict(user)
    user_data['status'] = StatusCodes['SUCCESS']
    return user_data


@app.route(f'{PREFIX}/set_sku_in_cart', methods=["POST"])
@handle_exception
def set_sku_in_cart():
    '''Adds or removes an item from the user's cart
    Returns an updated json of the user'''
    (email, token, sku_str, quantity, in_cart) = getData('email', 'token', 'sku', 'quantity', 'in_cart')
    print('TODOOOOO')
    user = UserHandler.from_email(email)
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
    if matching_order_item.quantity == 0:
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
    (sku, operation) = getData('sku', 'operation')
    sku_obj = SkuHandler.from_sku(sku)
    if sku_obj is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    if operation == 'HIDE':
        sku_obj.status = SkuStatus.INACTIVE.value
        db.session.commit()
    if operation == 'UNHIDE':
        sku_obj.status = SkuStatus.ACTIVE.value
        db.session.commit()
    if operation == 'DELTE':
        sku_obj.status = SkuStatus.DELETED.value
        db.session.commit()
    return {"status": StatusCodes['SUCCESS']}