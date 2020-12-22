
class Config:
    # URI format: dialect+driver://username:password@host:port/database
    SQLALCHEMY_DATABASE_URI = 'postgresql://localhost/nlnwebsite'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    BASE_IMAGE_DIR = '/Users/matthewhalloran/Documents/NLNWebsite/backend/assets'
    GALLERY_DIR = f'{BASE_IMAGE_DIR}/gallery'
