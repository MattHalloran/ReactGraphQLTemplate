import PubSub from './utils/pubsub';

export const lightTheme = {
    // bodyPrimary: '#557A48',
    bodyPrimary: '#253A18',
    bodySecondary: '#249526',
    textPrimary: '#FFFFFF',
    textSecondary: '#FFFFFF',
    hoverPrimary: '#92817A',
    mobile: '576px',
  }

export const darkTheme = {
  bodyPrimary: '#0D0C1D',
  bodySecondary: '#4A4A4A',
  textPrimary: '#FFFFFF',
  textSecondary: '#D2C8C2',
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
  localStorage.setItem('theme', JSON.stringify(theme));
  PubSub.publish('theme', theme);
}

export function getTheme() {
  try {
    let theme = localStorage.getItem('theme');
    return theme !== null
        ? JSON.parse(theme)
        : lightTheme;
  } catch(err) {
    console.error('Failed trying to get theme from local storage');
    return lightTheme;
  }
}