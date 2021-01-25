import { fetch_inventory, fetch_inventory_page, fetch_image} from './http_functions';

export function getInventory(filter_by) {
    return new Promise(function (resolve, reject) {
        fetch_inventory(filter_by).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })

    });
}

export function getInventoryPage(item_ids) {
    return new Promise(function (resolve, reject) {
        fetch_inventory_page(item_ids).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function getShoppingImage(hash) {
    return new Promise(function (resolve, reject) {
        fetch_image(hash).then(data => {
            if (data.ok && data.image !== null) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}