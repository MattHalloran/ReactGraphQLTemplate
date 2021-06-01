import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import * as auth from './auth';
import * as cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { depthLimit } from './depthLimit';
import { typeDefs, resolvers } from './db/models';
import { CLIENT_IP } from '@local/shared';

const app = express();
const VERSION = 'v1';
const PREFIX = `/api/${VERSION}`;
const PORT = 5000;

// Override sendstatus to allow for json
app.response.sendStatus = function (jsonStatus) {
    return this.contentType('application/json')
        .status(jsonStatus.code)
        .send(jsonStatus);
}

// For parsing application/json
app.use(express.json());
// For parsing application/xwww-
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// For authentication
app.use(auth.authenticate);

// For CORS
const corsOptions = {
    credentials: true,
    origin: CLIENT_IP
}
// app.use((_, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// })

// Set static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/private', auth.requireAdmin, express.static(path.join(__dirname, 'private')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Set up GraphQL using Apollo
// Context trickery allows request and response to be included in the context
const apollo_options = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    context: ({ req, res }) => ({ req, res }),
    validationRules: [ depthLimit(6) ] // Prevents DoS attack from arbitrarily-nested query
 });
apollo_options.applyMiddleware({ app, path: PREFIX, cors: corsOptions });

// Start Express server
app.listen(PORT);