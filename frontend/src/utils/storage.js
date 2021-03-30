// Handles storing and retrieving data from local storage
// TODO invalidate items after a while

import PubSub from './pubsub';
import { LOCAL_STORAGE } from 'utils/consts';
import { deepEqual, isString } from 'utils/typeChecking';
import * as http from 'query/http_promises';
import { lightTheme, darkTheme } from './theme';

export function setTheme(themeString) {
    if (themeString !== 'light' && themeString !== 'dark')
        themeString = 'light';
    storeItem(LOCAL_STORAGE.Theme, themeString);
}

export function getTheme() {
    let themeString = localStorage.getItem(LOCAL_STORAGE.Theme);
    if (themeString === 'dark')
        return darkTheme;
    return lightTheme;
}

export const getLikes = () => {
    let data = getItem(LOCAL_STORAGE.Likes);
    if (Array.isArray(data)) return data;
    //If cart not found, attempt to query backend
    let session = getSession();
    if (!session) return null;
    http.getLikes(session).then(response => {
        storeItem(LOCAL_STORAGE.Likes, response.likes);
        return response.likes;
    }).catch(err => {
        console.error(err);
    }).finally(() => {
        return null;
    })
}

export const getCart = () => {
    let data = getItem(LOCAL_STORAGE.Cart);
    if (data) return data;
    //If cart not found, attempt to query backend
    let session = getSession();
    if (!session) return null;
    http.getCart(session).then(response => {
        storeItem(LOCAL_STORAGE.Cart, response.cart, true);
        return response.cart;
    }).catch(err => {
        console.error(err);
    }).finally(() => {
        return null;
    })
}

export const getRoles = () => {
    return getItem(LOCAL_STORAGE.Roles);
}

export const getSession = () => {
    return getItem(LOCAL_STORAGE.Session);
}

export const storeItem = (key, value, forceUpdate=false) => {
    // If JSON was passed in instead of an object
    if (isString(value) && value.length > 0 && value[0] === '{') {
        try {
            value = JSON.parse(value)
        } catch (e) { }
    }
    if (!forceUpdate && deepEqual(getItem(key), value)) return;
    localStorage.setItem(key, JSON.stringify(value));
    PubSub.publish(key, value);
}

export const getItem = (key) => {
    let data = localStorage.getItem(key);
    try {
        return data ? JSON.parse(data) : null;
    } catch(err) {
        console.error(err);
        return null;
    }
}

export const clearStorage = () => {
    let values_to_clear = Object.values(LOCAL_STORAGE);
    values_to_clear.forEach(entry => {
        localStorage.setItem(entry, null);
        PubSub.publish(entry, null);
    })
}