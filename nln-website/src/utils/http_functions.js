
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

export function create_user(name, email, password) {
    return new Promise(function (resolve, reject) {
        fetch('api/register', {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            body: JSON.stringify({
                "name": name,
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

export function get_token(email, password) {
    return new Promise(function (resolve, reject) {
        fetch('api/get_token', {
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
        fetch('api/reset_password_request', {
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