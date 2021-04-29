import { TABLES } from '../tables';

const DEFAULTS = {
    Subscribed: true
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Business} (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subscribed_to_newsletters BOOLEAN DEFAULT ${DEFAULTS.Subscribed} NOT NULL
)
`;