import { useHistory } from 'react-router-dom';
import { get_token, create_user } from '../utils/http_functions';

const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
const LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE';
const LOGOUT_USER = 'LOGOUT_USER';

const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
const REGISTER_USER_FAILURE = 'REGISTER_USER_FAILURE';

const FETCH_PROTECTED_DATA_REQUEST = 'FETCH_PROTECTED_DATA_REQUEST';
const RECEIVE_PROTECTED_DATA = 'RECEIVE_PROTECTED_DATA';

export function checkJWT() {
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
    return {
        type: LOGIN_USER_SUCCESS,
        token: token,
        status: status
    };
}

export function loginUserFailure(error, status) {
    console.log('removing token3');
    localStorage.removeItem('token');
    return {
        type: LOGIN_USER_FAILURE,
        error: error,
        status: status
    };
}

export function logout() {
    console.log('removing token2');
    localStorage.removeItem('token');
    return {
        type: LOGOUT_USER,
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
                        resolve(loginUserFailure(data.error, data.status));
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
    return {
        type: REGISTER_USER_SUCCESS,
        token: token,
        status: status
    };
}

export function registerUserFailure(error, status) {
    console.log('removing token1');
    localStorage.removeItem('token');
    return {
        type: REGISTER_USER_FAILURE,
        error: error,
        status: status
    };
}

export function registerUser(name, email, password) {
    return new Promise(function (resolve, reject) {
        let returnStatus;
        try {
            create_user(name, email, password)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if (data.status == 200) {
                            returnStatus = registerUserSuccess(data.token, data.status);
                        } else {
                            returnStatus = registerUserFailure(data.error, data.status);
                        }
                        resolve(returnStatus);
                    })
                });
        } catch (error) {
            console.log(error);
            reject(registerUserFailure(999, error));
        }
    });
}
