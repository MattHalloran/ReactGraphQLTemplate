from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from src.config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    return app
