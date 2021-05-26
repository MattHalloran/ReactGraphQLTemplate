import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import * as auth from './auth';
import * as cors from 'cors';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './db/models';
import { SERVER_IP } from '@local/shared';

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

const corsOptions = {
    credentials: 'include',
    origin: SERVER_IP
}

// Set static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/private', auth.requireAdmin, express.static(path.join(__dirname, 'private')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Set up GraphQL using Apollo
// Context trickery allows request and response to be included in the context
const apollo_options = new ApolloServer({ typeDefs, resolvers, context: ({ req, res }) => ({ req, res }) });
apollo_options.applyMiddleware({ app, path: PREFIX, cors: corsOptions });

// Start Express server
app.listen(PORT);