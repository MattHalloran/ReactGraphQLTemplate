import _ from 'lodash';
import { StatusCodes } from './status';

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

async function fetchWrapper(options) {
    let httpParams = _.omit(options, ['url'])
    try {
        let response = await fetch(options.url, httpParams);
        let json = await response.json();
        if (json.status === StatusCodes.SUCCESS) {
            console.log('HTTP SUCCESSSSSS', json)
            json.ok = true;
            return json;
        }
        console.log('HTTP FAILUREEEEEE', json)
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
        url: '/api/is_token_valid',
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper(options);
}

export async function create_user(name, email, password, existing_customer) {
    let json = JSON.stringify({
        "name": name,
        "email": email,
        "password": password,
        "existing_customer": existing_customer
    });
    let options = {
        url: '/api/register',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper(options);
}

export async function get_token(email, password) {
    let json = JSON.stringify({
        "email": email,
        "password": password
    });
    let options = {
        url: '/api/get_token',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper(options);
}

export async function send_password_reset_request(email) {
    let json = JSON.stringify({
        "email": email,
    });
    let options = {
        url: '/api/reset_password_request',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}

export async function fetch_inventory(filter_by) {
    let json = JSON.stringify({
        "filter_by": filter_by,
    });
    let options = {
        url: '/api/fetch_inventory',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}

export async function fetch_inventory_page(item_ids) {
    let json = JSON.stringify({
        "ids": item_ids,
    });
    let options = {
        url: '/api/fetch_inventory_page',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}

export async function fetch_gallery() {
    let options = {
        url: '/api/fetch_gallery',
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}

export async function fetch_image(hash) {
    let json = JSON.stringify({
        "hash": hash,
    });
    let options = {
        url: '/api/image',
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(options);
}

export async function fetch_image_thumbnails(hashes) {
    let json = JSON.stringify({
        "hashes": hashes,
    });
    let options = {
        url: '/api/image_thumbnails',
        body: json,
        method: 'post',
        headers: HEADERS.ApplicationJson,
    }
    return await fetchWrapper(options);
}

export async function upload_gallery_images(formData) {
    let options = {
        url: '/api/upload_gallery_image/',
        body: formData,
        method: 'post',
    }
    return await fetchWrapper(options);
}

export async function fetch_contact_info() {
    let options = {
        url: '/api/fetch_contact_info',
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}

export async function update_contact_info(data) {
    let json = JSON.stringify({
        "data": data,
    });
    let options = {
        url: '/api/update_contact_info',
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper(options);
}