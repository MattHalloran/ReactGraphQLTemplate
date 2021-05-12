import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } from 'graphql';
import { AddressType } from './models/address';
import { db } from '../db';
import { TABLES } from '../tables';

const rootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        address: {
            type: AddressType,
            description: 'An address',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => db.select().from(TABLES.Address).where('id', args.id).first()
        },
        addresses: {
            type: new GraphQLList(AddressType),
            description: 'A list of all business addresses',
            resolve: () => db.select().from(TABLES.Address)
        }
    })
})

const rootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root mutation',
    fields: () => ({
        addAddress: {
            type: AddressType,
            description: 'Add an address',
            args: {
                
            }
        }
    })
})

export const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'hello',
        fields: () => ({
            message: { 
                type: GraphQLString,
                resolve: () => 'Hello world'
             }
        })
    })
})