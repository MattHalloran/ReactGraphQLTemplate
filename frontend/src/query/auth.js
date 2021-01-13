import { useHistory } from 'react-router-dom';
import { get_token, create_user, send_password_reset_request, validate_token } from './http_functions';
import PubSub from '../utils/pubsub';
import { setTheme } from '../theme';
import { StatusCodes } from './status';
import _ from 'lodash';
import { LOCAL_STORAGE, PUBS, LINKS } from 'consts';
// import { useRadioGroup } from '@material-ui/core';

export const ROLES = {
    UNLOCKED: 1,
    WAITING_APPROVAL: 2,
    SOFT_LOCK: 3,
    HARD_LOCK: 4,
}

function setToken(token) {
    localStorage.setItem(LOCAL_STORAGE.Token, token);
    PubSub.publish(PUBS.Token, token);
}

function setRoles(roles) {
    localStorage.setItem(LOCAL_STORAGE.Roles, JSON.stringify(roles));
    PubSub.publish(PUBS.Roles, roles);
}

export function checkCookies() {
    return new Promise(function (resolve, reject) {
        let roles = localStorage.getItem(LOCAL_STORAGE.Roles);
        console.log('ROLES ARE......', roles);
        if (roles) setRoles(JSON.parse(roles));
        console.log('GETTTING TOKEN FROM LOCAL STORAGE', LOCAL_STORAGE.Token)
        let token = localStorage.getItem(LOCAL_STORAGE.Token);
        console.log('TOKEN ISSSSSS', token);
        if (!token) {
            reject(loginUserFailure(StatusCodes.FAILURE_NOT_VERIFIED));
        } else {
            validate_token(token).then(data => {
                if (data.ok) {
                    console.log('SETTING TOKENNNNNN', token)
                    setToken(token);
                    resolve(data);
                } else {
                    setToken(null);
                    reject(data);
                }
            })
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
        history.push(LINKS.Home);
    };
}

export function loginUser(email, password) {
    return new Promise(function (resolve, reject) {
        get_token(email, password).then(data => {
            if (data.ok) {
                login(token, user);
                resolve(data);
            } else {
                logout();
                switch (data.status) {
                    case StatusCodes.FAILURE_NO_USER:
                        data.error = "Email or password incorrect. Please try again.";
                        break;
                    case StatusCodes.FAILURE_SOFT_LOCKOUT:
                        data.error = "Incorrect password entered too many times. Please try again in 15 minutes";
                        break;
                    case StatusCodes.FAILURE_HARD_LOCKOUT:
                        data.error = "Account locked. Please contact us";
                        break;
                    default:
                        data.error = "Unknown error occurred. Please try again";
                        break;
                }
                reject(data);
            }
        })
    });
}

export function registerUser(name, email, password, existing_customer) {
    return new Promise(function (resolve, reject) {
        create_user(name, email, password, existing_customer).then(data => {
            if (data.ok) {
                login(data.token, data.user);
                resolve(data);
            } else {
                logout();
                if (status === StatusCodes.FAILURE_EMAIL_EXISTS) {
                    data.error = "User with that email already exists. If you would like to reset your password, TODO";
                } else {
                    data.error = "Unknown error occurred. Please try again";
                }
                reject(data);
            }
        })
    });
}

export function resetPasswordRequest(email) {
    return new Promise(function (resolve, reject) {
        send_password_reset_request(email).then(data => {
            if (data.ok) {
                resolve(data);
            } else {
                reject(data);
            }
        })
    });
}