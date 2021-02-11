# Reads an .xls availability file into the database.
# SKUs of plants not in the availability file will be hidden
import pandas as pd
import math
import numpy
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.api import db, create_app  # NOQA
from src.handlers import SkuHandler, PlantHandler  # NOQA

app = create_app()

# Define file path
CURR_DIR = os.path.dirname(__file__)
AVAILABILITY_FILE = os.path.join(CURR_DIR, 'curr_availability.xls')

# Load in excel columns using pandas
df = pd.read_excel(AVAILABILITY_FILE)
latin_names = df['Botanical Name']
common_names = df['Common Name']
sizes = df['Size']
notes = df['Notes']
prices = df['Price 10+']
codes = df['Plant Code']
quantities = df['Quantity']


def is_cell_blank(cell):
    if type(cell) is float or type(cell) is numpy.float64:
        return math.isnan(cell)
    return False


# Using database context, iterate through each plant
# TODO remove plants not found in availability list
with app.app_context():
    for i in range(len(latin_names)):
        curr_latin = latin_names[i]
        curr_sku = codes[i]
        # Look for existing SKU by code
        sku = SkuHandler.from_sku(curr_sku)
        # If not found by code, search by plant
        if sku is None:
            plant = PlantHandler.from_latin(curr_latin)
            # If found by plant, update sku with code
            if plant:
                print(f'Found SKU {curr_sku} by plant instead of code')
                sku = SkuHandler.from_plant(plant)
        # If SKU not found by code or plant, create from scratch
        if sku is None:
            print(f'Could not find SKU associated with {curr_sku}. Attempting to create new one')
            plant = PlantHandler.create(curr_latin)
            db.session.add(plant)
            db.session.commit()
            sku = SkuHandler.create()
            SkuHandler.set_plant(sku, plant)
            db.session.add(sku)
            db.session.commit()
        # Now that we have a SKU, update it and its plant with the spreadsheet data
        plant_dict = {}
        sku_dict = {}
        if not is_cell_blank(common_names[i]):
            print('IN COMMON NAME')
            plant_dict['common_name'] = common_names[i]
        if not is_cell_blank(sizes[i]):
            sku_dict['size'] = str(sizes[i]).replace('#', '')
        if not is_cell_blank(prices[i]):
            sku_dict['price'] = str(prices[i]).replace('.', '')
        if not is_cell_blank(codes[i]):
            sku_dict['sku'] = codes[i]
        if not is_cell_blank(quantities[i]):
            sku_dict['availability'] = int(quantities[i])
        if len(plant_dict) > 0:
            print(f'ATTEMPTING TO UPDATE PLANT FOR {sku}')
            print(plant_dict)
            PlantHandler.update(sku.plant, plant_dict)
            print(f'AAAAAAA PLANT DATA IS: {sku.plant}')
            db.session.commit()
            print(f'BBBBBBB PLANT DATA IS: {sku.plant}')
        if len(sku_dict) > 0:
            print(f'ATTEMPTING TO UPDATE SKU FOR {curr_sku}')
            print(sku_dict)
            SkuHandler.update(sku, sku_dict)
            print(f'AAAAAA SKU DATA IS: {plant}')
            db.session.commit()
            print(f'BBBBBB SKU DATA IS: {plant}')
        print(f'SUCCESSFULLY ADDED SKU FOR {curr_sku}')
        print(f'PLANT DATA: {sku.plant}')
        print(f'SKU DATA: {sku}')
