import { TABLES } from '../tables';

const DEFAULTS = {
    CountryCode: '1',
    IsMobile: true,
    ReceivesUpdates: false
}

// Numbers should be stored without formatting
export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Plant} (
    id SERIAL PRIMARY KEY,
    latin_name VARCHAR(128) NOT NULL UNIQUE,
    common_name VARCHAR(128) NOT NULL
    plantnet_url VARCHAR(2048),
    yards_url VARCHAR(2048),
    description VARCHAR(4096),
    yersey_native BOOLEAN
    deer_resistance_id INT references ${TABLES.Trait}(id),
    drought_tolerance_id INT references ${TABLES.Trait}(id),
    grown_height_id INT references ${TABLES.Trait}(id),
    grown_spread_id INT references ${TABLES.Trait}(id),
    growth_rate_id INT references ${TABLES.Trait}(id),
    optimal_light_id INT references ${TABLES.Trait}(id),
    salt_tolerance_id INT references ${TABLES.Trait}(id),
    display_img_id INT references ${TABLES.Image}(id),
)
`;