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
    console.log('got indexes');
    console.log(index)
    // Hide all existing SKUs, so only the SKUs in this file can be set to visible
    await prisma[TABLES.Sku].updateMany({ data: { status: SKU_STATUS.Inactive } })
    console.log('hid skus')
    for (const row of content) {
        console.log('in row')
        console.log(row)
        // Insert or update plant data from row
        const latinName = row[index.latinName];
        console.log(latinName)
        let plant = await prisma[TABLES.Plant].findUnique({ where: { latinName }, select: {
            id: true,
            traits: { select: { id: true, name: true, value: true } }
        } });
        console.log('got matching plant')
        console.log(plant)
        const common_name_missing = !(plant?.traits) || !Array.isArray(plant.traits) || !plant.traits.some(t => t.name === 'commonName')
        if (!plant) {
            console.info(`Creating new plant: ${latinName}`);
            plant = await prisma[TABLES.Plant].create({ data: { latinName } });
        }
        if (common_name_missing) {
            console.log('adding common name')
            await prisma[TABLES.PlantTrait].create({ data: { plantId: plant.id, name: 'commonName', value: row[index.commonName] } });
        }
        console.log('getting sku data')
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
        console.log('got sku data');
        console.log(sku_data);

        try {
            prisma[TABLES.Sku].upsert({
                where: { sku: sku_data.sku },
                update: { ...sku_data },
                create: { ...sku_data }
            })
        } catch(error) { console.error(error) }
    }

    console.info('✅ Availability updated!')
}