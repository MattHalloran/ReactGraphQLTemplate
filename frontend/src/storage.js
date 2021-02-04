// Handles storing and retrieving data from local storage

import PubSub from './utils/pubsub';
import { LOCAL_STORAGE, PUBS } from 'consts';

export const lightTheme = {
    // bodyPrimary: '#557A48',
    bodyPrimary: '#253A18',
    bodySecondary: '#249526',
    textPrimary: '#FFFFFF',
    textSecondary: '#FFFFFF',
    containerPrimary: 'pink',
    hoverPrimary: '#92817A',
    mobile: '576px',
  }

export const darkTheme = {
  bodyPrimary: '#0D0C1D',
  bodySecondary: '#4A4A4A',
  textPrimary: '#FFFFFF',
  textSecondary: '#D2C8C2',
  containerPrimary: 'aliceblue',
  hoverPrimary: '#EEEEEE',
  mobile: '576px',
}

export const themes = {
  lightTheme: lightTheme,
  darkTheme: darkTheme
}

export function setTheme(themeString) {
  let theme;
  switch(themeString) {
    case 'dark':
      theme = darkTheme;
      break;
    default:
      theme = lightTheme;
      break;
  }
  localStorage.setItem(LOCAL_STORAGE.Theme, JSON.stringify(theme));
  PubSub.publish(PUBS.Theme, theme);
}

export function getTheme() {
  try {
    let theme = localStorage.getItem(LOCAL_STORAGE.Theme);
    // Make sure theme contains the correct data
    if (theme !== null && theme !== undefined) {
      theme = JSON.parse(theme)
      let expected_keys = Object.keys(lightTheme).sort()
      let stored_keys = Object.keys(theme).sort()
      if (JSON.stringify(expected_keys) === JSON.stringify(stored_keys)) {
        return theme;
      }
    }
  } catch(err) {
    console.error('Failed trying to get theme from local storage', err);
  } finally {
    localStorage.setItem(LOCAL_STORAGE.Theme, JSON.stringify(lightTheme));
    return lightTheme;
  }
}

export const storeItem = (key, value) => {
  // If JSON was passed in instead of an object
  if (value instanceof String && value.length > 0 && value[0] === '{') {
    try {
      value = JSON.parse(value)
    } catch(e){}
  }
  localStorage.setItem(key, JSON.stringify(value));
  PubSub.publish(key, value);
}

export const getItem = (key) => {
  let data = localStorage.getItem(key)
  return data ? JSON.parse(data) : null;
}

export const clearStorage = () => {
  Object.values(LOCAL_STORAGE).forEach(entry => {
    localStorage.setItem(entry, null);
  })
}