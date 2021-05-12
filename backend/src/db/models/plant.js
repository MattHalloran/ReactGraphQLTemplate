import { GraphQLObjectType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLList } from 'graphql';
import { db } from '../db';
import { TABLES } from '../tables';
import { SkuType } from './sku';
import { TraitType } from './trait';

export const PlantType = new GraphQLObjectType({
    name: 'Plant',
    description: 'Plant information',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLString) },
        latinName: { type: GraphQLNonNull(GraphQLString) },
        commonName: { type: GraphQLString },
        plantnetUrl: { type: GraphQLString },
        yardsUrl: { type: GraphQLString },
        description: { type: GraphQLString },
        jerseyNative: { type: GraphQLBoolean },
        deerResistance: { type: GraphQLInt },
        droughtToleranceId: { type: GraphQLInt },
        grownHeightId: { type: GraphQLInt },
        grownSpreadId: { type: GraphQLInt },
        growthRateId: { type: GraphQLInt },
        optimalLightId: { type: GraphQLInt },
        saltToleranceId: { type: GraphQLInt },
        displayImageId: { type: GraphQLInt },
        deerResistance: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.deerResistanceId).first();
            }
        },
        droughtTolerance: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.droughtToleranceId).first();
            }
        },
        grownHeight: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.grownHeightId).first();
            }
        },
        grownSpread: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.grownSpreadId).first();
            }
        },
        growthRate: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.grownRateId).first();
            }
        },
        optimalLight: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.optimalLightId).first();
            }
        },
        saltTolerance: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Trait).where('id', plant.saltToleranceId).first();
            }
        },
        displayImage: {
            type: TraitType,
            resolve: (plant) => {
                return db().select().from(TABLES.Image).where('id', plant.displayImageId).first();
            }
        },
        skus: {
            type: GraphQLList(SkuType),
            resolve: (plant) => {
                return db().select().from(TABLES.Sku).where('plantId', plant.id);
            }
        }
    })
})