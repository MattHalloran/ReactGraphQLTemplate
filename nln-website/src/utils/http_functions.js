/* eslint camelcase: 0 */

import axios from 'axios';

const tokenConfig = (token) => ({
    headers: {
        'Authorization': token, // eslint-disable-line quote-props
    },
});

export function validate_token(token) {
    return axios.post('/api/is_token_valid', {
        token,
    });
}

export function get_github_access() {
    window.open(
        '/github-login',
        '_blank' // <- This is what makes it open in a new window.
    );
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

export function has_github_token(token) {
    return axios.get('/api/has_github_token', tokenConfig(token));
}

export function data_about_user(token) {
    return axios.get('/api/user', tokenConfig(token));
}
