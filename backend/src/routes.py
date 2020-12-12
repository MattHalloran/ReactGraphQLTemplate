from flask import request, jsonify
from flask_cors import CORS, cross_origin
from src.api import create_app
from src.models import db, User, Plant, account_statuses
from src.messenger import welcome, reset_password
from src.auth import generate_token, verify_token
from sqlalchemy import exc
import ast
from types import SimpleNamespace
import traceback

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

# Must keep this in sync with the frontend auth code dictionary
auth_codes_dict = {
    "REGISTER_SUCCESS": 300,
    "REGISTER_ERROR_EMAIL_EXISTS": 400,
    "REGISTER_ERROR_UNKNOWN": 500,
    "FETCH_PROTECTED_DATA_REQUEST": 600,
    "RECEIVE_PROTECTED_DATA": 700,
    "TOKEN_FOUND": 800,
    "TOKEN_NOT_FOUND_NO_USER": 900,
    "TOKEN_NOT_FOUND_SOFT_LOCKOUT": 910,
    "TOKEN_NOT_FOUND_HARD_LOCKOUT": 920,
    "TOKEN_NOT_FOUND_ERROR_UNKNOWN": 1000,
    "RESET_PASSWORD_SUCCESS": 1100,
    "RESET_PASSWORD_ERROR_UNKNOWN": 1200,
    "TOKEN_VERIFIED": 1300,
    "TOKEN_NOT_VERIFIED": 1400,
    "FETCH_INVENTORY_SUCCESS": 1500,
    "FETCH_INVENTORY_ERROR_UNKNOWN": 1600,
    "FETCH_INVENTORY_PAGE_SUCCESS": 1700,
    "FETCH_INVENTORY_PAGE_ERROR_UNKNOWN": 1800
}
AUTH_CODES = SimpleNamespace(**auth_codes_dict)


@app.route('/api/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        user = User(name=data['name'], email=data['email'],
                    password=data['password'])
        print(f'here4 {data["name"]} {data["email"]} {hash} {user}')
        db.session.add(user)
        try:
            db.session.commit()
            welcome(data['email'])
        # Most likely means that a user with that email already exists
        except exc.IntegrityError:
            print(traceback.format_exc())
            status = AUTH_CODES.REGISTER_ERROR_EMAIL_EXISTS
            return {"status": status}
        status = AUTH_CODES.REGISTER_SUCCESS
        return {"token": generate_token(app, user),
                "name": user.name,
                "theme": user.theme,
                "status": status}
    except Exception:
        print(traceback.format_exc())
        status = AUTH_CODES.REGISTER_ERROR_UNKNOWN
        return {"status": status}


@app.route('/api/get_token', methods=['POST'])
@cross_origin(supports_credentials=True)
def get_token():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        user = User.get_user_from_credentials(data['email'], data['password'])
        if user:
            return {
                "token": generate_token(app, user),
                "status": AUTH_CODES.TOKEN_FOUND,
                "name": user.name,
                "theme": user.theme
            }
        else:
            account_status = User.get_user_lock_status(data['email'])
            print(f'User account status is {account_status}')
            status = AUTH_CODES.TOKEN_NOT_FOUND_ERROR_UNKNOWN
            if account_status == -1:
                status = AUTH_CODES.TOKEN_NOT_FOUND_NO_USER
            elif account_status == account_statuses.SOFT_LOCK:
                status = AUTH_CODES.TOKEN_NOT_FOUND_SOFT_LOCKOUT
            elif account_status == account_statuses.HARD_LOCK:
                status = AUTH_CODES.TOKEN_NOT_FOUND_HARD_LOCKOUT
            return jsonify(status=status)
    except Exception:
        print(traceback.format_exc())
        return {"status": AUTH_CODES.TOKEN_NOT_FOUND_ERROR_UNKNOWN}


@app.route('/api/reset_password_request', methods=['POST'])
def send_password_reset_request():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        reset_password(data['email'])
        return {"status": AUTH_CODES.RESET_PASSWORD_SUCCESS}
    except Exception:
        print(traceback.format_exc())
        return {"status": AUTH_CODES.RESET_PASSWORD_ERROR_UNKNOWN}


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    is_valid = verify_token(app, incoming["token"])

    if is_valid:
        status = AUTH_CODES.TOKEN_VERIFIED
        return jsonify(token_is_valid=True, status=status)
    else:
        status = AUTH_CODES.TOKEN_NOT_VERIFIED
        return jsonify(token_is_valid=False, status=status)


if __name__ == '__main__':
    app.run(debug=True)


# Returns IDs of all inventory items available to the customer.
# Also returns required info to display the first page of results
@app.route("/api/fetch_inventory", methods=["POST"])
def fetch_inventory():
    item_IDs = Plant.get_all_plant_ids()
    page_results = [Plant.get_plant_from_id(id) for id in item_IDs]
    return {
        "all_plant_ids": item_IDs,
        "page_results": page_results,
        "status": AUTH_CODES.FETCH_INVENTORY_SUCCESS
    }


# Returns inventory data for the given inventory IDs
@app.route("/api/fetch_inventory_page", methods=["POST"])
def fetch_inventory_page():
    incoming = request.get_json()
    return [Plant.get_plant_from_id(id) for id in incoming['ids']]
