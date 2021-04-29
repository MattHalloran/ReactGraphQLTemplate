import { TYPES } from './types';

export const TASK_STATUS = {
    Unknown: 'Unknown',
    Failed: 'Failed',
    Active: 'Active',
    Completed: 'Completed',
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.TaskStatus} as ENUM (
    ${Object.values(IMAGE_EXTENSION).join(', ')}
)
`;