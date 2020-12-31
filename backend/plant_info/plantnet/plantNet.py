import json
import os
import plantNetScraper
from plantNetScraper import image_categories
import numpy as np

# Reads in json data of a list of plant latin names
# Adds categorized photo urls and hashes
def scrape_images():
    # Find json data, created from ParseHub
    curr_dir = os.path.dirname(__file__)
    species_file = os.path.join(curr_dir, 'plantnet-species-links.json')
    with open(species_file, 'rb') as infile:
        json_data = json.load(infile)['plants']
    # Grab all plant info links from json data
    plant_urls = [plant['url'] for plant in json_data]
    # Scrape all plant info urls for lists of plant-specific image urls
    scraper = plantNetScraper.PlantNetScraper(plant_urls)
    photo_urls = scraper.scrape_all()
    # Add the photo data to json data
    for i in range(len(json_data)):
        category_json = {
            'flower': photo_urls[i][0],
            'leaf': photo_urls[i][1],
            'fruit': photo_urls[i][2],
            'bark': photo_urls[i][3],
            'habit': photo_urls[i][4]
        }
        json_data[i]['images'] = category_json
        # Format the latin name, to make it easier to match with other json
        # Simply takes first two words
        json_data[i]['name'] = ' '.join(json_data[i]['name'].split()[0:2])
    # Save the combined data to the output file
    # Use 'wget -i output_file_name.txt' to download photos from comand line
    with open(os.path.join(curr_dir, "output.txt"), 'w') as outfile:
        json.dump(json_data, outfile)

if __name__ == "__main__":
    scrape_images()
