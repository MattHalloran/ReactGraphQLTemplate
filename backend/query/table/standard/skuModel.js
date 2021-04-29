import { TABLES } from '../tables';
import { TYPES } from '../../type/types';
import { SKU_STATUS } from '../../type/skuStatusType';

const DEFAULTS = {
    IsDiscountable: true,
    Availability: 0,
    Size: 'N/A',
    Price: 'N/A',
    Status: SKU_STATUS.Active
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Sku} (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(32) NOT NULL,
    date_added BIGINT DEFAULT extract(epoch from now() at time zone 'utc' at time zone 'utc') NOT NULL,
    is_discountable BOOLEAN DEFAULT ${DEFAULTS.IsDiscountable} NOT NULL,
    size VARCHAR(32) DEFAULT '${DEFAULTS.Size}' NOT NULL,
    note VARCHAR(2048),
    availabilty INT DEFAULT ${DEFAULTS.Availability} NOT NULL,
    price VARCHAR(16) DEFAULT '${DEFAULTS.Price}' NOT NULL,
    status ${TYPES.SkuStatus} DEFAULT '${DEFAULTS.Status}' NOT NULL,
    plant_id INT references ${TABLES.Plant}(id)
)
`;