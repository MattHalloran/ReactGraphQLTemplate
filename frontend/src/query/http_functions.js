import StatusCodes from './consts/codes.json';

// URL prefix used to signify calls to backend
const PREFIX = '/api';
// Headers used by fetch calls
const HEADERS = {
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

// Wrapper function to simplify fetching data from the backend.
// Parameters:
// url - string
// httpParams - object containing fetch options
async function fetchWrapper(url, httpParams) {
    try {
        let response = await fetch(url, httpParams);
        let json = await response.json();
        if (json.status === StatusCodes.SUCCESS) {
            json.ok = true;
            return json;
        }
        console.log('HTTP FAILUREEEEEE', json.status, StatusCodes.SUCCESS)
        json.ok = false;
        if (!json.status) json.status = StatusCodes.ERROR_UNKNOWN;
        return json;
    } catch (err) {
        console.error(err);
        return err;
    }
}


export async function validate_token(token) {
    let json = JSON.stringify({
        token: token,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper(`${PREFIX}/is_token_valid`, options);
}

export async function create_user(firstName, lastName, business, email, phone, password, existing_customer) {
    let json = JSON.stringify({
        "first_name": firstName,
        "last_name": lastName,
        "business": business,
        "email": email,
        "phone": phone,
        "password": password,
        "existing_customer": existing_customer
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper(`${PREFIX}/register`, options);
}

export async function get_token(email, password) {
    let json = JSON.stringify({
        "email": email,
        "password": password
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper(`${PREFIX}/get_token`, options);
}

export async function send_password_reset_request(email) {
    let json = JSON.stringify({
        "email": email,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/reset_password_request`, options);
}

export async function fetch_customers(email, token) {
    let json = JSON.stringify({
        "email": email,
        "token": token,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/fetch_customers`, options);
}

export async function fetch_plants(sort) {
    let json = JSON.stringify({
        "sort": sort,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/fetch_plants`, options);
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
    return await fetchWrapper(`${PREFIX}/fetch_inventory`, options);
}

export async function fetch_inventory_filters() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/fetch_inventory_filters`, options);
}

export async function fetch_inventory_page(skus) {
    let json = JSON.stringify({
        "skus": skus,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/fetch_inventory_page`, options);
}

export async function fetch_gallery() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/fetch_gallery`, options);
}

export async function fetch_image_from_hash(hash) {
    let json = JSON.stringify({
        "hash": hash,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/image_hash`, options);
}

export async function fetch_image_from_sku(sku) {
    let json = JSON.stringify({
        "sku": sku,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/image_sku`, options);
}

export async function fetch_image_thumbnails(hashes) {
    let json = JSON.stringify({
        "hashes": hashes,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/image_thumbnails`, options);
}

export async function upload_gallery_images(formData) {
    let options = {
        body: formData,
        method: 'post',
    }
    return await fetchWrapper(`${PREFIX}/upload_gallery_image`, options);
}

export async function upload_availability(formData) {
    let options = {
        body: formData,
        method: 'post',
    }
    return await fetchWrapper(`${PREFIX}/upload_availavility`, options);
}

export async function fetch_contact_info() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/fetch_contact_info`, options);
}

export async function update_contact_info(data) {
    let json = JSON.stringify({
        "data": data,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/update_contact_info`, options);
}

export async function fetch_profile_info(session) {
    console.log('FETCHING PROFILE INFO', session)
    let json = JSON.stringify(session);
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper(`${PREFIX}/fetch_profile_info`, options);
}

export async function set_like_sku(email, token, sku, liked) {
    console.log('SET LIKE SKU', liked)
    let json = JSON.stringify({
        "email": email,
        "token": token,
        "sku": sku,
        "liked": liked
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/set_like_sku`, options);
}

export async function set_sku_in_cart(email, token, sku, operation, quantity) {
    let json = JSON.stringify({
        "email": email,
        "token": token,
        "sku": sku,
        "operation": operation,
        "quantity": quantity
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/set_sku_in_cart`, options);
}

export async function modify_sku(email, token, sku, operation, data) {
    let json = JSON.stringify({
        "email": email,
        "token": token,
        "sku": sku,
        "operation": operation,
        "data": data
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/modify_sku`, options);
}

export async function modify_user(email, token, id, operation) {
    let json = JSON.stringify({
        "email": email,
        "token": token,
        "id": id,
        "operation": operation
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/modify_user`, options);
}

export async function submit_order(email, token) {
    let json = JSON.stringify({
        "email": email,
        "token": token
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/submit_order`, options);
}