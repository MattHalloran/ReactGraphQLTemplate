import path from 'path';
import fs from 'fs';
import { IMAGE_SIZE, SERVER_URL, IMAGE_EXTENSION } from '@local/shared';
import sizeOf from 'image-size';
import sharp from 'sharp';
import imghash from 'imghash';
import { TABLES } from '../db';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient()

// How many times a file name should be checked before giving up
// ex: if 'billy.png' is taken, tries 'billy-1.png', 'billy-2.png', etc.
const MAX_FILE_NAME_ATTEMPTS = 100;
// Max size of a file buffer (how large of a file are you willing to download?)
const MAX_BUFFER_SIZE = 1000000000;
// Location of assets directory
const ASSET_DIR = `${process.env.PROJECT_DIR}/assets`;

// Replace any invalid characters from a file name
// Args:
// file - exs: 'boop.png', 'images/boop.png'
// defaultFolder - default for file's location (ex: 'images')
// Returns:
// name - name of file, excluding extension and location
// ext - extension of file
// folder - path of file
export function clean(file, defaultFolder) {
    const pathRegex = /([^a-z0-9 \.\-\_\/]+)/gi;
    // First, remove any invalid characters
    const cleanPath = file.replace(pathRegex, '');
    const folder = path.dirname(cleanPath)?.replace('.', '') || defaultFolder?.replace(pathRegex, '')?.replace('.', '');
    if (!cleanPath || cleanPath.length === 0) return { name: null, ext: null, folder: null };
    // If a directory was passed in, instead of a file
    if (!cleanPath.includes('.')) return { name: null, ext: null, folder: folder ?? defaultFolder };
    const { name, ext } = path.parse(path.basename(cleanPath));
    return { name, ext, folder: folder ?? defaultFolder };
}

// From a src string, return the filename stored in the database
// (ex: 'https://thewebsite.com/api/images/boop-xl.png' -> { name: 'boop', ext: '.png')
export function plainImageName(src) {
    // 'https://thewebsite.com/api/images/boop-xl.png' -> 'boop-xl.png'
    let fileName = path.basename(src);
    console.log('IN PLAIN IMAGE NAME', fileName)
    if (!fileName || fileName.length <= 0) return { name: null, ext: null };
    // 'boop-xl.png' -> { name: 'boop-xl', ext: 'png' }
    let { name, ext } = clean(fileName);
    let size;
    // 'boop-xl' -> 'boop'
    for (const [key, value] of Object.keys(IMAGE_SIZE)) {
        if (name.endsWith(`-${key}`)) {
            size = value;
            name = name.slice(0, -(key.length + 1));
            break;
        }
    }
    return { name, ext, size };
}

// Returns a filename that can be used at the specified path
// Args:
// filenname - name of file (ex: 'public/boop.png')
// defaultFolder - default for file's location (ex: 'images')
export async function findFileName(file, defaultFolder) {
    const { name, ext, folder } = clean(file, defaultFolder);
    // If file name is available, no need to append a number
    if (!fs.existsSync(`${ASSET_DIR}/${folder}/${name}${ext}`)) return { name, ext, folder };
    // If file name was not available, start appending a number until one works
    let curr = 0;
    while (curr < MAX_FILE_NAME_ATTEMPTS) {
        let currName = `${name}-${curr}${ext}`;
        if (!fs.existsSync(`${ASSET_DIR}/${folder}/${currName}`)) return { name: `${currName}`, ext: ext, folder: folder };
        curr++;
    }
    // If no valid name found after max tries, return null
    return null;
}

