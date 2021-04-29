import { TABLES } from '../tables';

const DEFAULTS = {
    ReceivesUpdates: true
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Email} (
    id SERIAL PRIMARY KEY,
    email_address VARCHAR(100) NOT NULL UNIQUE,
    receives_delivery_updates BOOLEAN DEFAULT ${DEFAULTS.ReceivesUpdates} NOT NULL,
    user_id INT references ${TABLES.User}(id),
    business_id INT references ${TABLES.Business}(id),
    CONSTRAINT chk_keys check (user_id is not null or business_id is not null)
)
`;