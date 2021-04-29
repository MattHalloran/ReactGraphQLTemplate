import express from 'express';

const router = express.Router();

router.post('/modify_sku', (req, res) => {
    // (sku, operation, sku_data) = getData('sku', 'operation', 'data')
    // if not verify_admin():
    //     return StatusCodes['UNAUTHORIZED']
    // sku_obj = SkuHandler.from_sku(sku)
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

router.post('/modify_plant', (req, res) => {
    // (operation, plant_data) = getData('operation', 'data')
    // if not verify_admin():
    //     return StatusCodes['UNAUTHORIZED']
    // plant_obj = PlantHandler.from_id(plant_data['id'])
    // if plant_obj is None and operation != 'ADD':
    //     return StatusCodes['ERROR_UNKNOWN']
    // operation_to_status = {
    //     'HIDE': SkuStatus.INACTIVE.value,
    //     'UNHIDE': SkuStatus.ACTIVE.value,
    //     'DELETE': SkuStatus.DELETED.value
    // }
    // if operation in operation_to_status:
    //     plant_obj.status = operation_to_status[operation]
    //     db.session.commit()
    //     return StatusCodes['SUCCESS']
    // if operation == 'ADD' or operation == 'UPDATE':
    //     # Create plant if doesn't exist
    //     if plant_obj is None:
    //         plant_obj = PlantHandler.create(plant_data)
    //         db.session.add(plant_obj)
    //     # Set display image
    //     if plant_data['display_image'] is not None:
    //         image = ImageHandler.create_from_scratch(plant_data['display_image']['data'],
    //                                                  'TODO',
    //                                                  Config.PLANT_FOLDER,
    //                                                  ImageUses.DISPLAY)
    //         if image is not None:
    //             PlantHandler.set_display_image(plant_obj, image)
    //             db.session.commit()

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
    // return StatusCodes['ERROR_UNKNOWN']
})

router.post('/availability', (req, res) => {
    // # Check to make sure requestor is an admin TODO
    // (data) = getForm('data')
    // b64 = data[0].split('base64,')[1]
    // decoded = b64decode(b64)
    // toread = io.BytesIO()
    // toread.write(decoded)
    // toread.seek(0)  # resets pointer
    // job = q.enqueue(upload_availability, toread)
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "job_id": job.id
    // }
})

router.post('/orders', (req, res) => {
    // '''Fetch orders that match the provided state'''
    // if not verify_admin():
    //     return StatusCodes['UNAUTHORIZED']
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "orders": [OrderHandler.to_dict(order) for order in OrderHandler.from_status(req.body.status)]
    // }
})

router.post('/customers', (req, res) => {
    // if not verify_admin():
    //     return StatusCodes['UNAUTHORIZED']
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "customers": UserHandler.all_customers()
    // }
})

router.post('/order_status', (req, res) => {
    // ''Sets the order status for an order'''
    // (id, status) = getData('id', 'status')
    // if not verify_admin():
    //     return StatusCodes['UNAUTHORIZED']
    // order_obj = OrderHandler.from_id(id)
    // if order_obj is None:
    //     return StatusCodes['ERROR_UNKNOWN']
    // order_obj.status = status
    // db.session.commit()
    // return {
    //     **StatusCodes['SUCCESS'],
    //     'order': OrderHandler.to_dict(order_obj)
    // }
})

router.post('/modify_user', (req, res) => {
    // admin = verify_admin()
    // if not admin:
    //     return StatusCodes['UNAUTHORIZED']
    // user = UserHandler.from_id(req.body.id)
    // if user is None:
    //     print('USER NOT FOUND')
    //     return StatusCodes['ERROR_UNKNOWN']
    // # Cannot delete yourself
    // if user.id == admin.id:
    //     return StatusCodes['CANNOT_DELETE_YOURSELF']
    // operation_to_status = {
    //     'LOCK': AccountStatus.HARD_LOCK.value,
    //     'UNLOCK': AccountStatus.UNLOCKED.value,
    //     'APPROVE': AccountStatus.UNLOCKED.value,
    //     'DELETE': AccountStatus.DELETED.value
    // }
    // if req.body.operation in operation_to_status:
    //     user.account_status = operation_to_status[req.body.operation]
    //     if req.body.operation == 'DELETE':
    //         for email in user.personal_email:
    //             user.personal_email.remove(email)
    //             db.session.delete(email)
    //         for phone in user.personal_phone:
    //             user.personal_phone.remove(phone)
    //             db.session.delete(phone)
    //     db.session.commit()
    //     return {
    //         **StatusCodes['SUCCESS'],
    //         "customers": UserHandler.all_customers()
    //     }
    // print(f'OPERATION NOT IN OPERATIONS: {req.body.operation}')
    // return StatusCodes['ERROR_UNKNOWN']
})

module.exports = router;