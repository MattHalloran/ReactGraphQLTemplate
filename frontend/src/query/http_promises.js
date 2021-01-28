// Wraps functions from http_functions in Promises
import * as http from './http_functions';

function promiseWrapper(http_func, ...args) {
    return new Promise(function (resolve, reject) {
        http_func(...args).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export const getContactInfo = () => promiseWrapper(http.fetch_contact_info);
export const updateContactInfo = (data) => promiseWrapper(http.update_contact_info, data);
export const getGallery = () => promiseWrapper(http.fetch_gallery);
export const getGalleryThumbnails = (hashes) => promiseWrapper(http.fetch_image_thumbnails, hashes)
export const uploadGalleryImages = (formData) => promiseWrapper(http.upload_gallery_images, formData);
export const getProfileInfo = (session) => promiseWrapper(http.fetch_profile_info, session);
export const getInventory = (filter_by) => promiseWrapper(http.fetch_inventory, filter_by);
export const getInventoryPage = (skus) => promiseWrapper(http.fetch_inventory_page, skus);
export const getImageFromHash = (hash) => promiseWrapper(http.fetch_image_from_hash, hash);
export const getImageFromSku = (sku) => promiseWrapper(http.fetch_image_from_sku, sku);