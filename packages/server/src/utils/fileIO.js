import path from 'path';
import fs from 'fs';
import { IMAGE_SIZE, SERVER_ADDRESS } from '@local/shared';
import sizeOf from 'image-size';
import sharp from 'sharp';
import imghash from 'imghash';
import { db } from '../db/db';
import { TABLES } from '../db/tables';

// How many times a file name should be checked before giving up
// ex: if 'billy.png' is taken, tries 'billy-1.png', 'billy-2.png', etc.
const MAX_FILE_NAME_ATTEMPTS = 100;
// Max size of a file buffer (how large of a file are you willing to download?)
const MAX_BUFFER_SIZE = 1000000000;

// From a src string, return the filename stored in the database
// (ex: 'https://thewebsite.com/api/images/boop-xl.png' -> 'boop')
export function plainImageName(src) {
    // 'https://thewebsite.com/api/images/boop-xl.png' -> 'boop-xl.png'
    let fileName = path.basename(src);
    // 'boop-xl.png' -> { 'boop-xl' }
    // If file passed in without extension, add a fake one so parse doesn't break
    let { name } = path.parse(fileName.includes('.') ? fileName : `${fileName}.txt`);
    // 'boop-xl' -> 'boop'
    const sizeEndings = Object.keys(IMAGE_SIZE).map(s => `-${s}`);
    for (let i = 0; i < sizeEndings.length; i++) {
        if (name.endsWith(sizeEndings[i])) {
            name = name.slice(0, -sizeEndings[i].length);
            break;
        }
    }
    return name;
}

// Returns a filename that can be used at the specified path
export async function findFileName(filename, filepath) {
    console.log('IN findfilename', filename, filepath)
    // First, replace any invalid characters from the file name
    let { name, ext } = path.parse(filename);
    name = name.replace(/([^a-z0-9 ]+)/gi, "-").replace(" ", "_");
    console.log('NAME IS', name, ext)
    console.log(fs.existsSync(`${filepath}/${name}${ext}`))
    // If file name is available, no need to append a number
    if (!fs.existsSync(`${filepath}/${name}${ext}`)) return `${name}${ext}`;
    // If file name was not available, start appending a number until one works
    let curr = 0;
    while (curr < MAX_FILE_NAME_ATTEMPTS) {
        if(!fs.existsSync(`${filepath}/${name}-${curr}${ext}`)) return `${name}${ext}`;
        curr++;
    }
    // If no valid name found after max tries, return null
    return null;
}

// Returns and image filename that can be used at the specified path
export async function findImageName(filename, filepath = 'images') {
    // Replace any invalid characters from the file name
    let { name, ext } = path.parse(filename);
    name = name.replace(/([^a-z0-9 ]+)/gi, "-").replace(" ", "_");
    // Replace any file name endings that would conflict with the sizing schema
    name = plainImageName(name);
    // If file name is available, no need to append a number
    if (!fs.existsSync(`${filepath}/${name}${ext}`)) return `${name}${ext}`;
    // If file name was not available, start appending a number until one works
    let curr = 0;
    while (curr < MAX_FILE_NAME_ATTEMPTS) {
        if(!fs.existsSync(`${filepath}/${name}-${curr}${ext}`)) return `${name}${ext}`;
        curr++;
    }
    // If no valid name found after max tries, return null
    return null;
}

// Convert a file stream into a buffer
function streamToBuffer(stream, numBytes) {
    if (numBytes === null || numBytes === undefined) numBytes = MAX_BUFFER_SIZE;
    return new Promise( (resolve, reject) => {
        let _buf = []
    
        stream.on('data', chunk => { 
            _buf.push(chunk);
            if (_buf.length >= numBytes) stream.destroy();
        })
        stream.on('end', () => resolve(Buffer.concat(_buf)) )
        stream.on('error', err => reject( err ))

    })
} 

// Returns all image sizes smaller or equal to the image size
function resizeOptions(width, height) {
    let sizes = {};
    for (const [key, value] of Object.entries(IMAGE_SIZE)) {
        if (width >= value || height >= value) sizes[key] = value;
    }
    return sizes;
}

