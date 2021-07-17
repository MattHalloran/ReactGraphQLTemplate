export const SITE_IP = process.env.NODE_ENV === 'development' ? 'http://localhost' : `https://${process.env.REACT_APP_SITE_NAME}`;
// Client setup
export const CLIENT_PORT = '3000';
export const CLIENT_ADDRESS = process.env.NODE_ENV === 'development' ? `${SITE_IP}:${CLIENT_PORT}` : SITE_IP;
// Server setup
export const SERVER_PORT = '5000';
export const SERVER_ADDRESS = process.env.NODE_ENV === 'development' ? `${SITE_IP}:${SERVER_PORT}${process.env.REACT_APP_SERVER_ROUTE}` : `${SITE_IP}${process.env.REACT_APP_SERVER_ROUTE}`;
export const API_VERSION = 'v1';
export const API_ADDRESS = `${SERVER_ADDRESS}/${API_VERSION}`;

export const WEBSITE_URL = 'https://www.newlifenurseryinc.com';

// The length of a user session
export const SESSION_DAYS = 30;
export const SESSION_MILLI = SESSION_DAYS*86400;
export const COOKIE = {
    Session: "session-f234y7fdiafhdja2",
}