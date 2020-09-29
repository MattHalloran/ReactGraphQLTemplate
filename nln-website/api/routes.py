from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from api import create_app
from models import db, User
from auth import generate_token, requires_auth, verify_token
from sqlalchemy import exc
import sys
import ast

app = create_app()
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})


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
        except exc.IntegrityError as e:
            print(e)
            return {"error": "User with that email already exists!",
                    "status": 403}, 403
        return {"id": user.id,
                "token": generate_token(app, user),
                "status": 200}, 200
    except Exception as e:
        print('thereeeeeeeee' + request.method)
        print(e)
        return {"error": "Failed to register user",
                "status": 409}, 409


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
                "id": user.id,
                "token": generate_token(app, user),
                "status": 200
            },200
        return jsonify(error=True), 403
    except Exception as e:
        print(e)
        return {"error": "Failed to get token",
                "status": 409}, 409


@app.route("/api/is_token_valid", methods=["POST"])
def is_token_valid():
    incoming = request.get_json()
    is_valid = verify_token(app, incoming["token"])

    if is_valid:
        return jsonify(token_is_valid=True)
    else:
        return jsonify(token_is_valid=False), 403


if __name__ == '__main__':
    app.run(debug=True)
