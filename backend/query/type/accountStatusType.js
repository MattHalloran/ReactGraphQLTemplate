import { TYPES } from './types';

export const ACCOUNT_STATUS = {
    Deleted: 'Deleted',
    WaitingEmailVerification: 'Waiting email verification',
    Unlocked: 'Unlocked',
    SoftLock: 'Soft Lock',
    HardLock: 'Hard Lock'
}

export const createType = `
CREATE TABLE IF NOT EXISTS ${TYPES.ImageUse} as ENUM (
    ${Object.values(TRAIT_NAME).join(', ')}
)
`;