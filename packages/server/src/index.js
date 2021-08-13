import express from 'express';
import cookieParser from 'cookie-parser';
import * as auth from './auth';
import cors from "cors";
import { ApolloServer } from 'apollo-server-express';
import { depthLimit } from './depthLimit';
import { graphqlUploadExpress } from 'graphql-upload';
import { API_VERSION } from '@local/shared';
import { schema } from './schema';
import { context } from './context';
import { findImageUrl } from './utils';
import path from 'path';

console.info('Starting server...')

const app = express();

// // For parsing application/json
// app.use(express.json());
// // For parsing application/xwww-
// app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.JWT_SECRET));

// For authentication
app.use(auth.authenticate);

// Cross-Origin access. Accepts requests from localhost and the website
let origins = [/^http:\/\/localhost(?::[0-9]+)?$/, `http://${process.env.REACT_APP_SITE_NAME}`]
if (process.env.REACT_APP_SITE_NAME) origins.push(process.env.REACT_APP_SITE_NAME);
app.use(cors({
    credentials: true,
    origin: origins
}))

// Set static folders
app.use(express.static(`${process.env.PROJECT_DIR}/assets/public`));
app.use('/private', auth.requireAdmin, express.static(`${process.env.PROJECT_DIR}/assets/private`));
// Before querying image, find the best-match size
app.use('/images', async (req, res) => {
    const correct_path = await findImageUrl(`images/${req.path}`, req.query.size || 'XL');
    res.sendFile(`${process.env.PROJECT_DIR}/assets/images/${path.basename(correct_path)}`);
});

// Set up image uploading
app.use(`/${API_VERSION}`, graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 100 }),)

// Set up GraphQL using Apollo
// Context trickery allows request and response to be included in the context
const apollo_options = new ApolloServer({ 
    schema: schema,
    context: (c) => context(c),
    uploads: false, // Disables old version of graphql-upload
    validationRules: [ depthLimit(6) ] // Prevents DoS attack from arbitrarily-nested query
 });
apollo_options.applyMiddleware({ 
    app, 
    path: `/${API_VERSION}`, 
    cors: false
});

// Start Express server
app.listen(process.env.VIRTUAL_PORT);

console.info(`🚀 Server running on port ${process.env.VIRTUAL_PORT}`)