from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from api.config import Config

cors_config = {
  'ORIGINS': [
    'http://localhost:3000',  # React
    'http://127.0.0.1:3000',  # React
  ],

  'SECRET_KEY': '...'
}

db = SQLAlchemy()
bcrypt = Bcrypt()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app, resources={ r'/*': {'origins': cors_config['ORIGINS']}}, supports_credentials=True)

    db.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)

    return app