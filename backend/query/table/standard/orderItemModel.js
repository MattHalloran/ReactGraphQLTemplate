import { TABLES } from '../tables';

const DEFAULTS = {
    Quantity: 1
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.OrderItem} (
    id SERIAL PRIMARY KEY,
    quantity INT DEFAULT ${DEFAULTS.Quantity} NOT NULL,
    receives_delivery_updates BOOLEAN DEFAULT ${DEFAULTS.ReceivesUpdates} NOT NULL,
    order_id INT references ${TABLES.Order}(id) ON DELETE CASCADE,
    sku_id INT references ${TABLES.Sku}(id) ON DELETE CASCADE
)
`;