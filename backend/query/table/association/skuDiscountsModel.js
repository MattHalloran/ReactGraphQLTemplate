import { TABLES } from '../tables';

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.SkuDiscounts} (
    sku_id INT NOT NULL references ${TABLES.Sku}(id) ON UPDATE CASCADE,
    discount_id INT NOT NULL references ${TABLES.Discount}(id) ON UPDATE CASCADE,
)
`;

export const insertInitialData = ``;