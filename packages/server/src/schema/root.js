import { gql } from 'apollo-server-express';
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import moment from 'moment';
import { GraphQLUpload } from 'graphql-upload';
import { readFiles, saveFiles } from '../utils';

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const typeDef = gql`
    scalar Date
    scalar Upload

    type Response {
        code: Int
        message: String!
    }
    type Query {
        _empty: String
        readAssets(files: [String!]!): [String]!
    }
    type Mutation {
        _empty: String
        writeAssets(files: [Upload!]!): Boolean
    }
`

export const resolvers = {
    Upload: GraphQLUpload,
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Custom description for the date scalar",
        parseValue(value) {
          return moment(value); // value from the client
        },
        serialize(value) {
          return moment(value, DATE_FORMAT); // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.STRING) {
            return moment(ast.value); // ast value is always in string format
          }
          return null;
        }
    }),
    Query: {
        readAssets: async (_, args) => {
            return await readFiles(args.files);
        },
    },
    Mutation: {
        writeAssets: async (_, args) => {
            const data = await saveFiles(args.files);
            // Any failed writes will return null
            return !data.some(d => d === null)
        },
    }
}