const SERVER_IP = 'http://192.168.0.8:5000'; //https://newlifenurseryinc.com';
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
    SERVER_IP: SERVER_IP,
    API_PREFIX: API_PREFIX,
    API_VERSION: API_VERSION,
    URL_BASE: `${SERVER_IP}/${API_PREFIX}/${API_VERSION}`,
    WEBSITE_URL: WEBSITE_URL,
    SESSION_DAYS: SESSION_DAYS,
    SESSION_MILLI: SESSION_MILLI,
    COOKIE: COOKIE
}