import { fetch_gallery, fetch_image, fetch_image_thumbnails, upload_gallery_images } from './http_functions';
import { StatusCodes } from './status';

export function getGallery() {
    return new Promise(function (resolve, reject) {
        try {
            fetch_gallery()
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}

export function getGalleryThumbnails(hashes) {
    return new Promise(function (resolve, reject) {
        try {
            fetch_image_thumbnails(hashes)
                .then(response => {
                    response.json().then(data => {
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}

export function getGalleryImage(hash) {
    return new Promise(function (resolve, reject) {
        try {
            fetch_image(hash)
                .then(response => {
                    response.json().then(data => {
                        if(data.image !== null) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}

export function uploadGalleryImages(formData) {
    return new Promise(function (resolve, reject) {
        try {
            upload_gallery_images(formData)
                .then(response => {
                    response.json().then(data => {
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(data);
                        } else {
                            reject(data);
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject({ status: StatusCodes.ERROR_UNKNOWN });
        }
    });
}