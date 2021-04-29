import { TABLES } from '../tables';

const DEFAULTS = {
    Country: 'US'
}

// tag - Optional tag associated with address (ex: 'Main address')
// name - Optional name, sometimes required for internal mail delivery systems
// country - ISO 3166 country code
// administrative_area - State/Province/Region (ISO code when available [ex: NJ])
// sub_administrative_area - County/District (currently unused)
// locality - City/Town
// postal_code - Postal/Zip code
// throughfare - Street Address
// premise - Apartment, Suite, P.O. box number, etc.
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Address} (
    id SERIAL PRIMARY KEY,
    tag VARCHAR(100),
    name VARCHAR(100),
    country VARCHAR(2) DEFAULT '${DEFAULTS.Country}' NOT NULL,
    administrative_area VARCHAR(30) NOT NULL,
    sub_administrative_area VARCHAR(30),
    locality VARCHAR(50) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    throughfare VARCHAR(150) NOT NULL,
    premise VARCHAR(20),
    delivery_instructions VARCHAR(1000),
    business_id INT NOT NULL references ${TABLES.Business}(id)
)
`;