import express from 'express';
import cookieParser from 'cookie-parser';
import * as auth from './auth';
import { ApolloServer } from 'apollo-server-express';
import { depthLimit } from './depthLimit';
import { typeDefs, resolvers } from './db/models';
import { graphqlUploadExpress } from 'graphql-upload';
import { API_VERSION } from '@local/shared';

const app = express();

// // For parsing application/json
// app.use(express.json());
// // For parsing application/xwww-
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));

// For authentication
app.use(auth.authenticate);

// For CORS
const corsOptions = {
    credentials: true,
    origin: process.env.NODE_ENV === 'development' ? `http://localhost:${process.env.UI_PORT}` :  `http://${process.env.REACT_APP_SITE_NAME}`
}
// app.use((_, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// })

// Set static folders
app.use(express.static(`${process.env.PROJECT_DIR}/assets/public`));
app.use('/private', auth.requireAdmin, express.static(`${process.env.PROJECT_DIR}/assets/private`));
app.use('/images', express.static(`${process.env.PROJECT_DIR}/assets/images`));

// Set up image uploading
app.use(API_VERSION, graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 100 }),)

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
    path: API_VERSION, 
    cors: corsOptions 
});

// Start Express server
app.listen(process.env.VIRTUAL_PORT);

console.log(`LISTENING ON PORT ${process.env.VIRTUAL_PORT}`)