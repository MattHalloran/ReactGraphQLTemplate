from flask import Flask
from api import app, db, bcrypt
from forms import LoginForm, RegisterForm

import time

app = Flask(__name__)

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}

#Register a new account
@app.route('/api/register', methods=['POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed = bcrypt.generate_password_hash(form.password).decode('utf-8')
        user = User(username=form.user, email=form.email, password=hashed)
        db.session.add(user)
        db.session.commit()