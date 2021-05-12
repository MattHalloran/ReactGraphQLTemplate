import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { SkuStatusType } from '../enums/skuStatus';
import { TABLES } from '../tables';
import { DiscountType } from './discount';
import { PlantType } from './plant';

export const SkuType = new GraphQLObjectType({
    name: 'SKU',
    description: 'An item that can be ordered',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        sku: { type: GraphQLGraphQLNonNull(GraphQLString) },
        isDiscountable: { type: GraphQLNonNull(GraphQLBoolean) },
        size: { type: GraphQLGraphQLNonNull(GraphQLString) },
        note: { type: GraphQLString },
        availability: { type: GraphQLNonNull(GraphQLInt) },
        price: { type: GraphQLNonNull(GraphQLString) },
        status: { type: GraphQLNonNull(SkuStatusType) },
        plantId: { type: GraphQLNonNull(GraphQLString) },
        plant: {
            type: PlantType,
            resolve: (sku) => {
                return db().select().from(TABLES.Plant).where('id', sku.plantId).first();
            }
        },
        discounts: {
            type: GraphQLList(DiscountType),
            resolve: (sku) => {
                return db().select().from(TABLES.SkuDiscounts).where('skuId', sku.id);
            }
        }
    })
})