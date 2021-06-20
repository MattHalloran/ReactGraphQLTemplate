import { API_ADDRESS } from '@local/shared';
// Headers used by fetch calls
export const HEADERS = {
    ApplicatonJsonAccept: {
        'Accept': 'application/json', // eslint-disable-line quote-props
        'Content-Type': 'application/json',
    },
    ApplicationJson: {
        'Content-Type': 'application/json'
    },
    Text: {
        'Content-Type': 'text/html; charset=UTF-8',
    },
}

// Wrapper function to simplify fetching data from the server.
// Parameters:
// url - string
// httpParams - object containing fetch options
export async function fetchWrapper(route, httpParams) {
    try {
        let response = await fetch(`${API_ADDRESS}/${route}`, httpParams);
        let json = await response.json();
        return json;
    } catch (err) {
        console.error(err);
        return err;
    }
}

export async function fetch_unused_plants(sorter) {
    let json = JSON.stringify({
        "sorter": sorter,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper('unused_plants', options);
}

export async function fetch_inventory(sorter, page_size, admin) {
    let json = JSON.stringify({
        "sorter": sorter,
        "page_size": page_size,
        "admin": admin,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper('inventory', options);
}

export async function fetch_inventory_filters() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('inventory_filters', options);
}

export async function fetch_inventory_page(ids) {
    let json = JSON.stringify({
        "ids": ids,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('inventory_page', options);
}

export async function set_order_status(id, status) {
    let json = JSON.stringify({
        "id": id,
        "status": status,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('order_status', options);
}

export async function modify_sku(sku, operation, data) {
    let json = JSON.stringify({
        "sku": sku,
        "operation": operation,
        "data": data
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'indlude'
    }
    return await fetchWrapper('modify_sku', options);
}

export async function modify_plant(operation, data) {
    let json = JSON.stringify({
        "operation": operation,
        "data": data
    });
    console.log('PLANT DATA', json)
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('modify_plant', options);
}

export async function modify_user(id, operation) {
    let json = JSON.stringify({
        "id": id,
        "operation": operation
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('modify_user', options);
}

export async function submit_order(cart) {
    let json = JSON.stringify({
        "cart": cart,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('submit_order', options);
}

export async function fetch_image(key, size) {
    let options = {
        method: 'get',
        headers: HEADERS.Text
    }
    return await fetchWrapper(`image?key=${key}&size=${size}`, options);
}

export async function fetch_images(keys, size) {
    let options = {
        method: 'get',
        headers: HEADERS.Text
    }
    return await fetchWrapper(`images?keys=${keys.filter(k => k !== null).join(',')}&size=${size}`, options);
}