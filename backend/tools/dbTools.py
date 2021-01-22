import sys
import os
from sqlalchemy import create_engine
import traceback
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.api import db, create_app  # NOQA
from src.config import Config  # NOQA

app = create_app()


def try_create_database(url: str, db_name: str):
    '''Attempts to create the database, but not its contents'''
    try:
        # 1) Open a transaction with the database
        engine = create_engine(url)
        # 2) Since a database cannot be created from a transaction,
        # get the underlying connection
        conn = engine.connect()
        try:
            # 3) But the connection will still be inside a transaction,
            # so you have to end the open transaction with a commit
            conn.execute('commit')
            # 4) Now the database can be created
            conn.execute(f'create database {db_name}')
        except Exception:
            pass
        # 5) Make sure to close the connection
        conn.close()
    except Exception:
        print(traceback.format_exc())
        pass


def try_create_models(app):
    '''Attempts to create the database models
    **Note: This will skip tables that already exist,
    even if you have changed the columns in them'''
    try_create_database(Config.BASE_DB, Config.DB_NAME)
    try:
        # Import all of the table models for the create_all() function
        import src.models  # NOQA
        # Try to create the tables
        with app.app_context():
            db.create_all()
            db.session.commit()
        print('did it!!')
    except Exception:
        print(traceback.format_exc())
        pass


def create_mock_data(app):
    '''Populates database with test data'''
    try_create_models(app)
    from src.models import ImageUses
    from src.handlers.handler import Handler
    from src.handlers.userHandler import UserHandler
    from src.handlers.roleHandler import RoleHandler
    from src.handlers.imageHandler import ImageHandler
    from src.handlers.emailHandler import EmailHandler

    with app.app_context():
        # Add Roles for users
        customer = Handler.create(RoleHandler, 'Customer', 'This role allows a user to order products')
        admin = Handler.create(RoleHandler,
                               'Admin',
                               'This role grants administrative access. This comes with the ability to \
                               approve new customers, change customer information, modify inventory and \
                               contact hours, and more.')
        print('PPPPPPPPPPPPPPPPPPPPPPP')
        print(admin)
        try:
            db.session.add(customer)
            db.session.add(admin)
        except Exception:
            print(traceback.format_exc())
            print('Failed to add roles to database')
        # ******FOR TEST PURPOSES ONLY - you can try using this on the website, but it will not work******
        # Also please don't email me :)
        admin_account = Handler.create(UserHandler, 'Bugs', 'Bunny', None, 'password', True)
        admin_email = Handler.create(EmailHandler, 'mdhalloran@yahoo.com', True)
        admin_account.personal_email.append(admin_email)
        admin_account.roles.append(admin)
        try:
            db.session.add(admin_email)
            db.session.add(admin_account)
        except Exception:
            print(traceback.format_exc())
            print('Failed to add admin account to database')
        gallery_image = Handler.create(ImageHandler, Config.GALLERY_DIR, 'sponge', 'sponge-thumb', 'jpeg', 'test gallery image', 'fake hash', ImageUses.GALLERY, 100, 100)
        db.session.add(gallery_image)
        db.session.commit()


if __name__ == '__main__':
    create_mock_data(app)
