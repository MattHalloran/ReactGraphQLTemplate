// 1) Delete image files no longer associated with any image rows in the database
// 2) Delete image rows in the database no longer associated with any image files
import { db } from "../src/db/db";
import { TABLES } from "../src/db/tables";
import fs from 'fs';
import { deleteFile, plainImageName } from "../src/utils";
import path from 'path';
import { IMAGE_SIZE } from "@local/shared";

const FOLDER = 'images';
const PATH = `${process.env.PROJECT_DIR}/assets/${FOLDER}`
console.info(`Cleaning image data in: ${PATH}`);

// 1) Delete image files no longer associated with any image rows in the database
const rows = (await db(TABLES.Image).select('*').where('folder', FOLDER)).map(d => {
    return {
        file: `${d.fileName}${d.extension}`,
        hash: d.hash
    }
});
if (rows === undefined || rows.length === 0) console.warn('No image data found in database')


if (!fs.existsSync(PATH)){
    fs.mkdirSync(PATH);
}
// Grab all files in path
const files = fs.readdirSync(PATH);
for (const file of files) {
    let { name, ext } = plainImageName(file);
    if (!rows.some(r => r.file === `${name}${ext}`)) {
        console.info(`Deleting ${file}`);
        deleteFile(`${FOLDER}/file`);
    }
}

// 2) Delete image rows in the database no longer associated with any image files
const sizes = Object.keys(IMAGE_SIZE);
for (const row of rows) {
    console.info(`Locating images for ${row.file}`);
    // Check for the original file and any resizes
    if (fs.existsSync(`${PATH}/${row.file}`)) continue;
    let { name, ext } = path.parse(row.file);
    if (!sizes.some(s => fs.existsSync(`${PATH}/${name}-${s}${ext}`))) {
        console.info(`Deleting image data for ${row.file}`);
        await db(TABLES.ImageLabels).where('hash', row.hash).del();
        await db(TABLES.Image).where('hash', row.hash).del();
    }
}

console.info('exiting...')
process.exit(0)