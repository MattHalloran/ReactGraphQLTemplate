from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app, db
from src.models import AccountStatus, Sku, SkuStatus, ImageUses, PlantTraitOptions, OrderStatus
from src.handlers import BusinessHandler, UserHandler, SkuHandler, EmailHandler, OrderHandler, OrderItemHandler
from src.handlers import PhoneHandler, PlantHandler, PlantTraitHandler, ImageHandler, ContactInfoHandler
from src.messenger import welcome, reset_password
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
            return {"status": StatusCodes['ERROR_UNKNOWN']}

    return decorated


def verify_session(session):
    '''Verifies that the user supplied a valid session token
    Returns User object if valid, otherwise None'''
    print('in veify session')
    print(session)
    temp = UserHandler.is_valid_session(session['email'], session['token'], app)
    print(temp)
    return UserHandler.is_valid_session(session['email'], session['token'], app).get('user', None)


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
        "result": 'pong',
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/consts', methods=['GET'])
@handle_exception
def consts():
    '''Returns codes shared between frontend and backend'''
    return {
        "status_codes": StatusCodes,
        "order_status": OrderStatus,
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
    '''Generate a session token from a user's credentials'''
    (email, password) = getData('email', 'password')
    user = UserHandler.get_user_from_credentials(email, password)
    if user:
        token = generate_token(app, user)
        print('RECEIVED TOKEN!!!!!!')
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


@app.route(f'{PREFIX}/validate_token', methods=["POST"])
@handle_exception
def validate_token():
    token = getJson('token')
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
        return {"status": StatusCodes['WARNING_NO_RESULTS']}
    # Define map for handling sort options
    sort_map = {
        'az': (lambda p: p.latin_name, False),
        'za': (lambda p: p.latin_name, True),
        'lth': (lambda p: PlantHandler.cheapest(p), False),
        'htl': (lambda p: PlantHandler.priciest(p), True),
        'new': (lambda p: PlantHandler.newest(p), True),
        'old': (lambda p: PlantHandler.oldest(p), True),
    }
    # Sort the plants
    sort_data = sort_map.get(sorter, None)
    if sort_data is None:
        print('Could not find the correct sorter')
        return {"status": StatusCodes['ERROR_INVALID_ARGS']}
    plants_with_skus.sort(key=sort_data[0], reverse=sort_data[1])
    if page_size > 0:
        page = plants_with_skus[0: min(len(plants_with_skus), page_size)]
    else:
        page = plants_with_skus
    page_results = PlantHandler.all_dicts(page)
    return {
        "plant_ids": PlantHandler.all_ids(),
        "page_results": page_results,
        "status": StatusCodes['SUCCESS']
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
        return {"status": StatusCodes['WARNING_NO_RESULTS']}
    sort_map = {
        'az': (lambda p: p.latin_name, False),
        'za': (lambda p: p.latin_name, True)
    }
    # Sort the plants
    sort_data = sort_map.get(sorter, None)
    if sort_data is None:
        print('Could not find the correct sorter')
        return {"status": StatusCodes['ERROR_INVALID_ARGS']}
    lone_plants.sort(key=sort_data[0], reverse=sort_data[1])
    return {
        "plants": PlantHandler.all_dicts(lone_plants),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/fetch_image', methods=["POST"])
@handle_exception
def fetch_image():
    '''Fetches info for an image'''
    (id, size) = getData('id', 'size')
    return {
        "images": ImageHandler.get_b64(int(id), size),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/fetch_images', methods=["POST"])
@handle_exception
def fetch_images():
    '''Fetches info for a list of images'''
    (ids, size) = getData('ids', 'size')
    return {
        "images": [ImageHandler.get_b64(int(id), size) if id is not None else None for id in ids],
        "status": StatusCodes['SUCCESS']
    }


# Returns inventory data for the given inventory SKUs
@app.route(f'{PREFIX}/fetch_inventory_page', methods=["POST"])
@handle_exception
def fetch_inventory_page():
    plant_ids = getData('ids')
    return {
        "data": PlantHandler.all_dicts(plant_ids),
        "status": StatusCodes['SUCCESS']
    }


# Returns display information of all gallery photos.
@app.route(f'{PREFIX}/fetch_gallery', methods=["POST"])
@handle_exception
def fetch_gallery():
    images_data = [ImageHandler.to_dict(img) for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
    print('boop le snoot')
    return {
        "images_meta": images_data,
        "status": StatusCodes['SUCCESS']
    }


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
        return {"status": StatusCodes['SUCCESS']}
    return {"status": StatusCodes['ERROR_UNKNOWN']}


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
        img_data = images[i]
        image = ImageHandler.create_from_scratch(img_data, 'TODO', Config.GALLERY_FOLDER, ImageUses.GALLERY)
        if image is None:
            status = StatusCodes['ERROR_UNKNOWN']
            failed_indexes.append(i)
        else:
            passed_indexes.append(i)
    return {"passed_indexes": passed_indexes,
            "failed_indexes": failed_indexes,
            "status": status}


@app.route(f'{PREFIX}/fetch_all_contact_infos', methods=["POST"])
@handle_exception
def fetch_all_contact_infos():
    return {
        "contact_infos": ContactInfoHandler.all_dicts(),
        "status": StatusCodes['SUCCESS']
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
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    ContactInfoHandler.update(json)
    db.session.commit()
    return {"status": StatusCodes['SUCCESS']}


@app.route(f'{PREFIX}/fetch_profile_info', methods=["POST"])
@handle_exception
def fetch_profile_info():
    (session) = getJson('session')
    if not verify_customer(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    user_data = UserHandler.get_profile_data(session['email'])
    if user_data is None:
        print('FAILEDDDD')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    print('SUCESS BABYYYYY')
    user_data['status'] = StatusCodes['SUCCESS']
    return user_data


@app.route(f'{PREFIX}/fetch_likes', methods=["POST"])
@handle_exception
def fetch_likes():
    (session) = getJson('session')
    user = verify_customer(session)
    if not user:
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    return {
        "likes": SkuHandler.all_dicts(user.likes),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/fetch_cart', methods=["POST"])
@handle_exception
def fetch_cart():
    (session) = getJson('session')
    user = verify_customer(session)
    if not user:
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    return {
        "cart": OrderHandler.to_dict(UserHandler.get_cart(user)),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/fetch_customers', methods=["POST"])
@handle_exception
def fetch_customers():
    # Grab data
    (session) = getJson('session')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    return {
        "customers": UserHandler.all_customers(),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/set_like_sku', methods=["POST"])
@handle_exception
def set_like_sku():
    '''Like or unlike an inventory item'''
    # Grab data
    (session, sku_str, liked) = getData('session', 'sku', 'liked')
    user = verify_customer(session)
    if not user:
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
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


@app.route(f'{PREFIX}/set_order_status', methods=["POST"])
@handle_exception
def set_order_status():
    '''Sets the order status for an order'''
    (session, id, status) = getData('session', 'id', 'status')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    order_obj = OrderHandler.from_id(id)
    if order_obj is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    order_obj.status = status
    db.session.commit()
    return {
        'order': OrderHandler.to_dict(order_obj),
        'status': StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/update_cart', methods=["POST"])
@handle_exception
def update_cart():
    '''Updates the cart for the specified user.
    Only admins can update other carts.
    Returns the updated cart data, so the frontend can verify update'''
    (session, who, cart) = getData('session', 'who', 'cart')
    # If changing a cart that doesn't belong to them, verify admin
    if session['email'] is not who:
        user = verify_admin(session)
    else:
        user = verify_customer(session)
    if not user:
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    cart_obj = OrderHandler.from_id(cart['id'])
    if cart_obj is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    OrderHandler.update_from_dict(cart_obj, cart)
    db.session.commit()
    print('yeet')
    print(cart_obj.items)
    return {
        "cart": OrderHandler.to_dict(cart_obj),
        "status": StatusCodes['SUCCESS']
    }


# Hide, unhide, add, delete, or update SKU
@app.route(f'{PREFIX}/modify_sku', methods=["POST"])
@handle_exception
def modify_sku():
    '''Like or unlike an inventory item'''
    (session, sku, operation, sku_data) = getData('session', 'sku', 'operation', 'data')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
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
        return {"status": StatusCodes['SUCCESS']}
    return {"status": StatusCodes['ERROR_UNKNOWN']}


# Hide, unhide, add, delete, or update SKU
@app.route(f'{PREFIX}/modify_plant', methods=["POST"])
@handle_exception
def modify_plant():
    '''Like or unlike an inventory item'''
    (session, operation, plant_data) = getData('session', 'operation', 'data')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    plant_obj = PlantHandler.from_id(plant_data['id'])
    if plant_obj is None and operation != 'ADD':
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    print(f'PLANT IS {plant_obj.latin_name}')
    operation_to_status = {
        'HIDE': SkuStatus.INACTIVE.value,
        'UNHIDE': SkuStatus.ACTIVE.value,
        'DELETE': SkuStatus.DELETED.value
    }
    if operation in operation_to_status:
        plant_obj.status = operation_to_status[operation]
        db.session.commit()
        return {"status": StatusCodes['SUCCESS']}
    if operation == 'ADD' or operation == 'UPDATE':
        # Create plant if doesn't exist
        if plant_obj is None:
            plant_obj = PlantHandler.create(plant_data)
            db.session.add(plant_obj)
        # Set display image
        if plant_data['display_image'] is not None:
            image = ImageHandler.create_from_scratch(plant_data['display_image']['data'], 'TODO', Config.PLANT_FOLDER, ImageUses.DISPLAY)
            if image is not None:
                print('SETTING PLANTS DISPLAY IMAGE')
                PlantHandler.set_display_image(plant_obj, image)
                db.session.commit()
        # Hide existing SKUs (if they are still active, this will be updated later)
        else:
            for sku in plant_obj.skus:
                sku.status = SkuStatus.INACTIVE.value
        sku_data = plant_data.get('skus', None)
        if sku_data:
            for data in sku_data:
                id = data.get('id', None)
                # If id was in data, then this is not a new SKU
                if id:
                    sku = SkuHandler.from_id(id)
                else:
                    sku = SkuHandler.create()
                SkuHandler.update(sku, data)
                db.session.add(sku)
                plant_obj.skus.append(sku)
        db.session.commit()
        return {"status": StatusCodes['SUCCESS']}
    return {"status": StatusCodes['ERROR_UNKNOWN']}


# Change the account status of a user
@app.route(f'{PREFIX}/modify_user', methods=["POST"])
@handle_exception
def modify_user():
    '''Like or unlike an inventory item'''
    (session, id, operation) = getData('session', 'id', 'operation')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    user = UserHandler.from_id(id)
    if user is None:
        print('USER NOT FOUND')
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    # Don't allow modification of admins
    if UserHandler.is_admin(user):
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
        return {
            "customers": UserHandler.all_customers(),
            "status": StatusCodes['SUCCESS']
        }
    return {"status": StatusCodes['ERROR_UNKNOWN']}


@app.route(f'{PREFIX}/submit_order', methods=["POST"])
@handle_exception
def submit_order():
    (session, cart) = getData('session', 'cart')
    # If changing a cart that doesn't belong to them, verify admin
    user = verify_customer(session)
    if not user:
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    cart_obj = OrderHandler.from_id(cart['id'])
    if cart_obj is None:
        return {"status": StatusCodes['ERROR_UNKNOWN']}
    OrderHandler.update_from_dict(cart_obj, cart)
    OrderHandler.set_status(cart_obj, OrderStatus['PENDING'])
    new_cart = OrderHandler.create(user.id)
    db.session.add(new_cart)
    user.orders.append(new_cart)
    db.session.commit()
    return {
        "cart": OrderHandler.to_dict(cart_obj),
        "status": StatusCodes['SUCCESS']
    }


@app.route(f'{PREFIX}/fetch_orders', methods=["POST"])
@handle_exception
def fetch_orders():
    '''Fetch orders that match the provided state'''
    (session, status) = getData('session', 'status')
    if not verify_admin(session):
        return {"status": StatusCodes['ERROR_NOT_AUTHORIZED']}
    return {
        "orders": [OrderHandler.to_dict(order) for order in OrderHandler.from_status(status)],
        "status": StatusCodes['SUCCESS']
    }
