// Wraps functions from http_functions in Promises
import { PUBS, PubSub } from 'utils';
import * as http from './http_functions';
import Localbase from 'localbase';

// Helper method for basic http calls
function promiseWrapper(http_func, ...args) {
    return new Promise(function (resolve, reject) {
        PubSub.publish(PUBS.Loading, true);
        http_func(...args).then(response => {
            PubSub.publish(PUBS.Loading, false);
            if (response.ok) {
                resolve(response);
            } else {
                console.warn(`HTTP call ${http_func} failed with status ${response.status}`);
                reject(response);
            }
        }).catch(err => {
            console.error(err);
            PubSub.publish(PUBS.Loading, false);
        })
    });
}

export const getUnusedPlants = (sorter) => promiseWrapper(http.fetch_unused_plants, sorter);
export const getInventory = (sorter, page_size, admin) => promiseWrapper(http.fetch_inventory, sorter, page_size, admin);
export const getInventoryPage = (ids) => promiseWrapper(http.fetch_inventory_page, ids);
export const getInventoryFilters = () => promiseWrapper(http.fetch_inventory_filters);
export const modifySku = (sku, operation, data) => promiseWrapper(http.modify_sku, sku, operation, data);
export const modifyPlant = (operation, data) => promiseWrapper(http.modify_plant, operation, data);
export const modifyCustomer = (id, operation) => promiseWrapper(http.modify_customer, id, operation);
export const setOrderStatus = (id, status) => promiseWrapper(http.set_order_status, id, status);

export function submitOrder(cart) {
    return new Promise(function (resolve, reject) {
        http.submit_order(cart).then(response => {
            if (response.ok) {
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}

// Retrieves image from server or ui, 
// depending on if it is cached
export async function getImage(key, size) {
    let db = new Localbase('db');
    let collection = 'images';
    let image_key = `nln-img-${key}-${size}`;
    let image = await db.collection(collection).doc(image_key).get();
    console.log('STORED IMAGE ISSS', image)
    if (image !== null && image.src !== null) {
        return {
            ok: true,
            data: image
        }
    }
    let response = await http.fetch_image(key, size);
    if (response.ok) {
        db.collection(collection).add(response.data, image_key);
    }
    return response;
}


// Retrieves images from server or ui, 
// depending on if they are cached
export async function getImages(keys, size) {
    let db = new Localbase('db');
    let collection = 'images';
    let prefix = 'nln-img';
    let images = new Array(keys.length).fill(null);
    let img_keys = [...keys];
    // Find cached images
    for (let i = 0; i < keys.length; i++) {
        let image_key = `${prefix}-${img_keys[i]}-${size}`;
        let image = await db.collection(collection).doc(image_key).get();
        if (image !== null && image.src !== null) {
            images[i] = image;
            img_keys[i] = null;
        }
    }
    // Query uncached images
    let response = await http.fetch_images(img_keys, size);
    console.log('GOT RESPONSE: ', response)
    if (response.ok) {
        for (let i = 0; i < response.data.length; i++) {
            let image = response.data[i];
            if (image !== null && image.src !== null) {
                db.collection(collection).add(image, `${prefix}-${img_keys[i]}-${size}`);
                images[i] = image;
            }
        }
        return {
            ok: true,
            data: images
        }
    }
    return {
        ok: false,
        data: images,
        message: 'Failed to load some images'
    }
}
