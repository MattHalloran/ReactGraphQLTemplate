from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from api import create_app
from models import db, User
from messenger import welcome, reset_password
from auth import generate_token, requires_auth, verify_token
from sqlalchemy import exc
import ast
import sys
from types import SimpleNamespace
import traceback

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

#Must keep this in sync with the frontend auth code dictionary
auth_codes_dict = {
    "LOGIN_SUCCESS": 100,
    "LOGIN_ERROR_UNKNOWN": 200,
    "REGISTER_SUCCESS": 300,
    "REGISTER_ERROR_EMAIL_EXISTS": 400,
    "REGISTER_ERROR_UNKNOWN": 500,
    "FETCH_PROTECTED_DATA_REQUEST": 600,
    "RECEIVE_PROTECTED_DATA": 700,
    "TOKEN_FOUND": 800,
    "TOKEN_NOT_FOUND_NO_USER": 900,
    "TOKEN_NOT_FOUND_ERROR_UNKOWN": 1000,
    "RESET_PASSWORD_SUCCESS": 1100,
    "RESET_PASSWORD_ERROR_UNKNOWN": 1200,
    "TOKEN_VERIFIED": 1300,
    "TOKEN_NOT_VERIFIED": 1400
}
AUTH_CODES = SimpleNamespace(**auth_codes_dict)


@app.route("/api/user", methods=["GET"])
@requires_auth
def get_user():
    return jsonify(result=g.current_user)


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
        except exc.IntegrityError as e:
            print(traceback.format_exc())
            status = AUTH_CODES.REGISTER_ERROR_EMAIL_EXISTS
            return {"status": status}
        status = AUTH_CODES.REGISTER_SUCCESS
        return {"id": user.id,
                "token": generate_token(app, user),
                "status": status}
    except Exception as e:
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
            status = AUTH_CODES.TOKEN_FOUND
            return {
                "id": user.id,
                "token": generate_token(app, user),
                "status": status
            }
        status = AUTH_CODES.TOKEN_NOT_FOUND_NO_USER
        return jsonify(error=True), status
    except Exception as e:
        print(traceback.format_exc())
        status = AUTH_CODES.TOKEN_NOT_FOUND_ERROR_UNKNOWN
        return {"status": status}

@app.route('/api/reset_password_request', methods=['POST'])
def send_password_reset_request():
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        reset_password(data['email'])
        status = AUTH_CODES.RESET_PASSWORD_SUCCESS
        return {"status": status}
    except Exception as e:
        print(traceback.format_exc())
        status = AUTH_CODES.RESET_PASSWORD_ERROR_UNKNOWN
        return {"status": status}


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    is_valid = verify_token(app, incoming["token"])

    if is_valid:
        status = AUTH_CODES.TOKEN_VERIFIED
        return jsonify(token_is_valid=True), status
    else:
        status = AUTH_CODES.TOKEN_NOT_VERIFIED
        return jsonify(token_is_valid=False), status


if __name__ == '__main__':
    app.run(debug=True)
