from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from src.config import Config
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()


def create_app(config_class=Config):
    app = Flask(__name__, static_folder="../build", static_url_path="/")
    app.config.from_object(Config)
    db.init_app(app)
    migrate.init_app(app, db)

    return app
