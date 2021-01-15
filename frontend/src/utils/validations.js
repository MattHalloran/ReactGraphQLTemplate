export const emailValidation = email => {
  if (email === null || email === undefined || email.length === 0) return 'Email is required';
  if (
    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
      email,
    )
  ) {
    return null;
  }
  if (email.trim() === '') {
    return 'Email is required';
  }
  return 'Please enter a valid email';
}

const defaultStringValidation = (str, word) => {
  return (str === null || str === undefined || str.length === 0) ? `Must enter ${word}` : null;
}

export const firstNameValidation = name => {
  return defaultStringValidation('first name', name);
}

export const lastNameValidation = name => {
  return defaultStringValidation('last name', name);
}

//TODO make more robust
export const nameValidation = name => {
  return defaultStringValidation('Name', name);
}

export const pronounValidation = pronouns => {
  return defaultStringValidation('Pronouns', pronouns);
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;

//TODO make more robust
export const passwordValidation = password => {
  if (password === null || password === undefined ||
    password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return `Must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`;
  }
  return null;
}

// TODO make more robust
export const addressValidation = address => {
  return defaultStringValidation('address', address);
}

// TODO make more robust
export const phoneNumberValidation = phone => {
  return defaultStringValidation('phone number', phone);
}