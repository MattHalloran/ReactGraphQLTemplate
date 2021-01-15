# Common model imports
from src.api import db
from src.models.tables import Tables


# A base class for discounts that can either be applied to:
#   1) one or more inventory items, or
#   2) one or more customers
# These discounts are not stacked; whichever discount is the greatest will be applied
class Discount(db.Model):
    __tablename__ = Tables.DISCOUNT.value
    # ---------------Start columns-----------------
    id = db.Column(db.Integer, primary_key=True)
    # A number between 0 < 1, representing the discount percent in dollars (at least currently)
    discount = db.Column(db.DECIMAL(4, 4), nullable=False, default=0)
    # A short string explaining what the discount is for. Optional
    title = db.Column(db.String(100))
    # A string with any other relevant text relating to the discount
    text_content = db.Column(db.String(2000))
    # ----------------End columns-------------------
