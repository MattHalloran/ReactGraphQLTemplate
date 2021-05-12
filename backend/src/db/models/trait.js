import { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { TraitNameType } from '../enums/traitName';
import { TABLES } from '../tables';
import { PlantType } from './plant';

export const TraitType = new GraphQLObjectType({
    name: 'Trait',
    description: 'A plant attribute',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(TraitNameType) },
        value: { type: GraphQLNonNull(GraphQLString) },
        plants: {
            type: GraphQLList(PlantType),
            resolve: (trait) => {
                return db().select().from(TABLES.PlantTraits).where('traitId', trait.id);
            }
        }
    })
})