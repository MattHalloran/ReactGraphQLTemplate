import express from 'express';
import CODES from '../public/codes.json';
import * as auth from '../auth';

const router = express.Router();

router.route('/gallery')
    .get((req, res) => {
        // return {
        //     **StatusCodes['SUCCESS'],
        //     'data': [ImageHandler.to_dict(img) for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
        // }
    }).put(auth.requireAdmin, (req, res) => {
        // (data) = getData('data')
        // success = True
        // # Grab all gallery images
        // curr_images = [img.id for img in ImageHandler.from_used_for(ImageUses.GALLERY)]
        // # Remove the images in curr_images that show in the post data (i.e. images that should stay)
        // # Also update the alt and descriptions of each image in the post data
        // for img in data:
        //     curr_images.remove(img['id'])
        //     image_model = ImageHandler.from_id(img['id'])
        //     if image_model and (image_model.alt is not img['alt']):
        //         ImageHandler.update_from_dict(image_model, img)
        // # Images not included in the post data are removed
        // for id in curr_images:
        //     image_model = ImageHandler.from_id(id)
        //     if image_model:
        //         db.session.delete(image_model)
        // db.session.commit()
        // return StatusCodes['SUCCESS'] if success else StatusCodes['ERROR_UNKNOWN']
    }).post(auth.requireAdmin, (req, res) => {
        // (names, extensions, images) = getForm('name', 'extension', 'image')
        // status = StatusCodes['SUCCESS']
        // passed_indexes = []
        // failed_indexes = []
        // # Iterate through images
        // for i in range(len(images)):
        //     img_data = images[i]
        //     image = ImageHandler.create_from_scratch(img_data, 'TODO', Config.GALLERY_FOLDER, ImageUses.GALLERY)
        //     if image is None:
        //         status = StatusCodes['ERROR_UNKNOWN']
        //         failed_indexes.append(i)
        //     else:
        //         passed_indexes.append(i)
        // return {
        //     **status,
        //     "passed_indexes": passed_indexes,
        //     "failed_indexes": failed_indexes,
        // }
    })

router.get('/image', (req, res) => {
    // (key, size) = getQuery('key', 'size')
    // return {
    //     **StatusCodes['SUCCESS'],
    //     'data': ImageHandler.get_b64(key, size)
    // }
})

router.get('/images', (req, res) => {
    // (key_string, size) = getQuery('keys', 'size')
    // keys = key_string.split(',')
    // return {
    //     **StatusCodes['SUCCESS'],
    //     'data': [ImageHandler.get_b64(key, size) for key in keys]
    // }
})

module.exports = router;