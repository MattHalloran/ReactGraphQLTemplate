# Common model imports
from src.api import db
from src.models.tables import Tables

# A joining table for the two-way relationship between users and roles.
# A user can have many roles, and a role can be shared by many users
userRoles = db.Table(Tables.USER_ROLES.value,
                     db.Column('id', db.Integer, primary_key=True),
                     db.Column('user_id', db.Integer, db.ForeignKey(f'{Tables.USER.value}.id')),
                     db.Column('role_id', db.Integer, db.ForeignKey(f'{Tables.ROLE.value}.id'))
                     )

# A joining table for the many-to-many relationship
# between user discounts and businesses
businessDiscounts = db.Table(Tables.BUSINESS_DISCOUNTS.value,
                             db.Column('id', db.Integer, primary_key=True),
                             db.Column('business_id', db.Integer, db.ForeignKey(f'{Tables.BUSINESS.value}.id')),
                             db.Column('business_discount_id', db.Integer, db.ForeignKey(f'{Tables.DISCOUNT.value}.id'))
                             )

# A joining table for the many-to-many relationship
# between inventory discounts and inventory items
itemDiscounts = db.Table(Tables.ITEM_DISCOUNTS.value,
                         db.Column('id', db.Integer, primary_key=True),
                         db.Column('plant_id', db.Integer, db.ForeignKey(f'{Tables.PLANT.value}.id')),
                         db.Column('plant_discount_id', db.Integer, db.ForeignKey(f'{Tables.DISCOUNT.value}.id'))
                         )

# A joining table for the two-way relationship between plants and sizes.
plantSizes = db.Table(Tables.PLANT_SIZES.value,
                      db.Column('id', db.Integer, primary_key=True),
                      db.Column('plant_id', db.Integer, db.ForeignKey(f'{Tables.PLANT.value}.id')),
                      db.Column('size_id', db.Integer, db.ForeignKey(f'{Tables.SIZE.value}.id'))
                      )
