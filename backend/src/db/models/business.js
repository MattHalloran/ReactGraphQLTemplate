import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { DiscountType } from './discount';
import { EmailType } from './email';
import { PhoneType } from './phone';
import { UserType } from './user';

export const BusinessType = new GraphQLObjectType({
    name: 'Business',
    description: 'A business that created an account with us',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLNonNull(GraphQLString) },
        subscribedToNewsletters: { type: GraphQLBoolean },
        addresses: {
            type: GraphQLList(AddressType),
            resolve: (business) => {
                return db().select().from(TABLES.Address).where('businessId', business.id);
            }
        },
        phones: {
            type: GraphQLList(PhoneType),
            resolve: (business) => {
                return db().select().from(TABLES.Phone).where('businessId', business.id);
            }
        },
        emails: {
            type: GraphQLList(EmailType),
            resolve: (business) => {
                return db().select().from(TABLES.Email).where('businessId', business.id);
            }
        },
        employees: {
            type: GraphQLList(UserType),
            resolve: (business) => {
                return db().select().from(TABLES.User).where('businessId', business.id);
            }
        },
        discounts: {
            type: GraphQLList(DiscountType),
            resolve: (business) => {
                return db().select().from(TABLES.BusinessDiscounts).where('businessId', business.id);
            }
        }
    })
})