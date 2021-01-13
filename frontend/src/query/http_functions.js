import { StatusCodes } from './status';

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
            console.log('HTTP SUCCESSSSSS', json)
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

export async function create_user(name, email, password, existing_customer) {
    let json = JSON.stringify({
        "name": name,
        "email": email,
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

export async function fetch_inventory(filter_by) {
    let json = JSON.stringify({
        "filter_by": filter_by,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(`${PREFIX}/fetch_inventory`, options);
}

export async function fetch_inventory_page(item_ids) {
    let json = JSON.stringify({
        "ids": item_ids,
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

export async function fetch_image(hash) {
    let json = JSON.stringify({
        "hash": hash,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(`${PREFIX}/image`, options);
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
    return await fetchWrapper(`${PREFIX}/upload_gallery_image/`, options);
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