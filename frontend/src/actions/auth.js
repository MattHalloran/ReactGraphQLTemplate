import { useHistory } from 'react-router-dom';
import { get_token, create_user, send_password_reset_request, validate_token } from '../utils/http_functions';
import PubSub from '../utils/pubsub';
import { setTheme } from '../theme';

export const AUTH_CODES = {
    "REGISTER_SUCCESS": 300,
    "REGISTER_ERROR_EMAIL_EXISTS": 400,
    "REGISTER_ERROR_UNKNOWN": 500,
    "FETCH_PROTECTED_DATA_REQUEST": 600,
    "RECEIVE_PROTECTED_DATA": 700,
    "TOKEN_FOUND": 800,
    "TOKEN_NOT_FOUND_NO_USER": 900,
    "TOKEN_NOT_FOUND_SOFT_LOCKOUT": 910,
    "TOKEN_NOT_FOUND_HARD_LOCKOUT": 920,
    "TOKEN_NOT_FOUND_ERROR_UNKOWN": 1000,
    "RESET_PASSWORD_SUCCESS": 1100,
    "RESET_PASSWORD_ERROR_UNKNOWN": 1200,
    "TOKEN_VERIFIED": 1300,
    "TOKEN_NOT_VERIFIED": 1400
}

export function checkJWT() {
    console.log('checking for JWT...');
    return new Promise(function (resolve, reject) {
        //First, make sure there is a token to check
        let token = localStorage.getItem('token');
        if (!token) {
            reject(loginUserFailure(AUTH_CODES.TOKEN_NOT_VERIFIED));
        } else {
            try {
                validate_token(token).then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if (data.status === AUTH_CODES.TOKEN_VERIFIED) {
                            resolve(loginUserSuccess(token, data.status));
                        } else {
                            reject(loginUserFailure(data.status));
                        }
                    })
                });
            } catch (error) {
                console.log(error);
                reject(loginUserFailure(AUTH_CODES.TOKEN_NOT_VERIFIED));
            }
        }
    });
}

export function logout() {
    console.log('removing token2');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        token: null,
        name: null
    });
    setTheme(null);
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

export function loginUserSuccess(status, token, theme, name) {
    localStorage.setItem('token', token);
    console.log('publishing user token');
    PubSub.publish('User', {
        token: token,
        name: name
    });
    setTheme(theme);
    return {
        token: token,
        status: status
    };
}

export function loginUserFailure(status) {
    console.log('removing token3');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        token: null,
        name: null
    });
    setTheme(null);
    let error;
    switch(status) {
        case AUTH_CODES.TOKEN_NOT_FOUND_NO_USER:
            error = "Email or password incorrect. Please try again.";
            break;
        case AUTH_CODES.TOKEN_NOT_FOUND_SOFT_LOCKOUT:
            error = "Incorrect password entered too many times. Please try again in 15 minutes";
            break;
        case AUTH_CODES.TOKEN_NOT_FOUND_HARD_LOCKOUT:
            error = "Account locked. Please contact us";
            break;
        default:
            error = "Unknown error occurred. Please try again";
            break;
    }
    return {
        error: error,
        status: status
    };
}

export function loginUser(email, password) {
    return new Promise(function (resolve, reject) {
        try {
            get_token(email, password).then(response => {
                response.json().then(data => {
                    console.log(data);
                    if (data.status === AUTH_CODES.TOKEN_FOUND) {
                        resolve(loginUserSuccess(data.status, data.token, data.theme, data.name));
                    } else {
                        reject(loginUserFailure(data.status));
                    }
                })
            });
        } catch (error) {
            console.log(error);
            reject(loginUserFailure(AUTH_CODES.TOKEN_NOT_FOUND_ERROR_UNKOWN));
        }
    });
}

export function registerUserSuccess(status, token, theme, name) {
    localStorage.setItem('token', token);
    console.log('publishing user token');
    PubSub.publish('User', {
        token: token,
        name: name
    });
    setTheme(theme);
    return {
        token: token,
        status: status
    };
}

export function registerUserFailure(status) {
    console.log('removing token1');
    localStorage.removeItem('token');
    PubSub.publish('User', {
        token: null,
        name: null
    });
    setTheme(null);
    let error;
    if(status === AUTH_CODES.REGISTER_ERROR_EMAIL_EXISTS) {
        error = "User with that email already exists. If you would like to reset your password, TODO";
    } else {
        error = "Unknown error occurred. Please try again";
    }
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
                        if (data.status === AUTH_CODES.REGISTER_SUCCESS) {
                            resolve(registerUserSuccess(data.status, data.token, data.theme, data.name));
                        } else {
                            reject(registerUserFailure(data.status));
                        }
                    })
                });
        } catch (error) {
            console.error(error);
            reject(registerUserFailure(AUTH_CODES.REGISTER_ERROR_UNKNOWN));
        }
    });
}

export function resetPasswordSuccess(status) {
    return {
        status: status
    };
}

export function resetPasswordFailure(status) {
    return {
        status: status
    };
}

export function resetPasswordRequest(email) {
    return new Promise(function (resolve, reject) {
        try {
            send_password_reset_request(email)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if(data.status === AUTH_CODES.RESET_PASSWORD_SUCCESS) {
                            resolve(resetPasswordSuccess(data.status))
                        } else {
                            reject(resetPasswordFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(resetPasswordFailure(AUTH_CODES.RESET_PASSWORD_ERROR_UNKNOWN));
        }
    });
}