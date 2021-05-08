const SERVER_IP = 'http://192.168.0.8:5000';//https://newlifenurseryinc.com';
// URL prefix used to signify calls to backend
const PREFIX = 'api';
// API version
const VERSION = 'v1';
export const URL_BASE = `${SERVER_IP}/${PREFIX}/${VERSION}`;

export const WEBSITE_URL = 'https://www.newlifenurseryinc.com';
export const BUSINESS_NAME = {
    Short: 'New Life Nursery Inc.',
    Long: 'New Life Nursery Inc.',
}
export const ADDRESS = {
    Label: '106 South Woodruff Road Bridgeton, NJ 08302',
    Link: 'https://www.google.com/maps/place/106+S+Woodruff+Rd,+Bridgeton,+NJ+08302/@39.4559443,-75.1793432,17z/',
}
export const PHONE = {
    Label: '(856) 455-3601',
    Link: 'tel:+18564553601',
}
export const FAX = {
    Label: '(856) 451-1530',
    Link: 'tel:+18564511530',
}
export const EMAIL = {
    Label: 'info@newlifenurseryinc.com',
    Link: 'mailto:info@newlifenurseryinc.com',
}
export const SOCIAL = {
    Facebook: 'https://www.facebook.com/newlifenurseryinc',
    Instagram: 'https://www.instagram.com/newlifenurseryinc'
}

// The amount of days a user stays signed in
export const SESSION_DAYS = 30;

export const DEFAULT_PRONOUNS = [
    "Custom",
    "he/him/his",
    "she/her/hers",
    "they/them/theirs",
    "ze/zir/zirs",
    "ze/hir/hirs",
];

