import { fetch_inventory, fetch_inventory_page } from './http_functions';
import { StatusCodes } from './constants';

export function getInventorySuccess(status) {
    return {
        status: status
    };
}

export function getInventoryFailure(status) {
    return {
        status: status
    };
}

export function getInventory(filter_by) {
    return new Promise(function (resolve, reject) {
        try {
            fetch_inventory(filter_by)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === StatusCodes.FETCH_INVENTORY_SUCCESS) {
                            resolve(getInventorySuccess(data.status))
                        } else {
                            reject(getInventoryFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getInventoryFailure(StatusCodes.FETCH_INVENTORY_ERROR_UNKNOWN));
        }
    });
}

export function getInventoryPageSuccess(status) {
    return {
        status: status
    };
}

export function getInventoryPageFailure(status) {
    return {
        status: status
    };
}

export function getInventoryPage(item_ids) {
    return new Promise(function (resolve, reject) {
        try {
            fetch_inventory_page(item_ids)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === StatusCodes.FETCH_INVENTORY_PAGE_SUCCESS) {
                            resolve(getInventoryPageSuccess(data.status))
                        } else {
                            reject(getInventoryPageFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getInventoryPageFailure(StatusCodes.FETCH_INVENTORY_PAGE_ERROR_UNKNOWN));
        }
    });
}