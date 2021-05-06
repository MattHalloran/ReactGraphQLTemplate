import express from 'express';
import CODES from '../public/codes.json';
import { uploadAvailability } from '../worker/uploadAvailability/queue';
import * as auth from '../auth';
import { ACCOUNT_STATUS, SKU_STATUS, TYPES } from '../db/types';
import { Order, User, Plant, Sku, Email, Phone } from '../db/models';

const router = express.Router();

router.post('/modify_sku', auth.requireAdmin, (req, res) => {
    // (sku, operation, sku_data) = getData('sku', 'operation', 'data')
    const sku = await Sku.query().where('sku', req.body.sku);
    // if sku_obj is None:
    //     return StatusCodes['ERROR_UNKNOWN']
    // operation_to_status = {
    //     'HIDE': SkuStatus.INACTIVE.value,
    //     'UNHIDE': SkuStatus.ACTIVE.value,
    //     'DELETE': SkuStatus.DELETED.value
    // }
    // if operation in operation_to_status:
    //     sku_obj.status = operation_to_status[operation]
    //     db.session.commit()
    //     return StatusCodes['SUCCESS']
    // if operation == 'ADD':
    //     plant = PlantHandler.create(sku_data['plant'])
    //     db.session.add(plant)
    //     sku = SkuHandler.create(sku_obj)
    //     db.session.add(sku)
    //     db.session.commit()
    // if operation == 'UPDATE':
    //     SkuHandler.update(sku_obj, sku_data)
    //     PlantHandler.update(sku_obj.plant, sku_data['plant'])
    //     db.session.commit()
    //     return StatusCodes['SUCCESS']
    // return StatusCodes['ERROR_UNKNOWN']
})

router.post('/modify_plant', auth.requireAdmin, (req, res) => {
    // (operation, plant_data) = getData('operation', 'data')
    const operation = req.body.operation;
    let plant = await Plant.query().findById(req.body.plant.id);
    if (plant === null && operation !== 'ADD') return res.sendStatus(CODES.ERROR_UNKNOWN);
    // These are operations which only change the SKU's status
    const OPERATION_TO_STATUS = {
        'HIDE': SKU_STATUS.Inactive,
        'UNHIDE': SKU_STATUS.Active,
        'DELETE': SKU_STATUS.Deleted
    }
    if (Object.keys(OPERATION_TO_STATUS).includes(operation)) {
        plant.patch({[TYPES.SkuStatus]: OPERATION_TO_STATUS[operation]});
        return res.sendStatus(CODES.SUCCESS);
    } 
    if (operation === 'ADD') {
        plant = await Plant.query().insert(req.body.plant);
    } else if (operation === 'UPDATE') {
        plant = await Plant.query().patch(req.body.plant);
            //     # Update plant fields
    //     def update_trait(option: PlantTraitOptions, value: str):
    //         if isinstance(value, list):
    //             return [update_trait(option, v) for v in value]
    //         if value is None:
    //             return None
    //         if (trait := PlantTraitHandler.from_values(option, value)):
    //             return trait
    //         new_trait = PlantTraitHandler.create(option, value)
    //         db.session.add(new_trait)
    //         return new_trait
    //     print(f"TODOOOOOOOO {plant_data}")
    //     if (latin := plant_data.get('latin_name', None)):
    //         plant_obj.latin_name = latin
    //     if (common := plant_data.get('common_name', None)):
    //         plant_obj.common_name = common
    //     plant_obj.drought_tolerance = update_trait(PlantTraitOptions.DROUGHT_TOLERANCE, plant_data['drought_tolerance'])
    //     plant_obj.grown_height = update_trait(PlantTraitOptions.GROWN_HEIGHT, plant_data['grown_height'])
    //     plant_obj.grown_spread = update_trait(PlantTraitOptions.GROWN_SPREAD, plant_data['grown_spread'])
    //     plant_obj.growth_rate = update_trait(PlantTraitOptions.GROWTH_RATE, plant_data['growth_rate'])
    //     plant_obj.optimal_light = update_trait(PlantTraitOptions.OPTIMAL_LIGHT, plant_data['optimal_light'])
    //     plant_obj.salt_tolerance = update_trait(PlantTraitOptions.SALT_TOLERANCE, plant_data['salt_tolerance'])
    }
    else {
        return res.sendStatus(CODES.ERROR_UNKNOWN);
    }
    // Handle finding/creating the display image
    if (req.body.plant.display_image) {
        //         image = ImageHandler.create_from_scratch(plant_data['display_image']['data'],
        //                                                  'TODO',
        //                                                  Config.PLANT_FOLDER,
        //                                                  ImageUses.DISPLAY)
        //         if image is not None:
        //             PlantHandler.set_display_image(plant_obj, image)
        //             db.session.commit()
    }
    //     # Hide existing SKUs (if they are still active, this will be updated later)
    //     for sku in plant_obj.skus:
    //         sku.status = SkuStatus.INACTIVE.value
    //     sku_data = plant_data.get('skus', None)
    //     if sku_data:
    //         for data in sku_data:
    //             id = data.get('id', None)
    //             # If id was in data, then this is not a new SKU
    //             if id:
    //                 sku = SkuHandler.from_id(id)
    //                 sku.status = SkuStatus.ACTIVE.value
    //             else:
    //                 sku = SkuHandler.create()
    //             SkuHandler.update(sku, data)
    //             db.session.add(sku)
    //             plant_obj.skus.append(sku)
    //     db.session.commit()
    //     return StatusCodes['SUCCESS']
})

