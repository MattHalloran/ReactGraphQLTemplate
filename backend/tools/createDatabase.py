import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import src.models
from src.api import db, create_app

app = create_app()
with app.app_context():
    db.create_all()
