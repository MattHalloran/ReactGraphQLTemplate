export const SERVER_URL = process.env.REACT_APP_SERVER_LOCATION === 'local' ? 
    `http://localhost:${process.env.REACT_APP_SERVER_PORT}` : 
    `https://${process.env.REACT_APP_SITE_NAME}/api`;
export const API_VERSION = 'v1';
export const SERVER_QUERY_URL = `${SERVER_URL}/${API_VERSION}`;

// The length of a user session
export const COOKIE = {
    Session: "session-f234y7fdiafhdja2",
}