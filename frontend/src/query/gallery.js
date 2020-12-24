import { fetch_gallery, fetch_gallery_image, upload_gallery_images } from './http_functions';
import { StatusCodes } from './constants';

export function getGallerySuccess(status, images_meta) {
    return {
        images_meta: images_meta,
        status: status
    };
}

export function getGalleryFailure(status) {
    return {
        status: status
    };
}

export function getGallery() {
    return new Promise(function (resolve, reject) {
        try {
            fetch_gallery()
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === StatusCodes.FETCH_GALLERY_SUCCESS) {
                            resolve(getGallerySuccess(data.status, data.images_meta))
                        } else {
                            reject(getGalleryFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getGalleryFailure(StatusCodes.FETCH_GALLERY_ERROR_UNKNOWN));
        }
    });
}

export function getGalleryImageSuccess(status, image) {
    return {
        image: image,
        status: status
    };
}

export function getGalleryImageFailure(status) {
    return {
        status: status
    };
}

export function getGalleryImage(filename) {
    return new Promise(function (resolve, reject) {
        try {
            console.log('GALLERY IMAGE ATTTEMP BOIIIII', filename);
            fetch_gallery_image(filename)
                .then(response => {
                    console.log('BLEEP BLOOP IM A GLOOP', response);
                    response.json().then(data => {
                        console.log('sHEEEWOOOG');
                        console.log(data);
                        if(data.image !== null) {
                            resolve(getGalleryImageSuccess(StatusCodes.FETCH_GALLERY_PAGE_SUCCESS, data.image))
                        } else {
                            reject(getGalleryImageFailure(StatusCodes.FETCH_GALLERY_PAGE_ERROR_UNKNOWN))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getGalleryImageFailure(StatusCodes.FETCH_GALLERY_PAGE_ERROR_UNKNOWN));
        }
    });
}

export function uploadGalleryImageSuccess(status) {
    return {
        status: status
    };
}

export function uploadGalleryImageFailure(status) {
    return {
        status: status
    };
}

export function uploadGalleryImages(formData) {
    return new Promise(function (resolve, reject) {
        try {
            upload_gallery_images(formData)
                .then(response => {
                    console.log('BOOOOOOOOOOODDDDDDDD', response);
                    response.json().then(data => {
                        if(data.status === StatusCodes.UPLOAD_GALLERY_IMAGES_SUCCESS) {
                            resolve(uploadGalleryImageSuccess(data.status))
                        } else {
                            reject(uploadGalleryImageFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(uploadGalleryImageFailure(StatusCodes.UPLOAD_GALLERY_IMAGES_ERROR_UNKNOWN));
        }
    });
}