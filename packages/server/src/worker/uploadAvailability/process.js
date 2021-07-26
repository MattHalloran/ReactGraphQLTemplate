import { db } from "../../db/db";
import { TABLES } from "../../db/tables";
import { SKU_STATUS } from "@local/shared";

// Reads an .xls availability file into the database.
// SKUs of plants not in the availability file will be hidden
export async function uploadAvailabilityProcess() {
    console.log('IN UPLOAD AVAILABILITY PROCESS')
    const rows = job.data.rows;
    const header = rows[0];
    const content = rows.slice(1, rows.length);
    // Determine which columns data is in
    const index = {
        latin: header.indexOf('Botanical Name'),
        common: header.indexOf('Common Name'),
        size: header.indexOf('Size'),
        note: header.indexOf('Notes'),
        price: header.indexOf('Price 10+'),
        sku: header.indexOf('Plant Code'),
        quantity: header.indexOf('Quantity')
    }
    // Hide all existing SKUs, so only the SKUs in this file can be set to visible
    await db(TABLES.Sku).update({ status: SKU_STATUS.Inactive });
    for (row in content) {
        // Insert or update plant data from row
        const plant_data = {
            latinName: row[index.latin],
            traits: [{
                name: "common name",
                value: row[index.common]
            }]
        }
        const matching_plant_ids = await db(TABLES.Plant).where('latinName', row[index.latin]).select('id');
        let plant_id;
        if (matching_plant_ids.length > 0) {
            plant_id = matching_plant_ids[0];
            await db(TABLES.PlantTrait).where({ plantId, plant_id, name: plant_data.traits[0].name }).update({ ...plant_data.traits[0].name });
        } else {
            plant_id = await db(TABLES.Plant).insert({ latinName: plant_data.latinName }).returning('id');
            await db(TABLES.PlantTrait).insert({ plantId: plant_id, ...plant_data.traits[0] });
        }
        // Insert or update SKU data from row
        const sku_data = {
            sku: row[index.sku] ?? '',
            size: row[index.size] ? parseInt(row[index.size].replace(/\D/g, '')) : 'N/A', //'#3' -> 3
            price: row[index.price] ? parseFloat(row[index.price].replace(/[^\d.-]/g, '')) : 'N/A', //'$23.32' -> 23.32
            note: row[index.note],
            quantity: row[index.quantity] ?? 'N/A',
            plantId: plant_id,
            status: SKU_STATUS.Active
        }
        const matching_sku_ids = await db(TABLES.Sku).where('sku', row[index.sku]).select('id');
        if (matching_sku_ids.length > 0) {
            await db(TABLES.Sku).where({ id: matching_sku_ids[0].id }).update(sku_data);
        } else {
            await db(TABLES.Sku).insert(sku_data);
        }
    }
}