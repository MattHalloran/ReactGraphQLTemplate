import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import * as auth from './auth';

const app = express();
const port = 5000;
const VERSION = 'v1';
const PREFIX = `/api/${VERSION}`;

// For parsing application/json
app.use(express.json());
// For parsing application/xwww-
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// For authentication
app.use(auth);

// Set static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/private', auth.requireAdmin, express.static(path.join(__dirname, 'private')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Routes
app.use(PREFIX, require('./route/authRoutes'));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})