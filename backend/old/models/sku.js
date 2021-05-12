import { Model } from 'objection';
import { TABLES } from '../tables';

export default class Sku extends Model {
    static tableName = TABLES.Sku;

    static get relationMappings() {
        const { Plant, Discount } = require('.');
        return {
            plant: {
                relation: Model.BelongsToOneRelation,
                modelClass: Plant,
                join: {
                    from: `${tableName}.plantId`,
                    to: `${TABLES.Plant}.id`
                }
            },
            discounts: {
                relation: Model.ManyToManyRelation,
                modelClass: Discount,
                join: {
                    from: `${tableName}.id`,
                    through: {
                        from: `${TABLES.SkuDiscounts}.skuId`,
                        to: `${TABLES.SkuDiscounts}.discountId`
                    },
                    to: `${TABLES.Discount}.id`
                }
            }
        }
    }
}