from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app, db
from src.models import AccountStatus, Sku, SkuStatus, ImageUses, PlantTraitOptions, OrderStatus
from src.handlers import BusinessHandler, UserHandler, SkuHandler, EmailHandler, OrderHandler, OrderItemHandler
from src.handlers import PhoneHandler, PlantHandler, PlantTraitHandler, ImageHandler, ContactInfoHandler, RoleHandler
from src.messenger import welcome, reset_password
from src.utils import salt
from src.auth import generate_token, verify_token
from src.config import Config
from sqlalchemy import exc
import traceback
from base64 import b64decode
import json
import os
import io
from functools import wraps
from src.uploadAvailability import upload_availability

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})
PREFIX = '/api'
with open(os.path.join(os.path.dirname(__file__), "consts/codes.json"), 'r') as f:
    print('READING CODES')
    StatusCodes = json.load(f)
    print(type(StatusCodes))

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


def handle_exception(func):
    '''Wraps routes in try/except'''
    @wraps(func)
    def decorated(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception:
            print(traceback.format_exc())
            return StatusCodes['ERROR_UNKNOWN']

    return decorated


def verify_session(session):
    '''Verifies that the user supplied a valid session token
    Returns User object if valid, otherwise None'''
    tag = session.get('tag', None)
    token = session.get('token', None)
    if tag and token:
        return UserHandler.is_valid_session(tag, token, app).get('user', None)
    return None


def verify_customer(session):
    '''Verifies that the user:
    1) Supplied a valid session token
    2) Is a customer
    Returns User object if both checks pass, otherwise None'''
    user = verify_session(session)
    if user and UserHandler.is_customer(user):
        return user
    return None


def verify_admin(session):
    '''Verifies that the user:
    1) Supplied a valid session token
    2) Is an admin
    Returns User object if both checks pass, otherwise None'''
    user = verify_session(session)
    if user and UserHandler.is_admin(user):
        return user
    return None

# =========== End Helper Methods ========================


@app.route(f'{PREFIX}/ping', methods=['POST'])
@handle_exception
def ping():
    '''Used for testing client/server connection'''
    return {
        **StatusCodes['SUCCESS'],
        "result": 'pong'
    }


@app.route(f'{PREFIX}/consts', methods=['GET'])
@handle_exception
def consts():
    '''Returns codes shared between frontend and backend'''
    return {
        **StatusCodes['SUCCESS'],
        "status_codes": StatusCodes,
        "order_status": OrderStatus,
    }


@app.route(f'{PREFIX}/register', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def register():
    (data) = getData('data')
    # If email is already registered
    if any(UserHandler.email_in_use(e['email_address']) for e in data['emails']):
        print('ERROR: Email exists')
        return StatusCodes['FAILURE_EMAIL_EXISTS']
    # Create user
    user = UserHandler.create(data)
    # Create a session token
    token = generate_token(app, user)
    UserHandler.set_token(user, token)
    db.session.commit()
    return {
        **StatusCodes['SUCCESS'],
        "session": {"tag": user.tag, "token": token},
        "user": UserHandler.to_dict(user)
    }


@app.route(f'{PREFIX}/login', methods=['POST'])
@cross_origin(supports_credentials=True)
@handle_exception
def login():
    '''Generate a session token from a user's credentials'''
    (email, password) = getData('email', 'password')
    user = UserHandler.get_user_from_credentials(email, password)
    if user:
        if user.tag == "nenew":
            user.tag = salt(32)
        token = generate_token(app, user)
        print('RECEIVED TOKEN!!!!!!')
        UserHandler.set_token(user, token)
        db.session.commit()
        return {
            **StatusCodes['SUCCESS'],
            "user": UserHandler.to_dict(user),
            "session": {"tag": user.tag, "token": token}
        }
    else:
        account_status = UserHandler.get_user_lock_status(email)
        print(f'User account status is {account_status}')
        status = StatusCodes['FAILURE_INCORRECT_CREDENTIALS']
        if account_status == -1:
            status = StatusCodes['FAILURE_NO_USER']
        elif account_status == AccountStatus.SOFT_LOCK.value:
            status = StatusCodes['FAILURE_SOFT_LOCKOUT']
        elif account_status == AccountStatus.HARD_LOCK.value:
            status = StatusCodes['FAILURE_HARD_LOCKOUT']
        return status


@app.route(f'{PREFIX}/reset_password_request', methods=['POST'])
@handle_exception
def send_password_reset_request():
    email = getData('email')
    reset_password(email)
    return StatusCodes['SUCCESS']


@app.route(f'{PREFIX}/validate_token', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def validate_token():
    session = getJson('session')
    tag = session.get('tag', None)
    token = session.get('token', None)
    if not tag or not token:
        return StatusCodes['ERROR_INVALID_ARGS']
    if verify_token(app, token):
        return StatusCodes['SUCCESS']
    return StatusCodes['FAILURE_NOT_VERIFIED']


if __name__ == '__main__':
    app.run()


# Returns list of filters to sort the inventory by
@app.route(f'{PREFIX}/fetch_inventory_filters', methods=["POST"])
@handle_exception
def fetch_inventory_filters():
    # NOTE: keys must match the field names in plant or sku (besides status)
    return {
        **StatusCodes['SUCCESS'],
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
        "zones": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.ZONE)
    }


# Returns IDs of all inventory items available to the customer.
# Also returns required info to display the first page of results
# If page_size is 0, returns all
@app.route(f'{PREFIX}/fetch_inventory', methods=["POST"])
@handle_exception
def fetch_inventory():
    (sorter, page_size, admin) = getData('sorter', 'page_size', 'admin')
    # Grab plant ids
    all_plant_ids = PlantHandler.all_ids()
    # Find all plants that have available SKUs associated with them
    plants_with_skus = []
    for id in all_plant_ids:
        if PlantHandler.has_available_sku(id):
            plants_with_skus.append(PlantHandler.from_id(id))
    if len(plants_with_skus) == 0:
        return StatusCodes['WARNING_NO_RESULTS']
    # Define map for handling sort options
    sort_map = {
        'az': (lambda p: p.latin_name, False),
        'za': (lambda p: p.latin_name, True),
        'lth': (lambda p: (PlantHandler.cheapest(p), p.latin_name), False),
        'htl': (lambda p: (PlantHandler.priciest(p), p.latin_name), True),
        'new': (lambda p: (PlantHandler.newest(p), p.latin_name), True),
        'old': (lambda p: (PlantHandler.oldest(p), p.latin_name), True),
    }
    # Sort the plants
    sort_data = sort_map.get(sorter, None)
    if sort_data is None:
        print('Could not find the correct sorter')
        return StatusCodes['ERROR_INVALID_ARGS']
    plants_with_skus.sort(key=sort_data[0], reverse=sort_data[1])
    if page_size > 0:
        page = plants_with_skus[0: min(len(plants_with_skus), page_size)]
    else:
        page = plants_with_skus
    page_results = PlantHandler.all_dicts(page)
    return {
        **StatusCodes['SUCCESS'],
        "plant_ids": PlantHandler.all_ids(),
        "page_results": page_results
    }


# Returns plants that do not have any assigned SKUs
@app.route(f'{PREFIX}/fetch_unused_plants', methods=["POST"])
@handle_exception
def fetch_unused_plants():
    (sorter) = getData('sorter')
    # Grab plant ids
    all_plant_ids = PlantHandler.all_ids()
    # Find all plants that do not have associated SKUs
    lone_plants = []
    for id in all_plant_ids:
        # Admins can view plants that are hidden to customers
        if not PlantHandler.has_available_sku(id):
            lone_plants.append(PlantHandler.from_id(id))
    if len(lone_plants) == 0:
        return StatusCodes['WARNING_NO_RESULTS']
    sort_map = {
        'az': (lambda p: p.latin_name, False),
        'za': (lambda p: p.latin_name, True)
    }
    # Sort the plants
    sort_data = sort_map.get(sorter, None)
    if sort_data is None:
        print('Could not find the correct sorter')
        return StatusCodes['ERROR_INVALID_ARGS']
    lone_plants.sort(key=sort_data[0], reverse=sort_data[1])
    return {
        **StatusCodes['SUCCESS'],
        "plants": PlantHandler.all_dicts(lone_plants)
    }


@app.route(f'{PREFIX}/fetch_image', methods=["POST"])
@handle_exception
def fetch_image():
    '''Fetches info for an image'''
    (id, size) = getData('id', 'size')
    return {
        **StatusCodes['SUCCESS'],
        "image": ImageHandler.get_b64(int(id), size)
    }


@app.route(f'{PREFIX}/fetch_images', methods=["POST"])
@handle_exception
def fetch_images():
    '''Fetches info for a list of images'''
    (ids, size) = getData('ids', 'size')
    return {
        **StatusCodes['SUCCESS'],
        "images": [ImageHandler.get_b64(int(id), size) if id is not None else None for id in ids]
    }


# Returns inventory data for the given inventory SKUs
@app.route(f'{PREFIX}/fetch_inventory_page', methods=["POST"])
@handle_exception
def fetch_inventory_page():
    plant_ids = getData('ids')
    return {
        **StatusCodes['SUCCESS'],
        "data": PlantHandler.all_dicts(plant_ids)
    }


# Returns display information of all gallery photos.
@app.route(f'{PREFIX}/fetch_gallery', methods=["POST"])
@handle_exception
def fetch_gallery():
    images_data = [ImageHandler.to_dict(img) for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
    return {
        **StatusCodes['SUCCESS'],
        "images_meta": images_data
    }


# Updates gallery order, alts, and descriptions.
# This cannot be used to update images
# TODO reorder
@app.route(f'{PREFIX}/update_gallery', methods=["POST"])
@handle_exception
def update_gallery():
    (session, data) = getData('session', 'data')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    success = True
    curr_images = [img.id for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
    for img in data:
        curr_images.remove(img['id'])
    # Images not included in the post data are removed
    for id in curr_images:
        image_model = ImageHandler.from_id(id)
        if image_model:
            db.session.delete(image_model)
    db.session.commit()
    return StatusCodes['SUCCESS'] if success else StatusCodes['ERROR_UNKNOWN']


@app.route(f'{PREFIX}/upload_availability', methods=["POST"])
@handle_exception
def upload_availability_file():
    # Check to make sure requestor is an admin TODO
    (data) = getForm('data')
    b64 = data[0].split('base64,')[1]
    decoded = b64decode(b64)
    toread = io.BytesIO()
    toread.write(decoded)
    toread.seek(0)  # resets pointer
    success = upload_availability(app, toread)
    if success:
        return StatusCodes['SUCCESS']
    return StatusCodes['ERROR_UNKNOWN']


# TODO - check image size and extension to make sure it is valid
@app.route(f'{PREFIX}/upload_gallery_image', methods=["POST"])
@handle_exception
def upload_gallery_image():
    (names, extensions, images) = getForm('name', 'extension', 'image')
    status = StatusCodes['SUCCESS']
    passed_indexes = []
    failed_indexes = []
    # Iterate through images
    for i in range(len(images)):
        img_data = images[i]
        image = ImageHandler.create_from_scratch(img_data, 'TODO', Config.GALLERY_FOLDER, ImageUses.GALLERY)
        if image is None:
            status = StatusCodes['ERROR_UNKNOWN']
            failed_indexes.append(i)
        else:
            passed_indexes.append(i)
    return {
        **status,
        "passed_indexes": passed_indexes,
        "failed_indexes": failed_indexes,
    }


@app.route(f'{PREFIX}/fetch_all_contact_infos', methods=["POST"])
@handle_exception
def fetch_all_contact_infos():
    return {
        **StatusCodes['SUCCESS'],
        "contact_infos": ContactInfoHandler.all_dicts()
    }


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
        return StatusCodes['ERROR_UNKNOWN']
    ContactInfoHandler.update(json)
    db.session.commit()
    return StatusCodes['SUCCESS']


@app.route(f'{PREFIX}/fetch_profile_info', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def fetch_profile_info():
    '''Fetches profile info for a customer'''
    (session, tag) = getJson('session', 'tag')
    # Only admins can view information for other profiles
    if tag != session['tag'] and not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    if not verify_customer(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    user_data = UserHandler.get_profile_data(tag)
    if user_data is None:
        print('FAILEDDDD')
        return StatusCodes['ERROR_UNKNOWN']
    print('SUCESS BABYYYYY')
    return {
        **StatusCodes['SUCCESS'],
        "user": user_data
    }


@app.route(f'{PREFIX}/update_profile', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def update_profile():
    (session, data) = getData('session', 'data')
    user = verify_session(session)
    if not user:
        return StatusCodes["FAILURE_NOT_VERIFIED"]
    if not UserHandler.is_password_valid(user, data['currentPassword']):
        return StatusCodes["FAILURE_INCORRECT_CREDENTIALS"]
    if UserHandler.update(user, data):
        return {
            **StatusCodes['SUCCESS'],
            "profile": UserHandler.get_profile_data(session['tag'])
        }
    return StatusCodes['ERROR_UNKNOWN']


@app.route(f'{PREFIX}/fetch_likes', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def fetch_likes():
    (session) = getJson('session')
    user = verify_customer(session)
    if not user:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    return {
        **StatusCodes['SUCCESS'],
        "likes": SkuHandler.all_dicts(user.likes)
    }


@app.route(f'{PREFIX}/fetch_cart', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def fetch_cart():
    (session) = getJson('session')
    user = verify_customer(session)
    if not user:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    return {
        **StatusCodes['SUCCESS'],
        "cart": OrderHandler.to_dict(UserHandler.get_cart(user))
    }


@app.route(f'{PREFIX}/fetch_customers', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def fetch_customers():
    # Grab data
    (session) = getJson('session')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    return {
        **StatusCodes['SUCCESS'],
        "customers": UserHandler.all_customers()
    }


@app.route(f'{PREFIX}/set_like_sku', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def set_like_sku():
    '''Like or unlike an inventory item'''
    # Grab data
    (session, sku_str, liked) = getData('session', 'sku', 'liked')
    user = verify_customer(session)
    if not user:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
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
    return {
        **StatusCodes['SUCCESS'],
        "user": UserHandler.to_dict(user)
    }


@app.route(f'{PREFIX}/set_order_status', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def set_order_status():
    '''Sets the order status for an order'''
    (session, id, status) = getData('session', 'id', 'status')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    order_obj = OrderHandler.from_id(id)
    if order_obj is None:
        return StatusCodes['ERROR_UNKNOWN']
    order_obj.status = status
    db.session.commit()
    return {
        **StatusCodes['SUCCESS'],
        'order': OrderHandler.to_dict(order_obj)
    }


@app.route(f'{PREFIX}/update_cart', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def update_cart():
    '''Updates the cart for the specified user.
    Only admins can update other carts.
    Returns the updated cart data, so the frontend can verify update'''
    (session, who, cart) = getData('session', 'who', 'cart')
    # If changing a cart that doesn't belong to them, verify admin
    if session['tag'] != who:
        user = verify_admin(session)
    else:
        user = verify_customer(session)
    if not user:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    cart_obj = OrderHandler.from_id(cart['id'])
    if cart_obj is None:
        print('Error: Could not find cart')
        return StatusCodes['ERROR_UNKNOWN']
    OrderHandler.update_from_dict(cart_obj, cart)
    db.session.commit()
    return {
        **StatusCodes['SUCCESS'],
        "cart": OrderHandler.to_dict(cart_obj)
    }


# Hide, unhide, add, delete, or update SKU
@app.route(f'{PREFIX}/modify_sku', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def modify_sku():
    '''Like or unlike an inventory item'''
    (session, sku, operation, sku_data) = getData('session', 'sku', 'operation', 'data')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    sku_obj = SkuHandler.from_sku(sku)
    if sku_obj is None:
        return StatusCodes['ERROR_UNKNOWN']
    operation_to_status = {
        'HIDE': SkuStatus.INACTIVE.value,
        'UNHIDE': SkuStatus.ACTIVE.value,
        'DELETE': SkuStatus.DELETED.value
    }
    if operation in operation_to_status:
        sku_obj.status = operation_to_status[operation]
        db.session.commit()
        return StatusCodes['SUCCESS']
    if operation == 'ADD':
        plant = PlantHandler.create(sku_data['plant'])
        db.session.add(plant)
        sku = SkuHandler.create(sku_obj)
        db.session.add(sku)
        db.session.commit()
    if operation == 'UPDATE':
        SkuHandler.update(sku_obj, sku_data)
        PlantHandler.update(sku_obj.plant, sku_data['plant'])
        db.session.commit()
        return StatusCodes['SUCCESS']
    return StatusCodes['ERROR_UNKNOWN']


# Hide, unhide, add, delete, or update SKU
@app.route(f'{PREFIX}/modify_plant', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def modify_plant():
    '''Like or unlike an inventory item'''
    (session, operation, plant_data) = getData('session', 'operation', 'data')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    plant_obj = PlantHandler.from_id(plant_data['id'])
    if plant_obj is None and operation != 'ADD':
        return StatusCodes['ERROR_UNKNOWN']
    operation_to_status = {
        'HIDE': SkuStatus.INACTIVE.value,
        'UNHIDE': SkuStatus.ACTIVE.value,
        'DELETE': SkuStatus.DELETED.value
    }
    if operation in operation_to_status:
        plant_obj.status = operation_to_status[operation]
        db.session.commit()
        return StatusCodes['SUCCESS']
    if operation == 'ADD' or operation == 'UPDATE':
        # Create plant if doesn't exist
        if plant_obj is None:
            plant_obj = PlantHandler.create(plant_data)
            db.session.add(plant_obj)
        # Set display image
        if plant_data['display_image'] is not None:
            image = ImageHandler.create_from_scratch(plant_data['display_image']['data'], 'TODO', Config.PLANT_FOLDER, ImageUses.DISPLAY)
            if image is not None:
                PlantHandler.set_display_image(plant_obj, image)
                db.session.commit()

        # Update plant fields
        def update_trait(option: PlantTraitOptions, value: str):
            if isinstance(value, list):
                return [update_trait(option, v) for v in value]
            if value is None:
                return None
            if (trait := PlantTraitHandler.from_values(option, value)):
                return trait
            new_trait = PlantTraitHandler.create(option, value)
            db.session.add(new_trait)
            return new_trait
        print(f"TODOOOOOOOO {plant_data}")
        if (latin := plant_data.get('latin_name', None)):
            plant_obj.latin_name = latin
        if (common := plant_data.get('common_name', None)):
            plant_obj.common_name = common
        plant_obj.drought_tolerance = update_trait(PlantTraitOptions.DROUGHT_TOLERANCE, plant_data['drought_tolerance'])
        plant_obj.grown_height = update_trait(PlantTraitOptions.GROWN_HEIGHT, plant_data['grown_height'])
        plant_obj.grown_spread = update_trait(PlantTraitOptions.GROWN_SPREAD, plant_data['grown_spread'])
        plant_obj.growth_rate = update_trait(PlantTraitOptions.GROWTH_RATE, plant_data['growth_rate'])
        plant_obj.optimal_light = update_trait(PlantTraitOptions.OPTIMAL_LIGHT, plant_data['optimal_light'])
        plant_obj.salt_tolerance = update_trait(PlantTraitOptions.SALT_TOLERANCE, plant_data['salt_tolerance'])
        # Hide existing SKUs (if they are still active, this will be updated later)
        for sku in plant_obj.skus:
            sku.status = SkuStatus.INACTIVE.value
        sku_data = plant_data.get('skus', None)
        if sku_data:
            for data in sku_data:
                id = data.get('id', None)
                # If id was in data, then this is not a new SKU
                if id:
                    sku = SkuHandler.from_id(id)
                    sku.status = SkuStatus.ACTIVE.value
                else:
                    sku = SkuHandler.create()
                SkuHandler.update(sku, data)
                db.session.add(sku)
                plant_obj.skus.append(sku)
        db.session.commit()
        return StatusCodes['SUCCESS']
    return StatusCodes['ERROR_UNKNOWN']


# Change the account status of a user
@app.route(f'{PREFIX}/modify_user', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def modify_user():
    '''Like or unlike an inventory item'''
    (session, id, operation) = getData('session', 'id', 'operation')
    admin = verify_admin(session)
    if not admin:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    user = UserHandler.from_id(id)
    if user is None:
        print('USER NOT FOUND')
        return StatusCodes['ERROR_UNKNOWN']
    # Cannot delete yourself
    if user.id == admin.id:
        return StatusCodes['ERROR_CANNOT_DELETE_YOURSELF']
    operation_to_status = {
        'LOCK': AccountStatus.HARD_LOCK.value,
        'UNLOCK': AccountStatus.UNLOCKED.value,
        'APPROVE': AccountStatus.UNLOCKED.value,
        'DELETE': AccountStatus.DELETED.value
    }
    if operation in operation_to_status:
        user.account_status = operation_to_status[operation]
        if operation == 'DELETE':
            for email in user.personal_email:
                user.personal_email.remove(email)
                db.session.delete(email)
            for phone in user.personal_phone:
                user.personal_phone.remove(phone)
                db.session.delete(phone)
        db.session.commit()
        return {
            **StatusCodes['SUCCESS'],
            "customers": UserHandler.all_customers()
        }
    print(f'OPERATION NOT IN OPERATIONS: {operation}')
    return StatusCodes['ERROR_UNKNOWN']


@app.route(f'{PREFIX}/submit_order', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def submit_order():
    (session, cart) = getData('session', 'cart')
    # If changing a cart that doesn't belong to them, verify admin
    user = verify_customer(session)
    if not user:
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    cart_obj = OrderHandler.from_id(cart['id'])
    if cart_obj is None:
        return StatusCodes['ERROR_UNKNOWN']
    OrderHandler.update_from_dict(cart_obj, cart)
    OrderHandler.set_status(cart_obj, OrderStatus['PENDING'])
    new_cart = OrderHandler.create(user.id)
    db.session.add(new_cart)
    user.orders.append(new_cart)
    db.session.commit()
    return {
        **StatusCodes['SUCCESS'],
        "cart": OrderHandler.to_dict(cart_obj)
    }


@app.route(f'{PREFIX}/fetch_orders', methods=["POST"])
@cross_origin(supports_credentials=True)
@handle_exception
def fetch_orders():
    '''Fetch orders that match the provided state'''
    (session, status) = getData('session', 'status')
    if not verify_admin(session):
        return StatusCodes['ERROR_NOT_AUTHORIZED']
    return {
        **StatusCodes['SUCCESS'],
        "orders": [OrderHandler.to_dict(order) for order in OrderHandler.from_status(status)]
    }
