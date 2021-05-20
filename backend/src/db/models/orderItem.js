import { gql } from 'apollo-server-express';

export const typeDef = gql`
    type OrderItem {
        id: ID!
        quantity: Int!
        order: Order!
        sku: Sku!
    }

    extend type Mutation {
        addOrderItem(
            quantity: Int!
            orderId: ID!
            skuId: ID!
        ): OrderItem
        updateOrderItem(
            id: ID!
            quantity: Int
        ): OrderItem
        deleteOrderItem(
            id: ID!
        ): Response
    }
`

export const resolvers = {
    
}