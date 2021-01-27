import { fetch_gallery, fetch_image_from_hash, fetch_image_thumbnails, upload_gallery_images } from './http_functions';

export function getGallery() {
    return new Promise(function (resolve, reject) {
        fetch_gallery().then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function getGalleryThumbnails(hashes) {
    return new Promise(function (resolve, reject) {
        fetch_image_thumbnails(hashes).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function getGalleryImage(hash) {
    return new Promise(function (resolve, reject) {
        fetch_image_from_hash(hash).then(data => {
            if (data.ok && data.image !== null) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function uploadGalleryImages(formData) {
    return new Promise(function (resolve, reject) {
        upload_gallery_images(formData).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}