Last update: 2020/11/24

The database code is located in models.py. The database is currently SQLite, but can be switched easily (thank you SQLAlchemy).

To set up or recreate the database:
0) If recreating the database, delete site.db
1) Open a terminal. Navigate to the directory containing models.py
2) Start python and type (make sure to enter each line as it appears exactly after the > character. If it starts 
   with a tab, make sure to enter the tab. If it is blank, enter a blank line):
    >import models
    >from api import db, create_app
    >app = create_app()
    >with app.app_context():
    >   db.create_all()
    >
3) If there are no errors, enter:
    >exit()
