import { TABLES } from '../tables';

const DEFAULTS = {
    CountryCode: '1',
    IsMobile: true,
    ReceivesUpdates: false
}

// Numbers should be stored without formatting
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Phone} (
    id SERIAL PRIMARY KEY,
    number VARCHAR(10) NOT NULL,
    country_code VARCHAR(5) DEFAULT ${DEFAULTS.CountryCode} NOT NULL,
    extension VARCHAR(10)
    receives_delivery_updates BOOLEAN DEFAULT ${DEFAULTS.ReceivesUpdates} NOT NULL,
    user_id INT references ${TABLES.User}(id),
    business_id INT references ${TABLES.Business}(id),
    CONSTRAINT chk_keys check (user_id is not null or business_id is not null),
    UNIQUE (number, country_code, extension)
)
`;