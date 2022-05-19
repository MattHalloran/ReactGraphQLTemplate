import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import webPush from 'web-push';
import * as auth from './auth';
import cors from "cors";
import { ApolloServer } from 'apollo-server-express';
import { depthLimit } from './depthLimit';
import { graphqlUploadExpress } from 'graphql-upload';
import { API_VERSION } from '@local/shared';
import { schema } from './schema';
import { context } from './context';
import { envVariableExists } from './utils/envVariableExists';
import { setupDatabase } from './utils/setupDatabase';

const main = async () => {
    console.info('Starting server...')

    // Check for required .env variables
    if (['JWT_SECRET', 'REACT_APP_SERVER_ROUTE'].some(name => !envVariableExists(name))) process.exit(1);

    // Setup database
    await setupDatabase();

    const app = express();

    // // For parsing application/json
    // app.use(express.json());
    // // For parsing application/xwww-
    // app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser(process.env.JWT_SECRET));
    app.use(bodyParser.json());

    // For authentication
    app.use(auth.authenticate);

    // Cross-Origin access. Accepts requests from localhost and dns
    // If you want a public server, this can be set to ['*']
    let origins = [
        /^http:\/\/localhost(?::[0-9]+)?$/,
        `http://${process.env.REACT_APP_SITE_NAME}`,
        `http://www.${process.env.REACT_APP_SITE_NAME}`,
        `https://${process.env.REACT_APP_SITE_NAME}`,
        `https://www.${process.env.REACT_APP_SITE_NAME}`
    ]
    app.use(cors({
        credentials: true,
        origin: origins
    }))

    // Set static folders
    app.use(process.env.REACT_APP_SERVER_ROUTE || '', express.static(`${process.env.PROJECT_DIR}/assets/public`));
    app.use(`${process.env.REACT_APP_SERVER_ROUTE}/private`, auth.requireAdmin, express.static(`${process.env.PROJECT_DIR}/assets/private`));
    app.use(`${process.env.REACT_APP_SERVER_ROUTE}/images`, express.static(`${process.env.PROJECT_DIR}/assets/images`));

    // Set up image uploading
    app.use(`${process.env.REACT_APP_SERVER_ROUTE}/${API_VERSION}`, graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 100 }),)

    // Setup web push, if keys are provided. 
    // We will use the same contact email as letsencrypt
    if (typeof process.env.LETSENCRYPT_EMAIL === 'string' &&
        typeof process.env.VAPID_PRIVATE_KEY === 'string' &&
        typeof process.env.VAPID_PUBLIC_KEY === 'string') {
        console.log('setting up vapid keys')
        // Set vapid keys
        webPush.setVapidDetails(
            `mailto:${process.env.LETSENCRYPT_EMAIL}`,
            process.env.VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        console.log('creating subscribe endpoint')
        // Create subscribe endpoint
        app.post(`/api/subscribe`, (req, res) => {
            const subscription = req.body;
            console.log('in push notifications endpoint', JSON.stringify(subscription), '\n\n')
            webPush.sendNotification(subscription, JSON.stringify({
                title: 'New post',
                body: 'New post has been published',
                // icon: `${process.env.REACT_APP_SERVER_ROUTE}/images/logo.png`,
                // link: `${process.env.REACT_APP_SERVER_ROUTE}/private/posts`
            })).catch(error => {
                console.error('Caught error in push subscription', error);
                res.status(500).send(error);
            });
            res.sendStatus(200);
        })
    }   

    // Set up GraphQL using Apollo
    // Context trickery allows request and response to be included in the context
    const apollo_options = new ApolloServer({
        introspection: process.env.NODE_ENV === 'development',
        schema: schema,
        context: (c) => context(c),
        validationRules: [depthLimit(8)] // Prevents DoS attack from arbitrarily-nested query
    });
    await apollo_options.start();
    apollo_options.applyMiddleware({
        app,
        path: `${process.env.REACT_APP_SERVER_ROUTE}/${API_VERSION}`,
        cors: false
    });
    // Start Express server
    app.listen(process.env.VIRTUAL_PORT);

    console.info(`🚀 Server running at ${process.env.REACT_APP_SERVER_ROUTE}/${API_VERSION}/${process.env.VIRTUAL_PORT}`)
}

main();