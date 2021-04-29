import { TYPES } from './types';

export const IMAGE_EXTENSION = {
    Bmp: 'bmp',
    Gif: 'gif',
    Png: 'png',
    Jpg: 'jpg',
    Jpeg: 'jpeg',
    Ico: 'ico'
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.ImageExtension} as ENUM (
    ${Object.values(IMAGE_EXTENSION).join(', ')}
)
`;