// Returns the filepath of the requested image at the closest available size
export async function findImage(filename, size) {
    console.log('IN FIND IMAGE', filename, size)
    const filepath = path.join(path.resolve(), `./images`);
    // If size not specified, attempts to return original
    if (size === null || size === undefined) {
        if(fs.existsSync(`${filepath}/${filename}`)) return `${SERVER_ADDRESS}/images/${filename}`;
    }
    // Search largest to smallest size
    const { name, ext } = path.parse(filename);
    const sizes = resizeOptions(size ?? IMAGE_SIZE.L, size ?? IMAGE_SIZE.L);
    const keys = Object.keys(sizes).reverse();
    for (let i = 0; i < keys.length; i++) {
        let curr = `${name}-${keys[i]}${ext}`;
        if(fs.existsSync(`${filepath}/${curr}`)) return `${SERVER_ADDRESS}/images/${curr}`;
    }
    return null;
}

// Saves a file in the specified folder at the server root directory
// Returns an object containing a success boolean and the file name
// Arguments:
// stream - data stream of file
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in server directory (ex: 'images')
export async function saveFile(stream, filename, folder) {
    try {
        let filepath = path.join(path.resolve(), `./${folder}`);
        // Find a valid file name to save data to
        let name = await findFileName(filename, filepath);
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
            filename: filename ?? ''
        }
    }
}

// Saves an image file and its resizes in the specified folder at the server root directory
// Returns: {
//      success - boolean indicating succes
//      filename - the file name
//      dimensions - width and height of image
//      hash - the image's hash
//}
// Arguments:
// stream - data stream of file
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in server directory (ex: 'images')
export async function saveImage(stream, filename, folder = 'images') {
    try {
        let filepath = path.join(path.resolve(), `./${folder}`);
        // Find a valid file name to save data to
        let validName = await findFileName(filename, filepath);
        if (validName === null) throw Error('Could not create a valid file name');
        // Determine image dimensions
        const image_buffer = await streamToBuffer(stream);
        console.log('IMAGE BUFFER', image_buffer)
        const dims = sizeOf(image_buffer);
        console.log('GOT DIMENSIONS', dims)
        // Determine image hash
        const hash = await imghash.hash(image_buffer);
        console.log('HERE IS HASH', hash)
        // Check if hash already exists (image previously uploaded)
        const previously_uploaded = (await db(TABLES.Image).select('id').where('hash', hash)).length > 0;
        if (previously_uploaded) throw Error('File has already been uploaded')
        // Download the original image
        await sharp(image_buffer).toFile(`${filepath}/${validName}`);
        console.log('STREAMED TO', `${filepath}/${validName}`)
        // Find resize options
        const sizes = resizeOptions(dims.width, dims.height);
        console.log('GOT RESIZE OPTIONS', sizes);
        for (const [key, value] of Object.entries(sizes)) {
            console.log('IN SIZES', key, value)
            // Parse filename to append size before extension
            let { name, ext } = path.parse(validName);
            // Use largest dimension for resize
            let sizing_dimension = dims.width > dims.height ? 'width' : 'height';
            console.log('about to sharp',`${filepath}/${validName}` );
            await sharp(image_buffer)
                .resize({[sizing_dimension]: value})
                .toFile(`${filepath}/${name}-${key}${ext}`);
        }
        console.log('saveImage success!', { 
            success: true, 
            filename: validName,
            dimensions: dims,
            hash: hash
        })
        return { 
            success: true, 
            filename: validName,
            dimensions: dims,
            hash: hash
        }
    } catch (error) {
        console.log('saveImage ran into an error')
        console.error(error);
        return {
            success: false,
            filename: filename,
            dimensions: {width: 0, height: 0},
            hash: null
        }
    }
}

// Deletes the specified file from the specified folder
// Arguments:
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in server directory (ex: 'images')
export async function deleteFile(filename, folder) {
    try {
        let filepath = path.join(path.resolve(), `./${folder}`);
        let fullname = `${filepath}/${filename}`;
        if (!fs.existsSync(fullname)) return false;
        fs.unlinkSync(fullname);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Deletes an image and all resizes
// Arguments:
// filename - name of the full image
// folder - name of the folder
export async function deleteImage(filename, folder = 'images') {
    let files = [filename];
    let { name, ext } = path.parse(filename);
    name = plainImageName(name);
    Object.keys(IMAGE_SIZE).forEach(key => files.push(`${name}-${key}${ext}`));
    let success = true;
    for (let i = 0; i < files.length; i++) {
        if (!await deleteFile(files[i], folder)) success = false;
    }
    return success;
}