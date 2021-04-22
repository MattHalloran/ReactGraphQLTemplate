// Wraps functions from http_functions in Promises
import { useHistory } from 'react-router-dom';
import { clearStorage } from 'utils/storage';
import { COOKIE, LINKS, PUBS, SESSION_DAYS, STATUS_CODES } from 'utils/consts';
import Cookies from 'js-cookie';
import PubSub from 'utils/pubsub';
import * as http from './http_functions';


// Helper method for basic http calls
function promiseWrapper(http_func, ...args) {
    return new Promise(function (resolve, reject) {
        PubSub.publish(PUBS.Loading, true);
        http_func(...args).then(response => {
            PubSub.publish(PUBS.Loading, false);
            if (response.ok) {
                resolve(response);
            } else {
                console.warn(`HTTP call ${http_func} failed with status ${response.status}`);
                reject(response);
            }
        }).catch(err => {
            console.error(err);
            PubSub.publish(PUBS.Loading, false);
        })
    });
}

export const getImage = (id, size) => promiseWrapper(http.fetch_image, id, size);
export const getImages = (ids, size) => promiseWrapper(http.fetch_images, ids, size);
export const getUnusedPlants = (sorter) => promiseWrapper(http.fetch_unused_plants, sorter);
export const getInventory = (sorter, page_size, admin) => promiseWrapper(http.fetch_inventory, sorter, page_size, admin);
export const getInventoryPage = (ids) => promiseWrapper(http.fetch_inventory_page, ids);
export const getInventoryFilters = () => promiseWrapper(http.fetch_inventory_filters);
export const resetPasswordRequest = (email) => promiseWrapper(http.send_password_reset_request, email);
export const modifySku = (session, sku, operation, data) => promiseWrapper(http.modify_sku, session, sku, operation, data);
export const modifyPlant = (session, operation, data) => promiseWrapper(http.modify_plant, session, operation, data);
export const modifyUser = (session, id, operation) => promiseWrapper(http.modify_user, session, id, operation);
export const getOrders = (session, status) => promiseWrapper(http.fetch_orders, session, status)
export const setOrderStatus = (session, id, status) => promiseWrapper(http.set_order_status, session, id, status);

export function submitOrder(session, cart) {
    return new Promise(function (resolve, reject) {
        http.submit_order(session, cart).then(response => {
            if (response.ok) {
                Cookies.set(COOKIE.Cart, null);
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}

export const checkCookies = () => {
    return new Promise(function (resolve, reject) {
        let session = Cookies.get(COOKIE.Session);
        if (!session || !session.tag || !session.token) {
            console.log('SETTING SESSION TO NULL', session);
            Cookies.get(COOKIE.Session, null);
            reject(STATUS_CODES.FAILURE_NOT_VERIFIED);
        } else {
            http.validate_token(session).then(response => {
                if (response.ok) {
                    Cookies.set(COOKIE.Session, session, { expires: SESSION_DAYS })
                    resolve(response);
                } else {
                    Cookies.set(COOKIE.Session, null);
                    reject(response);
                }
            })
        }
    });
}

export function logoutAndRedirect() {
    return (dispatch) => {
        dispatch(clearStorage);
        let history = useHistory();
        history.push(LINKS.Home);
    };
}

export const storeLogin = (session, user) => {
    Cookies.set(COOKIE.Session, session, { expires: SESSION_DAYS })
}

export function registerUser(data) {
    return new Promise(function (resolve, reject) {
        console.log('data in register user is', data)
        http.register(data).then(response => {
            if (response.ok) {
                storeLogin(response.session, response.user);
                resolve(data);
            } else {
                console.log('REGISTER FAIL LOGGING OUT')
                clearStorage();
                reject(response);
            }
        })
    });
}