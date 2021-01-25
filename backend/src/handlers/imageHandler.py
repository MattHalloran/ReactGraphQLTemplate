from src.api import db
from src.handlers.handler import Handler
from src.models import Image, ImageUses


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
    def from_used_for(used_for: ImageUses):
        return db.session.query(Image).filter_by(used_for=used_for.value).all()

    @staticmethod
    def from_file_name(file_name: str):
        return db.session.query(Image).filter_by(file_name=file_name).one_or_none()

    @staticmethod
    def from_hash(hash: str):
        return db.session.query(Image).filter_by(hash=hash).one_or_none()

    @staticmethod
    def is_hash_used(hash: str):
        return db.session.query(Image.id).filter_by(hash=hash).scalar() is not None