// Convert a file stream into a buffer
function streamToBuffer(stream, numBytes) {
    if (numBytes === null || numBytes === undefined) numBytes = MAX_BUFFER_SIZE;
    return new Promise((resolve, reject) => {
        let _buf = []

        stream.on('data', chunk => {
            _buf.push(chunk);
            if (_buf.length >= numBytes) stream.destroy();
        })
        stream.on('end', () => resolve(Buffer.concat(_buf)))
        stream.on('error', err => reject(err))

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
export async function findImageUrl(filename, size) {
    const { name, ext, folder } = clean(filename, 'images');
    // If size not specified, attempts to return original
    if (size === null || size === undefined) {
        if (fs.existsSync(`${ASSET_DIR}/${folder}/${filename}`)) return `${SERVER_URL}/${folder}/${filename}`;
    }
    // Search sizes by closest match
    let size_array = Object.keys(IMAGE_SIZE).map(key => ({ key, value: IMAGE_SIZE[size] }));
    let size_index = size_array.findIndex(obj => obj.key === size);
    if (size_index < 0) size_index = size_array.length - 1;
    for (let i = size_array.length; i > 0; i--) {
        const curr = `${folder}/${name}-${size_array[(i + size_index) % (size_array.length)].key}${ext}`;
        console.log(curr, (i + size_index) % (size_array.length))
        if (fs.existsSync(`${ASSET_DIR}/${curr}`)) return `${SERVER_URL}/${curr}`;
    }
    if (fs.existsSync(`${ASSET_DIR}/${folder}/${folder}/${name}${ext}`)) return `${SERVER_URL}/${folder}/${folder}/${name}${ext}`;
    return null;
}

// Saves a file in the specified folder at the server root directory
// Returns an object containing a success boolean and the file name
// Arguments:
// stream - data stream of file
// filename - name of file, including extension and folder (ex: 'public/boop.png')
// overwrite - boolean indicating if existing files can be overwritten
// acceptedTypes - a string or array of accepted file types, in mimetype form (ex: 'application/vnd.ms-excel')
export async function saveFile(stream, filename, mimetype, overwrite, acceptedTypes) {
    try {
        const { name, ext, folder } = await (overwrite ? clean(filename, 'public') : findFileName(filename));
        if (name === null) throw Error('Could not create a valid file name');
        if (acceptedTypes) {
            if (Array.isArray(acceptedTypes) && !acceptedTypes.some(type => mimetype.startsWith(type) || ext === type)) {
                throw Error('File type not accepted');
            }
            if (typeof acceptedTypes === "string" && !(mimetype.startsWith(type) || ext === type)) {
                throw Error('File type not accepted');
            }
        }
        // Download the file
        await stream.pipe(fs.createWriteStream(`${ASSET_DIR}/${folder}/${name}${ext}`));
        return {
            success: true,
            filename: `${folder}/${name}${ext}`
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
// upload - image upload
// alt - alt text for image
// description - image description
// errorOnDuplicate - If image previously updated, throw error
export async function saveImage(upload, alt, description, errorOnDuplicate = false) {
    try {
        // Destructure data. Each file upload is a promise
        const { createReadStream, filename, mimetype } = await upload;
        // Make sure that the file is actually an image
        if (!mimetype.startsWith('image/')) throw Error('Invalid mimetype')
        // Make sure image type is supported
        let { ext: extCheck } = path.parse(filename);
        if (Object.values(IMAGE_EXTENSION).indexOf(extCheck) <= 0) throw Error('Image type not supported')
        // Create a read stream
        const stream = createReadStream();
        const { name, ext, folder } = await findFileName(filename, 'images')
        if (name === null) throw Error('Could not create a valid file name');
        // Determine image dimensions
        const image_buffer = await streamToBuffer(stream);
        const dimensions = sizeOf(image_buffer);
        // Determine image hash
        const hash = await imghash.hash(image_buffer);
        let image;
        // Check if hash already exists (image previously uploaded)
        const previously_uploaded = await prisma[TABLES.Image].findUnique({ where: { hash: hash } });
        if (previously_uploaded) {
            if (errorOnDuplicate) throw Error('File has already been uploaded');
        } else {
            // Download the original image
            await sharp(image_buffer).toFile(`${ASSET_DIR}/${folder}/${name}${ext}-XXL`);
            // Find resize options
            const sizes = resizeOptions(dimensions.width, dimensions.height);
            for (const [key, value] of Object.entries(sizes)) {
                // XXL reserved for original image
                if (key === 'XXL') continue;
                // Use largest dimension for resize
                let sizing_dimension = dimensions.width > dimensions.height ? 'width' : 'height';
                await sharp(image_buffer)
                    .resize({ [sizing_dimension]: value })
                    .toFile(`${ASSET_DIR}/${folder}/${name}-${key}${ext}`);
            }
            image = await prisma[TABLES.Image].create({ data: { 
                hash: hash,
                folder: 'images',
                file: name,
                ext: ext,
                alt: alt,
                description: description,
                width: dimensions.width,
                height: dimensions.height
             } });
        }
        return {
            success: true,
            filename: `${name}${ext}`,
            dimensions: dimensions,
            hash: hash,
            imageId: image.id
        }
    } catch (error) {
        console.log('saveImage ran into an error')
        console.error(error);
        return {
            success: false,
            filename: filename,
            dimensions: { width: 0, height: 0 },
            hash: null
        }
    }
}

// Deletes the specified file from the specified folder
// Arguments:
// filename - name of file, including extension (ex: 'boop.png')
// folder - folder in server directory (ex: 'images')
export async function deleteFile(file) {
    try {
        console.log('IN DELTE FILE', file)
        const { name, ext, folder } = clean(file);
        let fullname = `${ASSET_DIR}/${folder}/${name}${ext}`;
        console.log(name, ext, folder, fullname)
        if (!fs.existsSync(fullname)) {
            console.error(`Could not delete file ${fullname}: not found`);
            return false;
        }
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
export async function deleteImage(file) {
    console.log('IN DELETE IMAGE', file)
    const { name, ext, folder: fileFolder } = plainImageName(file);
    const folder = fileFolder || 'images';
    console.log(name, ext, folder);
    let files = [`${folder}/${name}${ext}`];
    Object.keys(IMAGE_SIZE).forEach(key => files.push(`${folder}/${name}-${key}${ext}`));
    let success = true;
    for (let i = 0; i < files.length; i++) {
        if (!await deleteFile(files[i])) success = false;
    }
    return success;
}

// Reads a list of files
export async function readFiles(files) {
    let data = [];
    for (const file of files) {
        const { name, ext, folder } = clean(file, 'public');
        const path = `${process.env.PROJECT_DIR}/assets/${folder}/${name}${ext}`;
        if (fs.existsSync(path)) {
            data.push(fs.readFileSync(path, 'utf8'));
        } else {
            console.log('DOES NOT EXIST')
            console.log(path)
            data.push(null);
        }
    }
    return data;
}

// Writes a list of files
export async function saveFiles(files, overwrite = true, acceptedTypes) {
    let data = [];
    for (const file of files) {
        const { createReadStream, filename, mimetype } = await file;
        const stream = createReadStream();
        const { success, filename: finalFilename } = await saveFile(stream, filename, mimetype, overwrite, acceptedTypes);
        data.push(success ? finalFilename : null);
    }
    return data;
}