import { gql } from 'apollo-server-express';
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";

export const typeDef = gql`
    scalar Date
    type Response {
        code: Int
        message: String!
    }
    type Query {
        _empty: String
    }
    type Mutation {
        _empty: String
    }
`

export const resolvers = {
    Date: new GraphQLScalarType({
        name: "Date",
        description: "Custom description for the date scalar",
        parseValue(value) {
          return dayjs(value); // value from the client
        },
        serialize(value) {
          return dayjs(value).format("MM-DD-YYYY"); // value sent to the client
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.STRING) {
            return dayjs(ast.value); // ast value is always in string format
          }
          return null;
        }
    })
}