export const SITE_IP = 'http://localhost'; //https://newlifenurseryinc.com';
// Client setup
export const CLIENT_PORT = '3000';
export const CLIENT_ADDRESS = `${SITE_IP}:${CLIENT_PORT}`;
// Server setup
export const SERVER_PORT = '5000';
export const SERVER_ADDRESS = `${SITE_IP}:${SERVER_PORT}`;
export const API_PREFIX = 'api';
export const API_VERSION = 'v1';
export const API_ADDRESS = `${SITE_IP}:${SERVER_PORT}/${API_PREFIX}/${API_VERSION}`;

export const WEBSITE_URL = 'https://www.newlifenurseryinc.com';

// The length of a user session
export const SESSION_DAYS = 30;
export const SESSION_MILLI = SESSION_DAYS*86400;
export const COOKIE = {
    Session: "session-f234y7fdiafhdja2",
}