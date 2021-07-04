import express from 'express';
import { CODE } from '@local/shared';
import * as auth from '../auth';

const router = express.Router();

router.get('/inventory_filters', (req, res) => {
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "size": SkuHandler.uniques(Sku.size),
    //     "optimal_light": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.OPTIMAL_LIGHT),
    //     "drought_tolerance": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.DROUGHT_TOLERANCE),
    //     "grown_height": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWN_HEIGHT),
    //     "grown_spread": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWN_SPREAD),
    //     "growth_rate": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.GROWTH_RATE),
    //     "salt_tolerance": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SALT_TOLERANCE),
    //     "light_ranges": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.LIGHT_RANGE),
    //     "attracts_pollinators_and_wildlifes": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.ATTRACTS),
    //     "soil_moistures": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_MOISTURE),
    //     "soil_phs": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_PH),
    //     "soil_types": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.SOIL_TYPE),
    //     "zones": PlantTraitHandler.uniques_by_trait(PlantTraitOptions.ZONE)
    // }
})

router.get('/inventory', (req, res) => {
    // (sorter, page_size, admin) = getData('sorter', 'page_size', 'admin')
    // # Grab plant ids
    // all_plant_ids = PlantHandler.all_ids()
    // # Find all plants that have available SKUs associated with them
    // plants_with_skus = []
    // for id in all_plant_ids:
    //     if PlantHandler.has_available_sku(id):
    //         plants_with_skus.append(PlantHandler.from_id(id))
    // if len(plants_with_skus) == 0:
    //     return StatusCodes['NO_RESULTS']
    // # Define map for handling sort options
    // sort_map = {
    //     'az': (lambda p: p.latin_name, False),
    //     'za': (lambda p: p.latin_name, True),
    //     'lth': (lambda p: (PlantHandler.cheapest(p), p.latin_name), False),
    //     'htl': (lambda p: (PlantHandler.priciest(p), p.latin_name), True),
    //     'new': (lambda p: (PlantHandler.newest(p), p.latin_name), True),
    //     'old': (lambda p: (PlantHandler.oldest(p), p.latin_name), True),
    // }
    // # Sort the plants
    // sort_data = sort_map.get(sorter, None)
    // if sort_data is None:
    //     print('Could not find the correct sorter')
    //     return StatusCodes['INVALID_ARGS']
    // plants_with_skus.sort(key=sort_data[0], reverse=sort_data[1])
    // if page_size > 0:
    //     page = plants_with_skus[0: min(len(plants_with_skus), page_size)]
    // else:
    //     page = plants_with_skus
    // page_results = PlantHandler.all_dicts(page)
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "plant_ids": PlantHandler.all_ids(),
    //     "page_results": page_results
    // }
})

router.get('/unused_plants', auth.requireAdmin, (req, res) => {
    // (sorter) = getData('sorter')
    // # Grab plant ids
    // all_plant_ids = PlantHandler.all_ids()
    // # Find all plants that do not have associated SKUs
    // lone_plants = []
    // for id in all_plant_ids:
    //     # Admins can view plants that are hidden to customers
    //     if not PlantHandler.has_available_sku(id):
    //         lone_plants.append(PlantHandler.from_id(id))
    // if len(lone_plants) == 0:
    //     return StatusCodes['NO_RESULTS']
    // sort_map = {
    //     'az': (lambda p: p.latin_name, False),
    //     'za': (lambda p: p.latin_name, True)
    // }
    // # Sort the plants
    // sort_data = sort_map.get(sorter, None)
    // if sort_data is None:
    //     print('Could not find the correct sorter')
    //     return StatusCodes['INVALID_ARGS']
    // lone_plants.sort(key=sort_data[0], reverse=sort_data[1])
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "plants": PlantHandler.all_dicts(lone_plants)
    // }
})

router.get('/inventory_page', (req, res) => {
    // return {
    //     **StatusCodes['SUCCESS'],
    //     "data": PlantHandler.all_dicts(req.body.ids)
    // }
})

module.exports = router;