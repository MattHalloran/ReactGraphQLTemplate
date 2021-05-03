import { TABLES } from '../tables';



// Traits are separate from the Plant table to reduce duplication,
// and to ease the process and speed of finding unique values for traits
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Role} (
    id SERIAL PRIMARY KEY,
    title VARCHAR(64) NOT NULL UNIQUE,
    description VARCHAR(2048),
)
`;