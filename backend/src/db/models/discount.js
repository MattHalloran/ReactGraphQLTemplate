import { GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { BusinessType } from './business';
import { SkuType } from './sku';

export const DiscountType = new GraphQLObjectType({
    name: 'Discount',
    description: 'A discount applied to SKUs and/or businesses',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        discount: { type: GraphQLNonNull(GraphQLFloat) },
        title: { type: GraphQLNonNull(GraphQLString) },
        comment: { type: GraphQLString },
        terms: { type: GraphQLString },
        businesses: {
            type: GraphQLList(BusinessType),
            resolve: (discount) => {
                return db().select().from(TABLES.BusinessDiscounts).where('discountId', discount.id);
            }
        },
        skus: {
            type: GraphQLList(SkuType),
            resolve: (discount) => {
                return db().select().from(TABLES.SkuDiscounts).where('discountId', discount.id);
            }
        }
    })
})