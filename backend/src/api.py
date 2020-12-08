from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_sqlalchemy import declarative_base
from src.config import Config

db = SQLAlchemy()
Base = declarative_base()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    return app
