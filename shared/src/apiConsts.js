// Client setup
const CLIENT_ADDRESS = 'http://localhost:3000'; //https://newlifenurseryinc.com';
// Server setup
const SERVER_IP = 'http://localhost'; //https://newlifenurseryinc.com';
const SERVER_PORT = '5000';
const API_PREFIX = 'api';
const API_VERSION = 'v1';

const WEBSITE_URL = 'https://www.newlifenurseryinc.com';

// The length of a user session
const SESSION_DAYS = 30;
const SESSION_MILLI = SESSION_DAYS*86400;
const COOKIE = {
    Session: "session-f234y7fdiafhdja2",
}

module.exports = {
    CLIENT_ADDRESS: CLIENT_ADDRESS,
    SERVER_IP: SERVER_IP,
    SERVER_PORT: SERVER_PORT,
    API_PREFIX: API_PREFIX,
    API_VERSION: API_VERSION,
    API_ADDRESS: `${SERVER_IP}:${SERVER_PORT}/${API_PREFIX}/${API_VERSION}`,
    SERVER_ADDRESS: `${SERVER_IP}:${SERVER_PORT}`,
    WEBSITE_URL: WEBSITE_URL,
    SESSION_DAYS: SESSION_DAYS,
    SESSION_MILLI: SESSION_MILLI,
    COOKIE: COOKIE
}