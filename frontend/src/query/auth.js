import { useHistory } from 'react-router-dom';
import { get_token, create_user, send_password_reset_request, validate_token } from './http_functions';
import PubSub from '../utils/pubsub';
import { setTheme } from '../theme';
import { StatusCodes } from './constants';
// import { useRadioGroup } from '@material-ui/core';

export const ROLES = {
    UNLOCKED: 1,
    WAITING_APPROVAL: 2,
    SOFT_LOCK: 3,
    HARD_LOCK: 4,
}

function setToken(token) {
    localStorage.setItem('token', token);
    PubSub.publish('token', token);
}

function setRoles(roles) {
    localStorage.setItem('roles', JSON.stringify(roles));
    PubSub.publish('roles', roles);
}

export function checkCookiesSuccess(token, status) {
    setToken(token);
    return {
        token: token,
        status: status
    };
}

export function checkCookiesFailure(status) {
    setToken(null);
    return {
        token: null,
        status: status
    };
}

export function checkCookies() {
    return new Promise(function (resolve, reject) {
        try {
            let roles = localStorage.getItem('roles');
            if (roles !== null) {
                setRoles(JSON.parse(roles));
            }
            let token = localStorage.getItem('token');
            if (!token) {
                reject(loginUserFailure(StatusCodes.TOKEN_NOT_VERIFIED));
            } else {
                validate_token(token).then(response => {
                    response.json().then(data => {
                        if (data.status === StatusCodes.TOKEN_VERIFIED) {
                            resolve(checkCookiesSuccess(token, data.status));
                        } else {
                            reject(checkCookiesFailure(data.status));
                        }
                    })
                });
            }
        } catch (error) {
            console.log(error);
            reject(checkCookiesFailure(StatusCodes.TOKEN_NOT_VERIFIED));
        }
    });
}

export function login(token, user) {
    setToken(token);
    setRoles(user.roles);
    setTheme(user.theme);
}

export function logout() {
    setToken(null);
    setRoles(null);
    setTheme(null);
}

export function logoutAndRedirect() {
    return (dispatch) => {
        let history = useHistory();
        dispatch(logout());
        history.push('/');
    };
}

export function loginUserSuccess(status, token, user) {
    login(token, user);
    return {
        token: token,
        status: status
    };
}

export function loginUserFailure(status) {
    logout();
    let error;
    switch (status) {
        case StatusCodes.TOKEN_NOT_FOUND_NO_USER:
            error = "Email or password incorrect. Please try again.";
            break;
        case StatusCodes.TOKEN_NOT_FOUND_SOFT_LOCKOUT:
            error = "Incorrect password entered too many times. Please try again in 15 minutes";
            break;
        case StatusCodes.TOKEN_NOT_FOUND_HARD_LOCKOUT:
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
                    if (data.status === StatusCodes.TOKEN_FOUND) {
                        resolve(loginUserSuccess(data.status, data.token, data.user));
                    } else {
                        reject(loginUserFailure(data.status));
                    }
                })
            });
        } catch (error) {
            console.log(error);
            reject(loginUserFailure(StatusCodes.TOKEN_NOT_FOUND_ERROR_UNKOWN));
        }
    });
}

export function registerUserSuccess(status, token, user) {
    login(token, user);
    return {
        token: token,
        status: status
    };
}

export function registerUserFailure(status) {
    logout();
    let error;
    if (status === StatusCodes.REGISTER_ERROR_EMAIL_EXISTS) {
        error = "User with that email already exists. If you would like to reset your password, TODO";
    } else {
        error = "Unknown error occurred. Please try again";
    }
    return {
        error: error,
        status: status
    };
}

export function registerUser(name, email, password, existing_customer) {
    return new Promise(function (resolve, reject) {
        try {
            create_user(name, email, password, existing_customer)
                .then(response => {
                    response.json().then(data => {
                        console.log(data);
                        if (data.status === StatusCodes.REGISTER_SUCCESS) {
                            resolve(registerUserSuccess(data.status, data.token, data.theme, data.name));
                        } else {
                            reject(registerUserFailure(data.status));
                        }
                    })
                });
        } catch (error) {
            console.error(error);
            reject(registerUserFailure(StatusCodes.REGISTER_ERROR_UNKNOWN));
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
                        if (data.status === StatusCodes.RESET_PASSWORD_SUCCESS) {
                            resolve(resetPasswordSuccess(data.status))
                        } else {
                            reject(resetPasswordFailure(data.status))
                        }
                    })
                })
        } catch (error) {
            console.error(error);
            reject(resetPasswordFailure(StatusCodes.RESET_PASSWORD_ERROR_UNKNOWN));
        }
    });
}