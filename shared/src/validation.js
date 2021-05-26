const yup = require('yup');
const { DEFAULT_PRONOUNS, ORDER_STATUS, SKU_STATUS } = require('./modelConsts');

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 50;
const PHONE_REGEX = '^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$';

// Schema for creating a new account
const signUpSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    businessName: yup.string().max(128).required(),
    email: yup.string().email().required(),
    phone: yup.string().matches(PHONE_REGEX).required(),
    existingCustomer: yup.boolean().required(),
    password: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).required()
});

// Schema for updating a user profile
const profileSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    businessName: yup.string().max(128).required(),
    email: yup.string().email().required(),
    phone: yup.string().matches(PHONE_REGEX).required(),
    existingCustomer: yup.boolean().required(),
    currentPassword: yup.string().max(128).required(),
    newPassword: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).optional()
});

// Schema for logging in
const logInSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().max(128).required()
})

// Schema for sending a password reset request
const forgotPasswordSchema = yup.object().shape({
    email: yup.string().email().required()
})

// Schema for adding an employee to a business
const employeeSchema = yup.object().shape({
    firstName: yup.string().max(128).required(),
    lastName: yup.string().max(128).required(),
    pronouns: yup.string().max(128).default(DEFAULT_PRONOUNS[0]).optional(),
    password: yup.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH).required()
});

const discountSchema = yup.object().shape({
    discount: yup.number().min(0).max(1).required(),
    title: yup.string().max(128).required(),
    comment: yup.string().max(1024).nullable(),
    terms: yup.string().max(4096).nullable()
});

const feedbackSchema = yup.object().shape({
    text: yup.string().max(4096).required()
});

const roleSchema = yup.object().shape({
    title: yup.string().max(128).required(),
    description: yup.string().max(2048).nullable()
});

const addressSchema = yup.object().shape({
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

const emailSchema = yup.object().shape({
    emailAddress: yup.string().max(128).required(),
    receivesDeliveryUpdates: yup.bool().default(true).required(),
});

const phoneSchema = yup.object().shape({
    number: yup.string().max(10).required(),
    countryCode: yup.string().max(8).default('1').required(),
    extension: yup.string().max(8).optional(),
    receivesDeliveryUpdates: yup.bool().default(true).required(),
});

const plantSchema = yup.object().shape({
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

const skuSchema = yup.object().shape({
    sku: yup.string().max(32).required(),
    isDiscountable: yup.bool().default(true).required(),
    size: yup.string().max(32).default('N/A').required(),
    note: yup.string().max(2048).optional(),
    availability: yup.number().integer().default(0).required(),
    price: yup.string().max(16).required(),
    status: yup.mixed().oneOf(Object.values(SKU_STATUS)).default(SKU_STATUS.Active).required()
});

const orderItemSchema = yup.object().shape({
    quantity: yup.number().integer().default(1).required(),
    skuId: yup.number().integer().required()
});

const orderSchema = yup.object().shape({
    status: yup.mixed().oneOf(Object.values(ORDER_STATUS)).default(ORDER_STATUS.Draft).required(),
    specialInstructions: yup.string().max(1024).optional(),
    desiredDeliveryDate: yup.date().optional(),
    isDelivery: yup.bool().default(true).required(),
    items: yup.array().of(orderItemSchema)
});

module.exports = {
    MIN_PASSWORD_LENGTH: MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH: MAX_PASSWORD_LENGTH,
    signUpSchema: signUpSchema,
    profileSchema: profileSchema,
    logInSchema: logInSchema,
    forgotPasswordSchema: forgotPasswordSchema,
    employeeSchema: employeeSchema,
    discountSchema: discountSchema,
    feedbackSchema: feedbackSchema,
    roleSchema: roleSchema,
    addressSchema: addressSchema,
    emailSchema: emailSchema,
    phoneSchema: phoneSchema,
    plantSchema: plantSchema,
    skuSchema: skuSchema,
    orderItemSchema: orderItemSchema,
    orderSchema: orderSchema
}