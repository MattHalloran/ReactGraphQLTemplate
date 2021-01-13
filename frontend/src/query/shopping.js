import { fetch_inventory, fetch_inventory_page } from './http_functions';
import { StatusCodes } from './status';

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
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(getInventorySuccess(data.status))
                        } else {
                            reject(getInventoryFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getInventoryFailure(StatusCodes.ERROR_UNKNOWN));
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
                        if(data.status === StatusCodes.SUCCESS) {
                            resolve(getInventoryPageSuccess(data.status))
                        } else {
                            reject(getInventoryPageFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(getInventoryPageFailure(StatusCodes.ERROR_UNKNOWN));
        }
    });
}