import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import * as auth from './auth';
import { ApolloServer } from 'apollo-server-express';
import { depthLimit } from './depthLimit';
import { typeDefs, resolvers } from './db/models';
import { graphqlUploadExpress } from 'graphql-upload'
import { API_PREFIX, API_VERSION, CLIENT_ADDRESS, SERVER_PORT } from '@local/shared';

const app = express();

// Override sendstatus to allow for json
app.response.sendStatus = function (jsonStatus) {
    return this.contentType('application/json')
        .status(jsonStatus.code)
        .send(jsonStatus);
}

// // For parsing application/json
// app.use(express.json());
// // For parsing application/xwww-
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// For authentication
app.use(auth.authenticate);

// For CORS
const corsOptions = {
    credentials: true,
    origin: CLIENT_ADDRESS
}
// app.use((_, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// })

// Set static folders
app.use(express.static(path.join(path.resolve(), './public')));
app.use('/private', auth.requireAdmin, express.static(path.join(path.resolve(), './private')));
app.use('/images', express.static(path.join(path.resolve(), './images')));

// Set up image uploading
app.use(`/${API_PREFIX}/${API_VERSION}`,
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
  )

// Set up GraphQL using Apollo
// Context trickery allows request and response to be included in the context
const apollo_options = new ApolloServer({ 
    typeDefs, 
    resolvers, 
    uploads: false, // Disables old version of graphql-upload
    context: ({ req, res }) => ({ req, res }),
    validationRules: [ depthLimit(6) ] // Prevents DoS attack from arbitrarily-nested query
 });
apollo_options.applyMiddleware({ 
    app, 
    path: `/${API_PREFIX}/${API_VERSION}`, 
    cors: corsOptions 
});

// Start Express server
app.listen(SERVER_PORT);