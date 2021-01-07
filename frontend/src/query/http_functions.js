
export function validate_token(token) {
    return new Promise(function (resolve, reject) {
        fetch('/api/is_token_valid', {
            method: 'post',
            credentials: 'include',
            headers: {
                'Accept': 'application/json', // eslint-disable-line quote-props
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    }); 
}

export function create_user(name, email, password, existing_customer) {
    return new Promise(function (resolve, reject) {
        fetch('/api/register', {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "name": name,
                "email": email,
                "password": password,
                "existing_customer": existing_customer
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    }); 
}

export function get_token(email, password) {
    return new Promise(function (resolve, reject) {
        fetch('/api/get_token', {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    }); 
}

export function send_password_reset_request(email) {
    return new Promise(function (resolve, reject) {
        fetch('/api/reset_password_request', {
            method: "POST",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "email": email
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}

export function fetch_inventory(filter_by) {
    return new Promise(function (resolve, reject) {
        fetch('/api/fetch_inventory', {
            method: "POST",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "filter_by": filter_by
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}

export function fetch_inventory_page(item_ids) {
    return new Promise(function (resolve, reject) {
        fetch('/api/fetch_inventory_page', {
            method: "POST",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "ids": item_ids
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}

export function fetch_gallery() {
    return new Promise(function (resolve, reject) {
        fetch('/api/fetch_gallery', {
            method: "POST",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' }
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}

export function fetch_image(hash) {
    return new Promise(function (resolve, reject) {
        fetch('/api/image', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "hash": hash
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}

export function fetch_image_thumbnails(hashes) {
    return new Promise(function (resolve, reject) {
        fetch('/api/image_thumbnails', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "hashes": hashes
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        });
    });
}

export function upload_gallery_images(formData) {
    return new Promise(function (resolve, reject) {
        fetch('/api/upload_gallery_image/', {
            method: "POST",
            body: formData
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}

export function update_contact_info(data, token) {
    return new Promise(function (resolve, reject) {
        fetch('/api/update_contact_info', {
            method: "POST",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "data": data,
                "token": token
            })
        }).then((response) => {
            resolve(response);
        }).catch((error) => {
            reject(error);
        })
    });
}