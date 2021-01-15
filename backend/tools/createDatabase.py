# Sets up test database for use. Good idea to delete database file first. See docs

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.models.role import Role                # noqa E402
from src.models.user import User                # noqa E402
from src.models.image import Image, ImageUses   # noqa E402
from src.api import db, create_app              # noqa E402
from src.config import Config                   # noqa E402

app = create_app()
with app.app_context():
    # Create the database
    db.create_all()
    # Add Roles for users
    customer = Role('Customer', 'This role allows a user to order products')
    admin = Role('Admin', 'This role grants administrative access. This comes with the ability to approve new customers, change customer information, modify inventory and contact hours, and more.')
    db.session.add(customer)
    db.session.add(admin)
    db.session.commit()
    # ******FOR TEST PURPOSES ONLY - you can try using this on the website, but it will not work******
    # Also please don't email me :)
    admin_account = User(name='Bugs Bunny', email='mdhalloran@yahoo.com',
                         password='password', existing_customer=True)
    admin_account.roles.append(admin)
    db.session.add(admin_account)
    gallery_image = Image(Config.GALLERY_DIR, 'sponge', 'sponge-thumb', 'jpeg', 'test gallery image', 'fake hash', ImageUses.GALLERY.value, 100, 100)
    db.session.add(gallery_image)
    db.session.commit()
