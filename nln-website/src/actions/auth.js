import { useHistory } from 'react-router-dom';
import { get_token, create_user, send_password_reset_request } from '../utils/http_functions';
import PubSub from '../utils/pubsub';

export const AUTH_CODES = {
    "LOGIN_SUCCESS": 100,
    "LOGIN_ERROR_UNKNOWN": 200,
    "REGISTER_SUCCESS": 300,
    "REGISTER_ERROR_EMAIL_EXISTS": 400,
    "REGISTER_ERROR_UNKNOWN": 500,
    "FETCH_PROTECTED_DATA_REQUEST": 600,
    "RECEIVE_PROTECTED_DATA": 700,
    "TOKEN_FOUND": 800,
    "TOKEN_NOT_FOUND_NO_USER": 900,
    "TOKEN_NOT_FOUND_ERROR_UNKOWN": 1000,
    "RESET_PASSWORD_SUCCESS": 1100,
    "RESET_PASSWORD_ERROR_UNKNOWN": 1200,
    "TOKEN_VERIFIED": 1300,
    "TOKEN_NOT_VERIFIED": 1400
}

export function checkJWT() {
    console.log('checking for JWT...');
    return new Promise(function (resolve, reject) {
        const token = localStorage.getItem('token');
        if (!token) {
            reject(loginUserFailure('no token'));
        } else {
            fetch('/api/is_token_valid', {
                method: 'post',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json', // eslint-disable-line quote-props
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            })
                .then(res => {
                    if (res.status === 200) {
                        console.log('found jwt');
                        resolve(loginUserSuccess(token));
                    } else {
                        reject(loginUserFailure('invalid token'));
                    }
                }).catch(() => {
                    reject(loginUserFailure('failed to validate token'));
                });
        }
    });
}

export function loginUserSuccess(token, status) {
    localStorage.setItem('token', token);
    console.log('publishing user token');
    PubSub.publish('User', {
        email: 'todo',
        token: token
    });
    return {
        token: token,
        status: status
    };
}

export function loginUserFailure(error, status) {
    console.log('removing token3');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        email: null,
        token: null
    });
    return {
        error: error,
        status: status
    };
}

export function logout() {
    console.log('removing token2');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        email: null,
        token: null
    });
    return {
    };
}

export function logoutAndRedirect() {
    return (dispatch) => {
        let history = useHistory();
        dispatch(logout());
        history.push('/');
    };
}

export function redirectToRoute(route) {
    return () => {
        let history = useHistory();
        history.push(route);
    };
}

export function loginUser(email, password) {
    return new Promise(function (resolve, reject) {
        try {
            get_token(email, password).then(response => {
                response.json().then(data => {
                    console.log(data);
                    if (data.status == 200) {
                        resolve(loginUserSuccess(data.token, data.status));
                    } else {
                        reject(loginUserFailure(data.error, data.status));
                    }
                })
            });
        } catch (error) {
            console.log(error);
            reject(loginUserFailure(999, error));
        }
    });
}

export function registerUserSuccess(token, status) {
    localStorage.setItem('token', token);
    console.log('publishing user token');
    PubSub.publish('User', {
        email: 'todo',
        token: token
    });
    return {
        token: token,
        status: status
    };
}

export function registerUserFailure(error, status) {
    console.log('removing token1');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        email: null,
        token: null
    });
    return {
        error: error,
        status: status
    };
}

export function registerUser(name, email, password) {
    return new Promise(function (resolve, reject) {
        try {
            create_user(name, email, password)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if (data.status == 200) {
                            resolve(registerUserSuccess(data.token, data.status));
                        } else {
                            reject(registerUserFailure(data.error, data.status));
                        }
                    })
                });
        } catch (error) {
            console.error(error);
            reject(registerUserFailure(999, error));
        }
    });
}

export function resetPasswordRequest(email) {
    return new Promise(function (resolve, reject) {
        try {
            send_password_reset_request(email)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status == 200) {
                            resolve('woop success')
                        } else {
                            reject('uh oh spaghetti o')
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject('Failed to send reset password email');
        }
    });
}