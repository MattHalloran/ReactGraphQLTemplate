import path from 'path';
import fs from 'fs';
import { ReadStream } from 'node:fs';

// Returns a filename that can be used at the specified path
export async function findFileName(filename: string, filepath: string) {
    // First, replace any invalid characters from the file name
    let { name, ext } = path.parse(filename);
    name = filename.replace(/([^a-z0-9 ]+)/gi, "-").replace(" ", "_");
    // If file name is available, no need to append a number
    if (fs.existsSync(`${filepath}/${name}${ext}`)) return `${name}${ext}`;
    // If file name was not available, start appending a number until one works
    let curr = 0;
    while (curr < 100) {
        if(fs.existsSync(`${filepath}/${name}-${curr}${ext}`)) return `${name}${ext}`;
        curr++;
    }
    // If no valid name found after max tries, return null
    return null;
}

// Saves a file in the specified folder at the backend root directory
// Returns an object containing a success boolean and the file name
// Arguments:
// stream - data stream of file
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in backend directory (ex: 'images')
export async function saveFile(stream: ReadStream, filename: string, folder: string) {
    try {
        let filepath = path.join(__dirname, `../../${folder}`);
        // Find a valid file name to save data to
        let name = findFileName(filename, filepath);
        if (name === null) throw Error('Could not create a valid file name');
        // Download the file
        await stream.pipe(fs.createWriteStream(`${filepath}/${name}`));
        return { 
            success: true, 
            filename: name
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            filename: filename
        }
    }
}

// Deletes the specified file from the specified folder
// Arguments:
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in backend directory (ex: 'images')
export async function deleteFile(filename: string, folder: string) {
    try {
        let filepath = path.join(__dirname, `../../${folder}`);
        let fullname = `${filepath}/${filename}`;
        if (!fs.existsSync(fullname)) return false;
        fs.unlinkSync(fullname);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}