
class Config:
    # URI format: dialect+driver://username:password@host:port/database
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
