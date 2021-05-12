import express from 'express';
import cookieParser from 'cookie-parser';
// import path from 'path';
// import * as auth from './auth';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './db/schema';

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

// For GraphQL
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

// // For authentication
// app.use(auth);

// // Set static folders
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/private', auth.requireAdmin, express.static(path.join(__dirname, 'private')));
// app.use('/assets', express.static(path.join(__dirname, 'assets')));

// // Routes
// app.use(PREFIX, require('./route/adminRoutes'));
// app.use(PREFIX, require('./route/authRoutes'));
// app.use(PREFIX, require('./route/customerRoutes'));
// app.use(PREFIX, require('./route/imageRoutes'));
// app.use(PREFIX, require('./route/inventoryRoutes'));
// app.use(PREFIX, require('./route/otherRoutes'));

app.listen(PORT);