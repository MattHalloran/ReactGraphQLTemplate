# Common model imports
from src.api import db
from src.models.tables import Tables
from enum import Enum


class ImageUses(Enum):
    HERO = 1
    GALLERY = 2


# Stores metadata for images used on website (gallery, hero, etc), but NOT profile pictures
class Image(db.Model):
    __tablename__ = Tables.IMAGE.value
    id = db.Column(db.Integer, primary_key=True)
    directory = db.Column(db.String(250), nullable=False)
    file_name = db.Column(db.String(100), nullable=False)
    thumbnail_file_name = db.Column(db.String(100), nullable=False)
    extension = db.Column(db.String(10), nullable=False)
    alt = db.Column(db.String(100))
    hash = db.Column(db.String(100), unique=True, nullable=False)
    used_for = db.Column(db.Integer, nullable=False)
    width = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Integer, nullable=False)

    SUPPORTED_IMAGE_TYPES = ['bmp', 'gif', 'png', 'jpg', 'jpeg', 'ico']

    def __init__(self,
                 directory: str,
                 file_name: str,
                 thumbnail_file_name: str,
                 extension: str,
                 alt: str,
                 hash: str,
                 used_for: int,
                 width: int,
                 height: int):
        if extension not in self.SUPPORTED_IMAGE_TYPES:
            raise Exception('File extension not supported for images')
        uses = [x.value for x in ImageUses]
        if used_for not in uses:
            raise Exception('Must pass a valid used_for value')
        self.directory = directory
        self.file_name = file_name
        self.thumbnail_file_name = thumbnail_file_name
        self.extension = extension
        self.alt = alt
        self.hash = hash
        self.used_for = used_for
        self.width = width
        self.height = height

    @staticmethod
    def from_hash(hash: str):
        return db.session.query(Image).filter_by(hash=hash).one_or_none()

    @staticmethod
    def is_hash_used(hash: str):
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None

    def to_json(self):
        return {"hash": self.hash, "alt": self.alt, "used_for": self.used_for,
                "width": self.width, "height": self.height}

    def __repr__(self):
        return f"{self.__tablename__}('{self.id}', '{self.file_name}')"
