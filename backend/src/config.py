
class Config:
    DB_NAME = 'nlnwebsite'
    DB_LANGUAGE = 'postgresql'
    DB_HOST = 'localhost'
    # URI format: dialect+driver://username:password@host:port/database
    # BASE_DB used for connecting to database if site's db has been deleted
    BASE_DB = f'{DB_LANGUAGE}://{DB_HOST}/postgres'
    SQLALCHEMY_DATABASE_URI = f'{DB_LANGUAGE}://{DB_HOST}/{DB_NAME}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BASE_IMAGE_DIR = '/Users/matthewhalloran/Documents/NLNWebsite/backend/assets'
    GALLERY_DIR = f'{BASE_IMAGE_DIR}/gallery'
