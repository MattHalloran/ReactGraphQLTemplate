from flask import Flask
import requests
from api import app, db, bcrypt

import time

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

#Register a new account
@app.route('/api/register', methods=['OPTIONS','POST'])
def register():
    if request.method == 'OPTIONS':
        return build_preflight_response()
    elif request.method == 'POST':
        hash = 'test'
        user = User(username=request.form['user'], email=request.form['email'], password=hash)
        db.session.add(user)
        db.session.commit()
        return build_actual_response({result: "Good to go"})

def build_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response
def build_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response