// Deletes images no longer associated with image data in the database
import { db } from "../src/db/db";
import { TABLES } from "../src/db/tables";
import path from 'path';
import fs from 'fs';
import { deleteFile, plainImageName } from "../src/utils";

let filepath = path.join(path.resolve(), `./images`);
console.info(`Checking for images in: ${filepath}`)
const keep_files = (await db(TABLES.Image).select('fileName')).map(d => d.fileName);

// Grab all files in path
fs.readdir(filepath, (err, files) => {
    if (err) {
        console.error('Error occurred reading directory');
        console.error(err);
        process.exit(1);
    }

    const delete_files = files.filter(f => !keep_files.includes(plainImageName(f)));
    console.info(`Found ${delete_files.length} files to delete`);
    delete_files.forEach(f => {
        console.info(`Deleting images/${f}`);
        deleteFile(f, 'images');
    });

    console.info('exiting...')
    process.exit(0)
});