router.post('/availability', auth.requireAdmin, (req, res) => {
    // (data) = getForm('data')
    // b64 = data[0].split('base64,')[1]
    // decoded = b64decode(b64)
    // toread = io.BytesIO()
    // toread.write(decoded)
    // toread.seek(0)  # resets pointer
    // await uploadAvailability(toread)
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "job_id": job.id
    // }
})

router.get('/orders', auth.requireAdmin, (req, res) => {
    const orders = await Order.query().withGraphFetched('address, user, items.[sku.[plant, discounts]]').where(TYPES.OrderStatus, req.body.status);
    res.json(orders);
})

router.get('/customers', auth.requireAdmin, (req, res) => {
    //TODO don't show admins?
    const customers = await User.query();
    res.json(customers);
})

router.post('/order_status', auth.requireAdmin, (req, res) => {
    const order = await Order.query().patchAndFetchById(req.body.id, {
        [TYPES.OrderStatus]: req.body.status
    });
    res.json(order);
})

router.post('/modify_user', auth.requireAdmin, (req, res) => {
    if (req.token.user_id === req.body.id) return res.sendStatus(CODES.CANNOT_DELETE_YOURSELF);
    const operation = req.body.operation;
    let user = await User.query().findById(req.body.id);
    const OPERATION_TO_STATUS = {
        'LOCK': ACCOUNT_STATUS.HardLock,
        'UNLOCK': ACCOUNT_STATUS.Unlocked,
        'APPROVE': ACCOUNT_STATUS.Unlocked,
        'DELETE': ACCOUNT_STATUS.Deleted
    }
    if (Object.keys(OPERATION_TO_STATUS).includes(operation)) {
        user.patch({[TYPES.AccountStatus]: OPERATION_TO_STATUS[operation]});
        if (operation === 'DELETE') {
            // Make sure emails and phones get deleted
            await Email.query().where('userId', user.id).del();
            await Phone.query().where('userId', user.id).del();
            user.del();
        }
        //TODO don't show admin?
        const customers = await User.query();
        res.json(customers);
        return res.sendStatus(CODES.SUCCESS);
    }
    return res.sendStatus(CODES.ERROR_UNKNOWN);
})

module.exports = router;