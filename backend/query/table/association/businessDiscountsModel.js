import { TABLES } from '../tables';

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.BusinessDiscounts} (
    business_id INT NOT NULL references ${TABLES.Business}(id) ON UPDATE CASCADE,
    discount_id INT NOT NULL references ${TABLES.Discount}(id) ON UPDATE CASCADE,
)
`;

export const insertInitialData = ``;