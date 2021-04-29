import { TYPES } from './types';

export const SKU_STATUS = {
    Deleted: 'Deleted',
    Inactive: 'Inactive',
    Active: 'Active',
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.TaskStatus} as ENUM (
    ${Object.values(IMAGE_EXTENSION).join(', ')}
)
`;