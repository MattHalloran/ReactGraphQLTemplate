import { fetch_inventory, fetch_inventory_page, fetch_image_from_hash, fetch_image_from_sku} from './http_functions';

export function getInventory(filter_by) {
    return new Promise(function (resolve, reject) {
        fetch_inventory(filter_by).then(data => {
            if (data.ok) {
                console.log('GOT INVENTORY OKAYYYY', data)
                resolve(data);
            } else {
                reject(data);
            }
        })

    });
}

export function getInventoryPage(skus) {
    return new Promise(function (resolve, reject) {
        fetch_inventory_page(skus).then(data => {
            if (data.ok) {
                console.log('DATA OKYYYYY', data)
                resolve(data);
            } else {
                console.log('DATA NOT OKAYYYYYYYYYYY', data)
                reject(data);
            }
        })
    });
}

export function getImageFromHash(hash) {
    return new Promise(function (resolve, reject) {
        fetch_image_from_hash(hash).then(data => {
            if (data.ok && data.image !== null) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}

export function getImageFromSku(sku) {
    return new Promise(function (resolve, reject) {
        fetch_image_from_sku(sku).then(data => {
            if (data.ok && data.image !== null) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}