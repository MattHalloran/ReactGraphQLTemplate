import { gql } from 'apollo-server-express';
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import moment from 'moment';
import { GraphQLUpload } from 'graphql-upload';
import fs from 'fs';
import { clean } from '../../utils';

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
            let data = [];
            for (const file of args.files) {
                const { name, ext, folder } = clean(file, 'public');
                const path = `${process.env.PROJECT_DIR}/assets/${folder}/${name}${ext}`;
                if (fs.existsSync(path)) {
                    data.push(fs.readFileSync(path, 'utf8'));
                } else {
                    console.log('DOES NOT EXIST')
                    console.log(path)
                    data.push(null);
                }
            }
            return data;
        },
    },
}