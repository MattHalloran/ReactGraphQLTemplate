import json
import os
import plantNetScraper
from plantNetScraper import image_categories
import traceback

CURR_DIR = os.path.dirname(__file__)
# IN_FILE = 'plantnet-species-links.json'
IN_FILE = os.path.join(CURR_DIR, 'required-species-links.json')
OUT_FILE = os.path.join(CURR_DIR, 'output.json')
OVERRIDE_PREVIOUSLY_DOWNLOADED = True


def scrape_images():
    '''Reads in json data of a list of plant latin names,
    gathered from a PlantNet web scraper script.
    Adds categorized photo urls and hashes'''
    json_data = {}
    try:
        with open(IN_FILE, 'rb') as infile:
            json_data = json.load(infile)['plants']
        # Grab all plant info links from json data
        plant_urls = [plant['url'] for plant in json_data]
        # Scrape all plant info urls for lists of plant-specific image urls
        scraper = plantNetScraper.PlantNetScraper(plant_urls)
        photo_urls = scraper.scrape_all()
        # Add the photo data to json data
        for i in range(len(json_data)):
            images_by_category = {}
            for j in range(len(image_categories)):
                images_by_category[image_categories[j]] = photo_urls[i][j]
            json_data[i]['images'] = images_by_category
            # Format the latin name, to make it easier to match with other json
            # Simply takes first two words
            json_data[i]['name'] = ' '.join(json_data[i]['name'].split()[0:2])
    except Exception:
        print(traceback.format_exc())
        print('Error occured while scraping images')
    finally:
        print(f'Writing data to file {OUT_FILE}')
        # Use 'wget -i output_file_name.txt' to download photos from comand line
        with open(OUT_FILE, 'w') as outfile:
            json.dump(json_data, outfile)


if __name__ == "__main__":
    scrape_images()
