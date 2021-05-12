import { GraphQLObjectType, GraphQLString, GraphQLInt } from 'graphql';

export const ImageType = new GraphQLObjectType({
    name: 'Image',
    description: 'Image data',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        extension: { type: GraphQLNonNull(GraphQLString) },
        alt: { type: GraphQLString },
        hash: { type: GraphQLNonNull(GraphQLString) },
        width: { type: GraphQLNonNull(GraphQLInt) },
        height: { type: GraphQLNonNull(GraphQLInt) }
    })
})