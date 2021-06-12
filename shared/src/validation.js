import * as yup from 'yup';
import { DEFAULT_PRONOUNS, ORDER_STATUS, SKU_STATUS } from './modelConsts';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 50;
export const PHONE_REGEX = '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$';

// Schema for creating a new account
export const signUpSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    businessName: yup.string().max(128).required(),
    email: yup.string().email().required(),
    phone: yup.string().matches(PHONE_REGEX).required(),
    existingCustomer: yup.boolean().required(),
    marketingEmails: yup.boolean().required(),
    password: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).required(),
    passwordConfirmation: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match')
});

// Schema for updating a user profile
export const profileSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    businessName: yup.string().max(128).required(),
    email: yup.string().email().required(),
    phone: yup.string().matches(PHONE_REGEX).required(),
    existingCustomer: yup.boolean().required(),
    currentPassword: yup.string().max(128).required(),
    newPassword: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional(),
    newPasswordConfirmation: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match')
});

// Schema for logging in
export const logInSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().max(128).required()
})

// Schema for sending a password reset request
export const requestPasswordChangeSchema = yup.object().shape({
    email: yup.string().email().required()
})

// Schema for adding an employee to a business
export const employeeSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    password: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).required()
});

export const discountSchema = yup.object().shape({
    discount: yup.number().min(0).max(1).required(),
    title: yup.string().max(128).required(),
    comment: yup.string().max(1024).nullable(),
    terms: yup.string().max(4096).nullable()
});

export const feedbackSchema = yup.object().shape({
    text: yup.string().max(4096).required()
});

const roleSchema = yup.object().shape({
    title: yup.string().max(128).required(),
    description: yup.string().max(2048).nullable()
});

export const addressSchema = yup.object().shape({
    tag: yup.string().max(128).nullable(),
    name: yup.string().max(128).nullable(),
    country: yup.string().max(2).default('US').required(),
    administrativeArea: yup.string().max(64).required(),
    subAdministrativeArea: yup.string().max(64).nullable(),
    locality: yup.string().max(64).required(),
    postalCode: yup.string().max(16).required(),
    throughfare: yup.string().max(256).required(),
    premise: yup.string().max(64).nullable(),
    deliveryInstructions: yup.string().max(1024).nullable()
});

export const emailSchema = yup.object().shape({
    emailAddress: yup.string().max(128).required(),
    receivesDeliveryUpdates: yup.bool().default(true).required(),
});

export const phoneSchema = yup.object().shape({
    number: yup.string().max(10).required(),
    countryCode: yup.string().max(8).default('1').required(),
    extension: yup.string().max(8).optional(),
    receivesDeliveryUpdates: yup.bool().default(true).required(),
});

export const plantSchema = yup.object().shape({
    latinName: yup.string().max(256).required(),
    commonName: yup.string().max(256).optional(),
    description: yup.string().max(4096).optional(),
    jerseyNative: yup.bool().optional(),
    deerResistance: yup.string().max(512).optional(),
    droughtTolerance: yup.string().max(512).optional(),
    grownHeight: yup.string().max(512).optional(),
    grownSpread: yup.string().max(512).optional(),
    growthRate: yup.string().max(512).optional(),
    optimalLight: yup.string().max(512).optional(),
    saltTolerance: yup.string().max(512).optional(),
    displayImage: yup.string().optional()
});

export const skuSchema = yup.object().shape({
    sku: yup.string().max(32).required(),
    isDiscountable: yup.bool().default(true).required(),
    size: yup.string().max(32).default('N/A').required(),
    note: yup.string().max(2048).optional(),
    availability: yup.number().integer().default(0).required(),
    price: yup.string().max(16).required(),
    status: yup.mixed().oneOf(Object.values(SKU_STATUS)).default(SKU_STATUS.Active).required()
});

export const orderItemSchema = yup.object().shape({
    quantity: yup.number().integer().default(1).required(),
    skuId: yup.number().integer().required()
});

export const orderSchema = yup.object().shape({
    status: yup.mixed().oneOf(Object.values(ORDER_STATUS)).default(ORDER_STATUS.Draft).required(),
    specialInstructions: yup.string().max(1024).optional(),
    desiredDeliveryDate: yup.date().optional(),
    isDelivery: yup.bool().default(true).required(),
    items: yup.array().of(orderItemSchema)
});