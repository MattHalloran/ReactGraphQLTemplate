// Contains all validations used by input components
// Many of the validations return the default validation. It is set up
// this way to make changing the behavior for individual input types much easier
import _ from 'underscore';

// Helper function for checking that all validated fields passed
export const passedValidation = (...args) => {
    let any_failed = args.some(arg => {
        if (_.isArray(arg)) {
            // If an array of errors has a value that is not empty
            if (arg.filter(v => v).length > 0)
                return true;
        } else if (_.isString(arg)) {
            if (!isStringBlank(arg))
                return true;
        } else {
            console.warn(`Unsupported value passed to passedValidation: ${arg}`)
            return true;
        }
    })
    console.log('boop', any_failed)
    return !any_failed
}

// =============================== String validations ======================================

const isStringBlank = str => {
    return str === null ||
        str === undefined ||
        str.length === 0 ||
        str.trim() === '';
}

export const emailValidation = email => {
    let defaultValidation = defaultStringValidation('Email', email);
    if (defaultValidation) return defaultStringValidation;
    if (
        /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            email,
        )
    ) {
        return null;
    }
    return 'Please enter a valid email';
}

export const defaultStringValidation = (word, str) => {
    return isStringBlank(str) ? `Must enter ${word}` : null;
}

// Name validation will most likely stick to default validation,
// since names can vary so widely (ex: X Æ A-Xii)
export const firstNameValidation = name => {
    return defaultStringValidation('first name', name);
}

export const lastNameValidation = name => {
    return defaultStringValidation('last name', name);
}

// For now, business names can by anything
export const businessValidation = business => {
    return defaultStringValidation('Business', business);
}

// Might be offensive to validate this...😳
export const pronounValidation = pronouns => {
    return defaultStringValidation('Pronouns', pronouns);
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;

//Returns true if the password is:
//  between min and max length
//  -Has at least one number
//  -Has at least one lower case letter
//  -Has at least one upper case letter
export const passwordValidation = password => {
    if (password === null || password === undefined ||
        password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
        return `Must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`;
    }
    var passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/;
    if (password.match(passRegex)) {
        return null;
    }
    return 'Must have at least one number, upper-case letter, and lower-case letter'
}

export const confirmPasswordValidation = (password, confirmPassword) => {
    return (password !== confirmPassword) ? 'Passwords do not match!' : null;
}

// Street 1 (ex: 123 Fish Street)
// Must be at least three words
export const throughfareValidation = throughfare => {
    return (throughfare.split(' ').length > 2) ? null : 'ex: 123 Fish Street';
}

export const localityValidation = locality => {
    return defaultStringValidation('City', locality);
}

export const administrativeAreaValidation = administrative_area => {
    return defaultStringValidation('State/Province/Region', administrative_area);
}

// ^ = Start of the string.
// \d{5} = Match 5 digits (for condition 1, 2, 3)
// (?:…) = Grouping
// [-\s] = Match a space (for condition 3) or a hyphen (for condition 2)
// \d{4} = Match 4 digits (for condition 2, 3)
// …? = The pattern before it is optional (for condition 1)
// $ = End of the string.
export const postalCodeValidation = postal_code => {
    let defaultValidation = defaultStringValidation('Zip code', postal_code);
    if (defaultValidation) return defaultStringValidation;
    if (
        /^\d{5}(?:[-\s]\d{4})?$/.test(
            postal_code,
        )
    ) {
        return null;
    }
    return 'Please enter a valid zip code';
}

export const countryValidation = country => {
    let defaultValidation = defaultStringValidation('Country', country);
    if (defaultValidation) return defaultStringValidation;
    if (
        /^[A-Z]{3}$/.test(
            country,
        )
    ) {
        return null;
    }
    return 'Please enter a valid country code';
}

// throughfare - Street 1 (ex: 123 Fish Street) | REQUIRED
// premise - Stret 2 (ex: A-113) | Optional
// locality - City | REQUIRED
// administrative_area - State/Province/Region (ex: FL) | REQUIRED
// postal_code - Zip code (ex: 90210) | REQUIRED
// country - ISO 3166 country code | REQUIRED
// extra - any extra information you'd like us to know about your address | Optional
export const addressValidation = (throughfare, _premise, locality, administrative_area, postal_code, country, _extra) => {
    let throughfare_error = throughfareValidation(throughfare);
    let locality_error = localityValidation(locality);
    let administrative_area_error = administrativeAreaValidation(administrative_area);
    let postal_code_error = postalCodeValidation(postal_code);
    let country_error = countryValidation(country)
    return !throughfare_error && !locality_error && !administrative_area_error && !postal_code_error && !country_error;
}

// TODO make more robust
export const phoneNumberValidation = phone => {
    return defaultStringValidation('phone number', phone);
}

// ============================ End String validations ======================================