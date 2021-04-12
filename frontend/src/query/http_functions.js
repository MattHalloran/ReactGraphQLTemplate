const IP = 'http://192.168.0.10:5000';//https://newlifenurseryinc.com';
// URL prefix used to signify calls to backend
const PREFIX = 'api';
// API version
const VERSION = 'v1';
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
async function fetchWrapper(route, httpParams) {
    try {
        let response = await fetch(`${IP}/${PREFIX}/${VERSION}/${route}`, httpParams);
        let json = await response.json();
        return json;
    } catch (err) {
        console.error(err);
        return err;
    }
}

export async function validate_token(session) {
    let json = JSON.stringify({
        session: session
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper('validate_token', options);
}

export async function register(data) {
    let json = JSON.stringify({
        "data": data
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper('register', options);
}

// verificationCode is optional. Used to verify email
export async function login(email, password, verificationCode) {
    let json = JSON.stringify({
        "email": email.toLowerCase(),
        "password": password,
        "verificationCode": verificationCode ?? ''
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include',
    }
    return await fetchWrapper('login', options);
}

export async function send_password_reset_request(email) {
    let json = JSON.stringify({
        "email": email.toLowerCase(),
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('reset_password_request', options);
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
    return await fetchWrapper('fetch_unused_plants', options);
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
    return await fetchWrapper('fetch_inventory', options);
}

export async function fetch_inventory_filters() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('fetch_inventory_filters', options);
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
    return await fetchWrapper('fetch_inventory_page', options);
}

export async function fetch_gallery() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('fetch_gallery', options);
}

export async function update_gallery(session, data) {
    let json = JSON.stringify({
        "session": session,
        "data": data,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('update_gallery', options);
}

export async function upload_gallery_images(formData) {
    let options = {
        body: formData,
        method: 'post',
    }
    return await fetchWrapper('upload_gallery_image', options);
}

export async function upload_availability(formData) {
    let options = {
        body: formData,
        method: 'post',
    }
    return await fetchWrapper('upload_availability', options);
}

export async function fetch_contact_info() {
    let options = {
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('fetch_contact_info', options);
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
    return await fetchWrapper('update_contact_info', options);
}

export async function fetch_profile_info(session, tag) {
    let json = JSON.stringify({
        "session": session,
        "tag": tag,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper('fetch_profile_info', options);
}

export async function fetch_likes(session) {
    let json = JSON.stringify({
        "session": session,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper('fetch_likes', options);
}

export async function fetch_cart(session) {
    let json = JSON.stringify({
        "session": session,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.ApplicatonJsonAccept,
        credentials: 'include',
    }
    return await fetchWrapper('fetch_cart', options);
}

export async function set_like_sku(session, sku, liked) {
    let json = JSON.stringify({
        "session": session,
        "sku": sku,
        "liked": liked
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('set_like_sku', options);
}

export async function set_order_status(session, id, status) {
    let json = JSON.stringify({
        "session": session,
        "id": id,
        "status": status,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('set_order_status', options);
}

export async function update_cart(session, who, cart) {
    let json = JSON.stringify({
        "session": session,
        "who": who,
        "cart": cart,
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('update_cart', options);
}

export async function modify_sku(session, sku, operation, data) {
    let json = JSON.stringify({
        "session": session,
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

export async function modify_plant(session, operation, data) {
    let json = JSON.stringify({
        "session": session,
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

export async function modify_user(session, id, operation) {
    let json = JSON.stringify({
        "session": session,
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

export async function submit_order(session, cart) {
    let json = JSON.stringify({
        "session": session,
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

export async function fetch_orders(session, status) {
    let json = JSON.stringify({
        "session": session,
        "status": status
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('fetch_orders', options);
}

export async function fetch_image(id, size) {
    let json = JSON.stringify({
        "id": id,
        "size": size
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('fetch_image', options);
}

export async function fetch_images(ids, size) {
    let json = JSON.stringify({
        "ids": ids,
        "size": size
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
    }
    return await fetchWrapper('fetch_images', options);
}

export async function update_profile(session, data) {
    let json = JSON.stringify({
        "session": session,
        "data": data
    });
    let options = {
        body: json,
        method: 'post',
        headers: HEADERS.Text,
        credentials: 'include'
    }
    return await fetchWrapper('update_profile', options);
}