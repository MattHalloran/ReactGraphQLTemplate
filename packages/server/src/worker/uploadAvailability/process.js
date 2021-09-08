import { TABLES } from "../../db";
import { SKU_STATUS } from "@local/shared";
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient()

// Reads an .xls availability file into the database.
// SKUs of plants not in the availability file will be hidden
export async function uploadAvailabilityProcess(job) {
    console.info('📊 Updating availability...')
    console.info('SKUs not in the availability data will be hidden');

    const rows = job.data.rows;
    const header = rows[0];
    const content = rows.slice(1, rows.length);
    // Determine which columns data is in
    const index = {
        latinName: header.indexOf('Botanical Name'),
        commonName: header.indexOf('Common Name'),
        size: header.indexOf('Size'),
        note: header.indexOf('Notes'),
        price: header.indexOf('Price 10+'),
        sku: header.indexOf('Plant Code'),
        availability: header.indexOf('Quantity')
    }
    // Hide all existing SKUs, so only the SKUs in this file can be set to visible
    await prisma[TABLES.Sku].updateMany({ data: { status: SKU_STATUS.Inactive } })
    for (const row of content) {
        // Insert or update plant data from row
        const latinName = row[index.latinName];
        let plant = await prisma[TABLES.Plant].findUnique({ where: { latinName }, select: {
            id: true,
            traits: { select: { id: true, name: true, value: true } }
        } });
        if (!plant) {
            console.info(`Creating new plant: ${latinName}`);
            plant = await prisma[TABLES.Plant].create({ data: { latinName } });
        }
        // If traits don't exist, replace with empty array
        if (!Array.isArray(plant.traits)) plant.traits = [];
        // Upsert traits
        for (const key of ['latinName', 'commonName']) {
            if (row[index[key]]) {
                try {
                    const updateData = { plantId: plant.id, name: key, value: row[index[key]] };
                    await prisma[TABLES.PlantTrait].upsert({
                        where: { plant_trait_plantid_name_unique: { plantId: plant.id, name: key }},
                        update: updateData,
                        create: updateData
                    })
                } catch(error) { console.error(error)}
            }
        }
        // Insert or update SKU data from row
        const sku_data = {
            sku: row[index.sku] ?? '',
            size: parseFloat((row[index.size]+'').replace(/\D/g, '')) || null, //'#3.5' -> 3.5
            price: parseFloat((row[index.price]+'').replace(/[^\d.-]/g, '')) || null, //'$23.32' -> 23.32
            note: row[index.note],
            availability: parseInt(row[index.availability]) || 0,
            plantId: plant.id,
            status: SKU_STATUS.Active
        }
        if (!sku_data.sku) {
            console.error('⛔️ Cannot update rows without a SKU');
            continue;
        }
        try {
            await prisma[TABLES.Sku].upsert({
                where: { sku: sku_data.sku },
                update: sku_data,
                create: sku_data
            })
        } catch(error) { console.error(error) }
    }

    console.info('✅ Availability updated!')
}