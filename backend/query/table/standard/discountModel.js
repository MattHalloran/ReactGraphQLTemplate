import { TABLES } from '../tables';

const DEFAULTS = {
    Discount: 0
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Discount} (
    id SERIAL PRIMARY KEY,
    discount NUMERIC(4,4) DEFAULT ${DEFAULTS.Discount} NOT NULL,
    title VARCHAR(100) NOT NULL,
    comment VARCHAR(1000),
    terms VARCHAR(5000) 
)
`;