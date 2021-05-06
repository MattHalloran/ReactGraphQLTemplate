import { Model } from 'objection';
import { TABLES } from '../tables';

export default class OrderItem extends Model {
    static tableName = TABLES.OrderItem;

    static get relationMappings() {
        const { Order, Sku } = require('.');
        return {
            order: {
                relation: Model.BelongsToOneRelation,
                modelClass: Order,
                join: {
                    from: `${tableName}.orderId`,
                    to: `${TABLES.Order}.id`
                }
            },
            sku: {
                relation: Model.BelongsToOneRelation,
                modelClass: Sku,
                join: {
                    from: `${tableName}.skuId`,
                    to: `${TABLES.Sku}.id`
                }
            }
        }
    }
}