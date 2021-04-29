import { TABLES } from '../tables';

// -4 | CANCELED_BY_ADMIN | Admin canceled the order at any point before delivery
// -3 | CANCELED_BY_USER |
//       1) User canceled order before approval (i.e. no admin approval needed), OR
//       2) PENDING_CANCEL was approved by admin
// -2 | PENDING_CANCEL | User canceled order after approval (i.e. admin approval needed)
// -1 | REJECTED | Order was pending, but admin denied it
//  0 | DRAFT | Order that hasn't been submitted yet (i.e. cart)
//  1 | PENDING | Order that has been submitted, but not approved by admin yet
//  2 | APPROVED | Order that has been approved by admin
//  3 | SCHEDULED | Order has been scheduled for delivery
//  4 | IN_TRANSIT | Order is currently being delivered
//  5 | DELIVERED | Order has been delivered
const ORDER_STATUS = {
    'CANCELED_BY_ADMIN': -4,
    'CANCELED_BY_USER': -3,
    'PENDING_CANCEL': -2,
    'REJECTED': -1,
    'DRAFT': 0,
    'PENDING': 1,
    'APPROVED': 2,
    'SCHEDULED': 3,
    'IN_TRANSIT': 4,
    'DELIVERED': 5
}

const DEFAULTS = {
    Status: ORDER_STATUS.DRAFT,
    IsDelivery: true
}

export const createTable = `
CREATE TABLE IF NOT EXISTS ${TABLES.Order} (
    id SERIAL PRIMARY KEY,
    status INT DEFAULT ${DEFAULTS.Stats} NOT NULL,
    special_instructions VARCHAR(1000),
    desired_delivery_date BIGINT,
    is_delivery BOOLEAN DEFAULT ${DEFAULTS.IsDelivery} NOT NULL,
    delivery_address_id INT references ${TABLES.Address}(id),
    user_id INT references ${TABLES.User}(id)
)
`;