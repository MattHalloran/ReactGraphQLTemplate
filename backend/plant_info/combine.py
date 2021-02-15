# Combines plant json data from multiple sources
import json
import os
import string

combined_data = {}
CURR_DIR = os.path.dirname(__file__)
PLANTNET_FILE = os.path.join(CURR_DIR, 'plantnet/output.json')
YARDS_FILE = os.path.join(CURR_DIR, 'yards/output.json')
OUT_FILE = os.path.join(CURR_DIR, 'combined-output.json')

PLANTNET_MAP = {
    'name': 'latin_name',
    'url': 'plantnet_url',
    'images': 'plantnet_images'
}
YARDS_MAP = {
    'latin_name': 'latin_name',
    'url': 'yards_url',
    'description': 'description',
    'images': 'yards_images',
    'plant_type': 'plant_type',
    'jersey_native': 'jersey_native',
    'bloom_times': 'bloom_times',
    'bloom_colors': 'bloom_colors',
    'deer_resistance': 'deer_resistance',
    'attracts_pollinators_and_wildlife': 'attracts_pollinators_and_wildlife',
    'salt_tolerance': 'salt_tolerance',
    'zones': 'zones',
    'physiographic_region': 'physiographic_region',
    'soil_type': 'soil_type',
    'soil_moisture': 'soil_moisture',
    'soil_ph': 'soil_ph',
    'optimal_light': 'optimal_light',
    'light_range': 'light_range',
    'drought_tolerance': 'drought_tolerance',
    'grown_height': 'grown_height',
    'grown_spread': 'grown_spread',
    'growth_rate': 'growth_rate'
}


def format_name(name: str):
    '''Returns a formatted version of a plant's name'''
    # Lowercase name, to make operations easier
    name = name.lower()
    # Remove l., sp., and spp. from strings (and everything after them)
    remove = [' l.', ' sp.', ' spp.']
    for r in remove:
        if r in name:
            name = name.split(r)[0]
    # Split string into array
    words = name.split(' ')
    # Remove everything that isn't the latin name.
    # This is either the first 2 words, or first 3 if the second is an 'x'
    if len(words) >= 3 and words[1] == 'x':
        name = ' '.join(words[0:3])
    elif len(words) >= 2:
        name = ' '.join(words[0:2])
    # Apply correct capitalization
    name = string.capwords(name)
    return name


def format_plantnet(data: list):
    '''Formats all latin names from the plantnet dataset'''
    for plant in data:
        plant['name'] = format_name(plant['name'])


def format_yards(data: list):
    '''Formats all latin names from the yards dataset'''
    for plant in data:
        plant['latin_name'] = format_name(plant['latin_name'])


def add_to_combined(plant_info: dict, key_mapping: dict):
    '''Adds the plant info into the combined data, while converting key names
    to what the key mapping specifies
    **NOTE: key_mapping must contain latin_name'''
    formatted_plant_info = {}
    for k, v in key_mapping.items():
        if k in plant_info:
            formatted_plant_info[v] = plant_info[k]
    # Convert Yes/No Strings to boolean
    if 'jersey_native' in formatted_plant_info:
        formatted_plant_info['jersey_native'] = formatted_plant_info['jersey_native'].lower() == 'yes'
    # If some info about this plant is already in combined data
    latin_name = formatted_plant_info['latin_name']
    if latin_name in combined_data:
        for k2, v2 in formatted_plant_info.items():
            combined_data[latin_name][k2] = v2
    else:
        combined_data[latin_name] = formatted_plant_info


def combine():
    # Dictionary of dictionaries
    plantnet_data = []
    yards_data = []
    # Grab output dict from each data source
    with open(PLANTNET_FILE, 'rb') as infile:
        plantnet_data = json.load(infile)
    with open(YARDS_FILE, 'rb') as infile:
        yards_data = json.load(infile)
    # Format the keys (latin names) from each dict in the lists
    format_plantnet(plantnet_data)
    format_yards(yards_data)
    # Combine data from both lists
    for plant in plantnet_data:
        add_to_combined(plant, PLANTNET_MAP)
    for plant in yards_data:
        add_to_combined(plant, YARDS_MAP)
    # Now convert the combined dict to a list
    combined_list = []
    for key, value in combined_data.items():
        combined_list.append(value)
    with open(OUT_FILE, 'w') as outfile:
        json.dump(combined_list, outfile)


if __name__ == "__main__":
    combine()
