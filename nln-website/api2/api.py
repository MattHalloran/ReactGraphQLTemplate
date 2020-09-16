from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from api.models import db, User
import sys
import ast

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/api/register', methods=['POST'])
@cross_origin(supports_credentials=True)
def register(): 
    try:
        byte_data = request.data
        dict_str = byte_data.decode('UTF-8')
        data = ast.literal_eval(dict_str)
        print('here1' + request.method)
        hash = 'test'
        user = User(username=data['name'], email=data['email'], password=hash)
        print(f'here4 {data["name"]} {data["email"]} {hash} {user}')
        db.session.add(user)
        print('here5')
        db.session.commit()
        print('here6')
        return {"result": "Good to go"}
    except :
        print('thereeeeeeeee' + request.method)
        print(sys.exc_info())
        return {"error": "Failed to register user"}

if __name__ == '__main__':
    print('here')