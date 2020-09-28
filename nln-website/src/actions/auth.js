import { useHistory } from 'react-router-dom';
import { get_token, create_user } from '../utils/http_functions';

const LOGIN_USER_SUCCESS = 'LOGIN_USER_SUCCESS';
const LOGIN_USER_FAILURE = 'LOGIN_USER_FAILURE';
const LOGIN_USER_REQUEST = 'LOGIN_USER_REQUEST';
const LOGOUT_USER = 'LOGOUT_USER';

const REGISTER_USER_SUCCESS = 'REGISTER_USER_SUCCESS';
const REGISTER_USER_FAILURE = 'REGISTER_USER_FAILURE';
const REGISTER_USER_REQUEST = 'REGISTER_USER_REQUEST';

const FETCH_PROTECTED_DATA_REQUEST = 'FETCH_PROTECTED_DATA_REQUEST';
const RECEIVE_PROTECTED_DATA = 'RECEIVE_PROTECTED_DATA';


export function loginUserSuccess(token) {
    localStorage.setItem('token', token);
    return {
        type: LOGIN_USER_SUCCESS,
        payload: {
            token,
        },
    };
}


export function loginUserFailure(error) {
    localStorage.removeItem('token');
    return {
        type: LOGIN_USER_FAILURE,
        payload: {
            status: error.response.status,
            statusText: error.response.statusText,
        },
    };
}

export function loginUserRequest() {
    return {
        type: LOGIN_USER_REQUEST,
    };
}

export function logout() {
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
    return function (dispatch) {
        dispatch(loginUserRequest());
        return get_token(email, password)
            .then(response => {
                try {
                    let history = useHistory();
                    dispatch(loginUserSuccess(response.token));
                    history.push('/main');
                } catch (e) {
                    alert(e);
                    dispatch(loginUserFailure({
                        response: {
                            status: 403,
                            statusText: 'Invalid token',
                        },
                    }));
                }
            })
            .catch(error => {
                dispatch(loginUserFailure({
                    response: {
                        status: 403,
                        statusText: 'Invalid username or password',
                    },
                }));
            });
    };
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
                    response.json()
                    .then(data => {
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
