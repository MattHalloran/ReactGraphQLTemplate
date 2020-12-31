from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import selenium.common.exceptions as sel_ex

selenium_exceptions = (sel_ex.ElementClickInterceptedException, sel_ex.ElementNotInteractableException, sel_ex.StaleElementReferenceException)
image_categories = ['flower', 'leaf', 'fruit', 'bark', 'habit']
IMAGES_PER_TAB = 10


class PlantNetScraper():

    def __init__(self, urls):
        self.urls = urls

    # Returns 3D array of image urls, organized by category
    def scrape_all(self):
        all_plant_urls = []
        opts = Options()
        opts.add_argument("--headless")
        with webdriver.Chrome(ChromeDriverManager().install(), options=opts) as wd:
            for url in self.urls:
                print(f'Getting photo urls for {url}')
                wd.get(url)
                all_plant_urls.append(self.get_plant_urls(wd))
        return all_plant_urls

    def scroll_to_end(self, wd):
        wd.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    def get_plant_category_urls(self, category: str, wd):
        print(f'Getting urls for category {category}')
        # Find container tab navigation image and click it
        try:
            img_to_click = wd.find_element_by_xpath(f'//img[@alt="{category}"]')
        except sel_ex.NoSuchElementException:
            print(f'Failed to locate category {category}')
            return []
        img_to_click.click()
        # Scroll down page until enough images have loaded
        img_count = 0
        img_elems = []
        while img_count < IMAGES_PER_TAB:
            self.scroll_to_end(wd)
            # Find container of plant category images
            img_elems = wd.find_elements_by_xpath('//div[@class="container" and 1]//div[@class="card-body"]//img')
            old_count = img_count
            img_count = len(img_elems)
            if old_count == img_count:
                print('Could not find any more images by scrolling')
                break
        # Grab all category urls
        category_urls = []
        for img in img_elems:
            url = img.get_attribute('src')
            if url is not None:
                category_urls.append(url)
            if len(category_urls) >= IMAGES_PER_TAB:
                break
        return category_urls

    def get_plant_urls(self, wd):
        img_urls = []
        for alt in image_categories:
            img_urls.append(self.get_plant_category_urls(alt, wd))
        return img_urls
