import { Plant, Sku } from "../../db/models";
import { SKU_STATUS } from "../../src/db/types";

// Reads an .xls availability file into the database.
// SKUs of plants not in the availability file will be hidden
export async function uploadAvailabilityProcess() {
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
    await Sku.query().patch({ status: SKU_STATUS.Inactive });
    content.forEach(row => {
        // Insert or update plant based on row data
        const plant_data = {
            latinName: row[index.latin],
            commonName: row[index.common],
        }
        const matching_plants = await Plant.query().where('latinName', row[index.latin]).select('id');
        const plant = null;
        if (matching_plants.length > 0) {
            plant = matching_plants[0].patchAndFetch(plant_data);
        } else {
            plant = Plant.query().insertAndFetch(plant_data);
        }
        // Insert or update SKU based on row data
        const sku_data = {
            sku: row[index.sku] ?? '',
            size: row[index.size] ? parseInt(row[index.size].replace(/\D/g, '')) : 'N/A', //'#3' -> 3
            price: row[index.price] ? parseFloat(row[index.price].replace(/[^\d.-]/g, '')) : 'N/A', //'$23.32' -> 23.32
            note: row[index.note],
            quantity: row[index.quantity] ?? 'N/A',
            plantId: plant.id,
            status: SKU_STATUS.Active
        }
        const matching_skus = await Sku.query().where('sku', row[index.sku]).select('id');
        const sku = null;
        if (matching_skus.length > 0) {
            sku = matching_skus[0].patchAndFetch(sku_data);
        } else {
            sku = Sku.query().insertAndFetch(sku_data);
        }
    })
}