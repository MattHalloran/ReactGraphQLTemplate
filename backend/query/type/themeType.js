import { TYPES } from './types';

export const THEME = {
    Light: 'light',
    Dark: 'dark'
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.TaskStatus} as ENUM (
    ${Object.values(IMAGE_EXTENSION).join(', ')}
)
`;