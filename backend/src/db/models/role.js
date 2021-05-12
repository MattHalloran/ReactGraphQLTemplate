import { GraphQLObjectType, GraphQLString, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { UserType } from './user';

export const RoleType = new GraphQLObjectType({
    name: 'Role',
    description: 'A user role, such as customer or admin',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        title: { type: GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        users: {
            type: GraphQLList(UserType),
            resolve: (role) => {
                return db().select().from(TABLES.UserRoles).where('roleId', role.id);
            }
        }
    })
})