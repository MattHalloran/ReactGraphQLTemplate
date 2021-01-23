from src.api import db
from src.handlers.handler import Handler
from src.models import Image


class ImageHandler(Handler):

    @staticmethod
    def model_type():
        return Image

    @staticmethod
    def all_fields():
        return ['directory', 'file_name', 'thumbnail_file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @staticmethod
    def required_fields():
        return ['directory', 'file_name', 'thumbnail_file_name', 'extension',
                'alt', 'hash', 'used_for', 'width', 'height']

    @staticmethod
    def to_dict(model: Image):
        return Handler.simple_fields_to_dict(model, ['hash', 'alt', 'used_for', 'width', 'height'])

    @staticmethod
    def from_hash(hash: str):
        return db.session.query(Image).filter_by(hash=hash).one_or_none()

    @staticmethod
    def is_hash_used(hash: str):
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None
