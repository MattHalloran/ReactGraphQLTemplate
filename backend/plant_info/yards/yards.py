import json
import os

block_traits = {
    'plant_type': 'Plant Type',
    'jersey_native': 'New Jersey Native',
    'bloom_times': 'Bloom Times',
    'bloom_colors': 'Bloom Colors',
    'deer_resistance': 'Deer Resistance',
    'attracts_pollinators_and_wildlife': 'Attracts Pollinators and Wildlife',
    'salt_tolerance': 'Salt Tolerance',
    'zones': 'Hardiness Zone',
    'physiographic_region': 'Physiographic Region',
    'soil_type': 'Soil Type',
    'soil_moisture': 'Soil Moisture',
    'soil_ph': 'Soil pH',
    'optimal_light': 'Optimal Light',
    'light_range': 'Light Range',
    'drought_tolerance': 'Drought Tolerance',
    'grown_height': 'Height',
    'grown_spread': 'Spread',
    'growth_rate': 'Growth Rate'
}


def merge_yards_files():
    curr_dir = os.path.dirname(__file__)
    yard_files = []
    plants_data = []
    # Find all json data files
    for file in os.listdir(curr_dir):
        if file.endswith(".json"):
            yard_files.append(os.path.join(curr_dir, file))
    # Merge data from files into one array
    for file in yard_files:
        with open(os.path.join(curr_dir, file), 'rb') as infile:
            json_data = json.load(infile)
            curr_data = json_data['page'][0]['plant_data']
            # Convert data to usable json fields
            for plant in curr_data:
                # If extra traits are missing from this plant, skip
                if 'block_data' not in plant:
                    plants_data.append(plant)
                    continue
                # Split the block data into lines, and remove lines without useful data
                block = plant['block_data'].splitlines()
                block = [b for b in block if ':' in b]
                del plant['block_data']
                # Locate add and each trait from the block_traits dict
                for trait_name, trait_label in block_traits.items():
                    # Find the correct line
                    matching_indices = [i for i, elem in enumerate(block) if trait_label in elem]
                    if len(matching_indices) <= 0:
                        continue
                    matching_line = block[matching_indices[0]]
                    # Remove trait label, so we're left with just the trait text
                    filtered_line = matching_line[matching_line.find(f'{trait_label}: ')+len(trait_label)+2:]
                    # If there are commas, split data into a list
                    if filtered_line.find(', ') >= 0:
                        plant[trait_name] = filtered_line.split(', ')
                    else:
                        plant[trait_name] = filtered_line
                plants_data.append(plant)
    # Save the combined data to the output file
    with open(os.path.join(curr_dir, "output.txt"), 'w') as outfile:
        print(len(plants_data))
        json.dump(plants_data, outfile)


if __name__ == "__main__":
    merge_yards_files()
