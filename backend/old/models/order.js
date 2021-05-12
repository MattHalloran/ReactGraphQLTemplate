import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Order extends Model {
    static tableName = TABLES.Order;

    static get relationMappings() {
        const { Address, OrderItem, User } = require('.');
        return {
            address: {
                relation: Model.BelongsToOneRelation,
                modelClass: Address,
                join: {
                    from: `${tableName}.addressId`,
                    to: `${TABLES.Address}.id`
                }
            },
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: `${tableName}.userId`,
                    to: `${TABLES.User}.id`
                }
            },
            items: {
                relation: Model.HasManyRelation,
                modelClass: OrderItem,
                join: {
                    from: `${tableName}.id`,
                    to: `${TABLES.OrderItem}.orderId`
                }
            }
        }
    }
}