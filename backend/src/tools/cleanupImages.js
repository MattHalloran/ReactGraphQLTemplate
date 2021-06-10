import { db } from "../db/db";
import { TABLES } from "../db/tables";
import path from 'path';
import fs from 'fs';
import { IMAGE_SIZE } from "@local/shared";

// Deletes image database rows for images that no longer exist
export async function cleanImageRows() {
    let filepath = path.join(path.resolve(), `./images`);
    const sizes = Object.keys(IMAGE_SIZE);
    const image_data = await db(TABLES.Image).select('*');
    // Loop through all image rows
    for (let i = 0; i < image_data.length; i++) {
        let curr = image_data[i];
        // Check for the original file and any resizes
        if (fs.existsSync(`${filepath}/${curr.fileName}${curr.ext}`)) continue;
        let exists = false;
        for (let j = 0; !exists && j < sizes.length; j++) {
            exists = fs.existsSync(`${filepath}/${curr.fileName}-${sizes[j]}${curr.ext}`);
        }
        // If image not found, delete image data
        if (!exists) {
            await db(TABLES.Image).where('hash', curr.hash).del();
            await db(TABLES.ImageLabels).where('hash', curr.hash).del();
        }
    }
}


// Deletes images not associated with image data in the database
export async function cleanImageFiles() {
    
}