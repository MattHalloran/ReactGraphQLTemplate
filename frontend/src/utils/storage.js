// Handles storing and retrieving data from local storage
// TODO invalidate items after a while

import PubSub from './pubsub';
import { LOCAL_STORAGE, PUBS } from 'utils/consts';
import { deepEqual, isString } from 'utils/typeChecking';
import * as http from 'query/http_promises';
import { light } from '@material-ui/core/styles/createPalette';
import { deleteObjectKey } from './objectTools';
import { deleteArrayObject } from './arrayTools';

export const darkTheme = {
    // bodyPrimary: '#253A18', //dark green
    // bodySecondary: '#249526', //light green
    // textPrimary: '#F4F3EE', //off-white
    // textSecondary: '#BCB8B1', //off-grey
    // headerPrimary: '#34252F',
    // hoverPrimary: '#92817A',
    isLight: false,
    backgroundColor: '#1f1d1d',
    primaryColor: '#254436',
    lightPrimaryColor: '#565656',
    darkPrimaryColor: '#1c2d25',
    accentColor: '#2ea970',
    cardColor: '#05581f',
    primaryText: '#EEEEEE',
    headerText: '#EEEEEE',
    secondaryText: '#b9d2d2',
    iconColor: '#EEEEEE',
    dividerColor: '#b9d2d2',
    mobile: '576px',
}

export const lightTheme = {
    // bodyPrimary: '#0D0C1D',
    // bodySecondary: '#4A4A4A',
    // textPrimary: '#FFFFFF',
    // textSecondary: '#D2C8C2',
    // headerPrimary: 'aliceblue',
    // hoverPrimary: '#EEEEEE',
    isLight: true,
    backgroundColor: '#d3d8d7',
    primaryColor: '#3d921a',
    lightPrimaryColor: '#48bf2a',
    darkPrimaryColor: '#1E7E26',
    accentColor: '#3549d8',
    cardColor: '#1E7E26',
    primaryText: '#212121',
    headerText: '#EEEEEE',
    secondaryText: '#757575',
    iconColor: '#212121',
    dividerColor: '#BDBDBD',
    mobile: '576px',
}

export const themes = {
    lightTheme: lightTheme,
    darkTheme: darkTheme
}

export function setTheme(themeString) {
    switch (themeString) {
        case 'dark':
            console.log('STORING DARK!!!!!')
            storeItem(LOCAL_STORAGE.Theme, darkTheme);
            break;
        default:
            console.log('STIRING LIGHT!!!!', themeString)
            storeItem(LOCAL_STORAGE.Theme, lightTheme)
            break;
    }
}

export function getTheme() {
    try {
        let theme = localStorage.getItem(LOCAL_STORAGE.Theme);
        // Make sure theme contains the correct data
        if (theme !== null && theme !== undefined) {
            theme = JSON.parse(theme)
            if (theme !== null) {
                let expected_keys = Object.keys(lightTheme).sort()
                let stored_keys = Object.keys(theme).sort()
                if (JSON.stringify(expected_keys) === JSON.stringify(stored_keys)) {
                    return theme;
                }
            }
        }
        storeItem(LOCAL_STORAGE.Theme, lightTheme);
        return lightTheme;
    } catch (err) {
        console.error('Failed trying to get theme from local storage', err);
        storeItem(LOCAL_STORAGE.Theme, lightTheme);
        return lightTheme;
    }
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
        storeItem(LOCAL_STORAGE.Cart, response.cart);
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
    console.log("STORING ITEMMMM", key, value);
    localStorage.setItem(key, JSON.stringify(value));
    PubSub.publish(key, value);
}

export const getItem = (key) => {
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

export const clearStorage = () => {
    // Theme will be set to lightTheme instead of null
    let values_to_clear = deleteArrayObject(Object.values(LOCAL_STORAGE), LOCAL_STORAGE.Theme);
    values_to_clear.forEach(entry => {
        localStorage.setItem(entry, null);
        PubSub.publish(entry, null);
    })
    setTheme('light');
}