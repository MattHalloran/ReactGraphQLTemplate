// Wraps functions from http_functions in Promises
import { useHistory } from 'react-router-dom';
import { storeItem, getRoles, getSession,clearStorage, setTheme } from 'utils/storage';
import StatusCodes from './consts/codes.json';
import { LOCAL_STORAGE, LINKS, PUBS } from 'utils/consts';
import PubSub from 'utils/pubsub';
import * as http from './http_functions';


// Helper method for basic http calls
function promiseWrapper(http_func, ...args) {
    return new Promise(function (resolve, reject) {
        PubSub.publish(PUBS.Loading, true);
        http_func(...args).then(data => {
            PubSub.publish(PUBS.Loading, false);
            if (data.ok) {
                resolve(data);
            } else {
                console.warn(`HTTP call ${http_func} failed with status ${data.status}`);
                reject(data);
            }
        }).catch(err => {
            console.error(err);
            PubSub.publish(PUBS.Loading, false);
        })
    });
}

export const getContactInfo = () => promiseWrapper(http.fetch_contact_info);
export const updateContactInfo = (data) => promiseWrapper(http.update_contact_info, data);
export const getGallery = () => promiseWrapper(http.fetch_gallery);
export const getGalleryThumbnails = (hashes) => promiseWrapper(http.fetch_image_thumbnails, hashes)
export const uploadGalleryImages = (formData) => promiseWrapper(http.upload_gallery_images, formData);
export const uploadAvailability = (formData) => promiseWrapper(http.upload_availability, formData);
export const getProfileInfo = (session) => promiseWrapper(http.fetch_profile_info, session);
export const getPlants = (sort) => promiseWrapper(http.fetch_plants, sort);
export const getInventory = (sorter, page_size, admin) => promiseWrapper(http.fetch_inventory, sorter, page_size, admin);
export const getInventoryPage = (skus) => promiseWrapper(http.fetch_inventory_page, skus);
export const getImageFromHash = (hash) => promiseWrapper(http.fetch_image_from_hash, hash);
export const getImageFromSku = (sku) => promiseWrapper(http.fetch_image_from_sku, sku);
export const getInventoryFilters = () => promiseWrapper(http.fetch_inventory_filters);
export const resetPasswordRequest = (email) => promiseWrapper(http.send_password_reset_request, email);
export const getCustomers = (email, token) => promiseWrapper(http.fetch_customers, email, token);
export const modifySku = (email, token, sku, operation) => promiseWrapper(http.modify_sku, email, token, sku, operation);
export const modifyUser = (email, token, id, operation) => promiseWrapper(http.modify_user, email, token, id, operation);

export const checkCookies = () => {
    return new Promise(function (resolve, reject) {
        let roles = getRoles();
        if (roles) PubSub.publish(PUBS.Roles, roles);
        let session = getSession();
        if (!session || !session.email || !session.token) {
            console.log('SETTING SESSION TO NULL', session);
            storeItem(LOCAL_STORAGE.Session, null);
            reject({ok: false, status: StatusCodes.FAILURE_NOT_VERIFIED});
        } else {
            http.validate_token(session.token).then(data => {
                if (data.ok) {
                    console.log('COOKIE SUCCESS! SeTting session', session)
                    storeItem(LOCAL_STORAGE.Session, session);
                    resolve(data);
                } else {
                    console.log('COOKIE FAILURE! session setting to null')
                    storeItem(LOCAL_STORAGE.Session, null);
                    reject(data);
                }
            })
        }
    });
}

export function logoutAndRedirect() {
    console.log("LOGGIN OUT AND REDIRECTING")
    return (dispatch) => {
        dispatch(clearStorage);
        let history = useHistory();
        history.push(LINKS.Home);
    };
}

export const login = (session, user) => {
    storeItem(LOCAL_STORAGE.Session, session);
    storeItem(LOCAL_STORAGE.Roles, user.roles);
    setTheme(user.theme);
}

export function loginUser(email, password) {
    return new Promise(function (resolve, reject) {
        http.get_token(email, password).then(data => {
            if (data.ok) {
                console.log('LOGIN OKAY')
                login({email: email, token: data.token}, data.user);
                resolve(data);
            } else {
                console.log('DATA NOT OKAY, logging out')
                clearStorage();
                switch (data.status) {
                    case StatusCodes.FAILURE_NO_USER:
                        data.error = "Email or password incorrect. Please try again.";
                        break;
                    case StatusCodes.FAILURE_SOFT_LOCKOUT:
                        data.error = "Incorrect password entered too many times. Please try again in 15 minutes";
                        break;
                    case StatusCodes.FAILURE_HARD_LOCKOUT:
                        data.error = "Account locked. Please contact us";
                        break;
                    default:
                        data.error = "Unknown error occurred. Please try again";
                        break;
                }
                reject(data);
            }
        })
    });
}

export function registerUser(firstName, lastName, business, email, phone, password, existing_customer) {
    return new Promise(function (resolve, reject) {
        http.create_user(firstName, lastName, business, email, phone, password, existing_customer).then(data => {
            if (data.ok) {
                login({email: email, token: data.token }, data.user);
                resolve(data);
            } else {
                console.log('REGISTER FAIL LOGGING OUT')
                clearStorage();
                if (data.status === StatusCodes.FAILURE_EMAIL_EXISTS) {
                    data.error = "User with that email already exists. If you would like to reset your password, TODO";
                } else {
                    data.error = "Unknown error occurred. Please try again";
                }
                reject(data);
            }
        })
    });
}

export function setLikeSku(email, token, sku, liked) {
    return new Promise(function (resolve, reject) {
        http.set_like_sku(email, token, sku, liked).then(response => {
            if (response.ok) {
                console.log('BUNNYYYY', response)
                storeItem(LOCAL_STORAGE.Likes, response.likes);
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}

export function setSkuInCart(email, token, sku, quantity, in_cart) {
    return new Promise(function (resolve, reject) {
        http.set_sku_in_cart(email, token, sku, quantity, in_cart).then(response => {
            if (response.ok) {
                console.log('SKU IN CART SUCCESS', response.cart);
                storeItem(LOCAL_STORAGE.Cart, response.cart);
                resolve(response);
            } else {
                console.log('SKU IN CART FAIL', response)
                reject(response);
            }
        })
    });
}