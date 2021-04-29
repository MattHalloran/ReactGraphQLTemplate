import { TABLES } from '../tables';
import { TYPES } from '../../type/types';

// Possible image sizes stored, and their max size
export const IMAGE_SIZES = {
    XS: 64,
    S: 128,
    M: 256,
    ML: 512,
    L: 1024
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Image} (
    id SERIAL PRIMARY KEY,
    folder VARCHAR(250) NOT NULL,
    file_name VARCHAR(250) NOT NULL,
    extension ${TYPES.ImageExtension} NOT NULL,
    alt VARCHAR(100),
    hash VARCHAR(100) NOT NULL,
    used_for ${TYPES.ImageUse} NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    plant_id INT references ${TABLES.Plant}(id),
    UNIQUE (hash, used_for),
    UNIQUE (foler, file_name, extension)
)
`;