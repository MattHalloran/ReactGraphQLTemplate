// Wraps functions from http_functions in Promises
import { useHistory } from 'react-router-dom';
import { storeItem, getRoles, getSession,clearStorage, setTheme, getItem, getStatusCodes } from 'utils/storage';
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
export const getImage = (id, size) => promiseWrapper(http.fetch_image, id, size);
export const getImages = (ids, size) => promiseWrapper(http.fetch_images, ids, size);
export const uploadGalleryImages = (formData) => promiseWrapper(http.upload_gallery_images, formData);
export const uploadAvailability = (formData) => promiseWrapper(http.upload_availability, formData);
export const getProfileInfo = (session) => promiseWrapper(http.fetch_profile_info, session);
export const updateProfile = (session, data) => promiseWrapper(http.update_profile, session, data);
export const getLikes = (session) => promiseWrapper(http.fetch_likes, session);
export const getCart = (session) => promiseWrapper(http.fetch_cart, session);
export const getUnusedPlants = (sorter) => promiseWrapper(http.fetch_unused_plants, sorter);
export const getInventory = (sorter, page_size, admin) => promiseWrapper(http.fetch_inventory, sorter, page_size, admin);
export const getInventoryPage = (ids) => promiseWrapper(http.fetch_inventory_page, ids);
export const getInventoryFilters = () => promiseWrapper(http.fetch_inventory_filters);
export const resetPasswordRequest = (email) => promiseWrapper(http.send_password_reset_request, email);
export const getCustomers = (session) => promiseWrapper(http.fetch_customers, session);
export const modifySku = (session, sku, operation, data) => promiseWrapper(http.modify_sku, session, sku, operation, data);
export const modifyPlant = (session, operation, data) => promiseWrapper(http.modify_plant, session, operation, data);
export const modifyUser = (session, id, operation) => promiseWrapper(http.modify_user, session, id, operation);
export const getOrders = (session, status) => promiseWrapper(http.fetch_orders, session, status)
export const setOrderStatus = (session, id, status) => promiseWrapper(http.set_order_status, session, id, status);

export function submitOrder(session, cart) {
    return new Promise(function (resolve, reject) {
        http.submit_order(session, cart).then(data => {
            if (data.ok) {
                storeItem(LOCAL_STORAGE.Cart, null);
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export const checkCookies = () => {
    return new Promise(function (resolve, reject) {
        let roles = getRoles();
        if (roles) PubSub.publish(PUBS.Roles, roles);
        let session = getSession();
        if (!session || !session.email || !session.token) {
            console.log('SETTING SESSION TO NULL', session);
            storeItem(LOCAL_STORAGE.Session, null);
            reject(getStatusCodes().FAILURE_NOT_VERIFIED);
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
                console.log('DATA NOT OKAY, logging out', data)
                clearStorage();
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
                reject(data);
            }
        })
    });
}

export function setLikeSku(session, sku, liked) {
    return new Promise(function (resolve, reject) {
        http.set_like_sku(session, sku, liked).then(response => {
            if (response.ok) {
                storeItem(LOCAL_STORAGE.Likes, response.user.likes);
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}

export function updateCart(session, who, cart) {
    return new Promise(function (resolve, reject) {
        http.update_cart(session, who, cart).then(response => {
            if (response.ok) {
                console.log('SUCCESS! UPDATING CART', response.cart)
                storeItem(LOCAL_STORAGE.Cart, response.cart);
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}

export function getConsts() {
    return new Promise(function (resolve, reject) {
        http.fetch_consts().then(response => {
            if (response.ok) {
                console.log('FOUND CODES', response.status_codes);
                storeItem(LOCAL_STORAGE.StatusCodes, response.status_codes, true);
                storeItem(LOCAL_STORAGE.OrderStatus, response.order_status, true);
                resolve(response);
            } else {
                console.log('COULD NOT FETCH CODES', response)
                reject(response);
            }
        })
    });
}