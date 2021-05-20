import { gql } from 'apollo-server-express';

export const typeDef = gql`
    type Business {
        id: ID!
        name: String!
        subscribedToNewsletters: Boolean!
        addresses: [Address!]!
        phones: [Phone!]!
        emails: [Email!]!
        employees: [User!]!
        discounts: [Discount!]!
    }

    extend type Query {
        businesses(ids: [ID!]): [Business!]!
    }

    extend type Mutation {
        addBusiness(
            name: String!
            subscribedToNewsletters: Boolean
        ): Business!
        updateBusiness(
            name: String
            subscribedToNewsletters: Boolean
        ): Business!
        deleteBusiness(
            id: ID!
        ): Response
        setBusinessDiscounts(
            ids: [ID!]!
        ): Response
        setBusinessEmployees(
            ids: [ID!]!
        ): Response
    }
`

const hydrate = (object) => ({
    ...object,
    // business: {

    // },
    // orders: {
        
    // }
})

export const resolvers = {
    Query: {
        businesses: async (_, args, context, info) => {
            if (!context.req.isAdmin) return context.res.sendStatus(CODE.Unauthorized);
            
            const qb = args.ids ? 
                    db(TABLES.Business).select().whereIn('id', args.ids) :
                    db(TABLES.Business).select();

            // if (pathExists(info.fieldNodes, [TABLES.Business, 'addresses'])) {
            //     qb.leftJoin(TABLES.Address, `${TABLES.Address}.id`, `${TABLES.Business}.id`);
            // }
            // if (pathExists(info.fieldNodes, [TABLES.Address, 'orders'])) {
            //     qb.leftJoin(TABLES.Order, `${TABLES.Order}.id`, `${TABLES.Address}.id`);
            // }

            const results = await qb;
            return results.map(r => hydrate(r));
        }
    }
}