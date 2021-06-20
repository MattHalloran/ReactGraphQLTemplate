// Client setup
export const CLIENT_ADDRESS = 'http://localhost:3000'; //https://newlifenurseryinc.com';
// Server setup
export const SERVER_IP = 'http://localhost'; //https://newlifenurseryinc.com';
export const SERVER_PORT = '5000';
export const SERVER_ADDRESS = `${SERVER_IP}:${SERVER_PORT}`;
export const API_PREFIX = 'api';
export const API_VERSION = 'v1';
export const API_ADDRESS = `${SERVER_IP}:${SERVER_PORT}/${API_PREFIX}/${API_VERSION}`;

export const WEBSITE_URL = 'https://www.newlifenurseryinc.com';

// The length of a user session
export const SESSION_DAYS = 30;
export const SESSION_MILLI = SESSION_DAYS*86400;
export const COOKIE = {
    Session: "session-f234y7fdiafhdja2",
}