// Wraps functions from http_functions in Promises
import { PUBS, PubSub } from 'utils';
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

export const getInventory = (sorter, page_size, admin) => promiseWrapper(http.fetch_inventory, sorter, page_size, admin);
export const getInventoryPage = (ids) => promiseWrapper(http.fetch_inventory_page, ids);
export const getInventoryFilters = () => promiseWrapper(http.fetch_inventory_filters);
export const modifySku = (sku, operation, data) => promiseWrapper(http.modify_sku, sku, operation, data);
export const modifyPlant = (operation, data) => promiseWrapper(http.modify_plant, operation, data);
export const setOrderStatus = (id, status) => promiseWrapper(http.set_order_status, id, status);

export function submitOrder(cart) {
    return new Promise(function (resolve, reject) {
        http.submit_order(cart).then(response => {
            if (response.ok) {
                resolve(response);
            } else {
                reject(response);
            }
        })
    });
}