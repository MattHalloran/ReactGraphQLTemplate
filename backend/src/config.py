import os


class Config:
    DB_NAME = 'nlndb'
    DB_LANGUAGE = 'postgresql'
    DB_USERNAME = 'siteadmin'
    DB_PASSWORD = os.environ.get("DB_PASSWORD")
    DB_HOST = 'localhost'
    # URI format: dialect+driver://username:password@host:port/database
    # BASE_DB used for connecting to database if site's db has been deleted
    BASE_DB = f'{DB_LANGUAGE}://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/postgres'
    SQLALCHEMY_DATABASE_URI = f'{DB_LANGUAGE}://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BASE_IMAGE_DIR = 'assets'
    PLANT_FOLDER = 'plant'
    GALLERY_FOLDER = 'gallery'
