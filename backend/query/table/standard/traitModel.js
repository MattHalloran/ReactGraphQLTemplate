import { TABLES } from '../tables';
import { TYPES } from '../../type/types';

// Traits are separate from the Plant table to reduce duplication,
// and to ease the process and speed of finding unique values for traits
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Trait} (
    id SERIAL PRIMARY KEY,
    trait ${TYPES.TraitName} NOT NULL,
    value VARCHAR(512) NOT NULL,
    UNIQUE (trait, value)
)
`;