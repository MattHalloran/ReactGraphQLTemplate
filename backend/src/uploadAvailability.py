# Reads an .xls availability file into the database.
# SKUs of plants not in the availability file will be hidden
import pandas as pd
import math
import numpy
from src.api import create_app, db
from src.models import SkuStatus
from src.handlers import SkuHandler, PlantHandler


def is_cell_blank(cell):
    if type(cell) is float or type(cell) is numpy.float64:
        return math.isnan(cell)
    return False


def upload_availability(data):
    # Load in excel columns using pandas
    df = pd.read_excel(data)
    latin_names = df['Botanical Name']
    common_names = df['Common Name']
    sizes = df['Size']
    notes = df['Notes']  # NOQA
    prices = df['Price 10+']
    codes = df['Plant Code']
    quantities = df['Quantity']
    # TODO figure out rollback
    app = create_app()
    with app.app_context():
        # First, hide all old SKUs. These can't be deleted, since they
        # can still be in orders
        SkuHandler.hide_all()
        for i in range(len(latin_names)):
            curr_latin = latin_names[i]
            curr_sku = codes[i]
            # Look for existing SKU by code
            sku = SkuHandler.from_sku(curr_sku)
            # If SKU not found by code, create from scratch
            if sku is None:
                print(f'Could not find SKU associated with {curr_sku}. Attempting to create new one')
                plant = PlantHandler.from_latin(curr_latin)
                if not plant:
                    plant = PlantHandler.create(curr_latin)
                db.session.add(plant)
                db.session.commit()
                sku = SkuHandler.create()
                SkuHandler.set_plant(sku, plant)
                db.session.add(sku)
                db.session.commit()
            # Now that we have a SKU, update it and its plant with the spreadsheet data
            plant_dict = {}
            sku_dict = {
                'status': SkuStatus.ACTIVE.value
            }
            if not is_cell_blank(common_names[i]):
                plant_dict['common_name'] = common_names[i]
            if not is_cell_blank(sizes[i]):
                print(f"SIZE IS: unformatted: {str(sizes[i])} formatted: {str(sizes[i]).replace('#', '')}")
                sku_dict['size'] = str(sizes[i]).replace('#', '')
            if not is_cell_blank(prices[i]):
                print(f"PRICE IS: unformatted: {float(prices[i])}  formatted: {int(float(prices[i]) * 100)}")
                sku_dict['price'] = int(float(prices[i]) * 100)
            if not is_cell_blank(codes[i]):
                sku_dict['sku'] = codes[i]
            if not is_cell_blank(quantities[i]):
                sku_dict['availability'] = int(quantities[i])
            if len(plant_dict) > 0:
                print(f'ATTEMPTING TO UPDATE PLANT FOR {sku}')
                print(plant_dict)
                PlantHandler.update(sku.plant, plant_dict)
                db.session.commit()
            if len(sku_dict) > 0:
                print(f'ATTEMPTING TO UPDATE SKU FOR {curr_sku}')
                print(sku_dict)
                SkuHandler.update(sku, sku_dict)
                db.session.commit()
            print(f'SUCCESSFULLY ADDED SKU FOR {curr_sku}')
            print('')
    return True
