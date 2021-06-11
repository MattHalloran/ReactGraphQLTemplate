// Deletes image database rows for images that no longer exist
import { db } from "../src/db/db";
import { TABLES } from "../src/db/tables";
import path from 'path';
import fs from 'fs';
import { IMAGE_SIZE } from "@local/shared";

let filepath = path.join(path.resolve(), `./images`);
console.info(`Checking for images in: ${filepath}`)
const sizes = Object.keys(IMAGE_SIZE);
const image_data = await db(TABLES.Image).select('*');
if (image_data === undefined || image_data.length === 0) console.warn('No image data found')
// Loop through all image rows
for (let i = 0; i < image_data.length; i++) {
    let curr = image_data[i];
    console.info(`Locating images for ${curr.fileName}`)
    // Check for the original file and any resizes
    if (fs.existsSync(`${filepath}/${curr.fileName}${curr.ext}`)) continue;
    let exists = false;
    for (let j = 0; !exists && j < sizes.length; j++) {
        exists = fs.existsSync(`${filepath}/${curr.fileName}-${sizes[j]}${curr.ext}`);
    }
    // If image not found, delete image data
    if (!exists) {
        console.info('Deleting image', curr.fileName)
        await db(TABLES.ImageLabels).where('hash', curr.hash).del();
        await db(TABLES.Image).where('hash', curr.hash).del();
    }
}
process.exit(0)