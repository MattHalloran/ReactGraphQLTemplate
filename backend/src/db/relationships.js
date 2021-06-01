import * as F from './fields';
import { TABLES } from './tables';

export const ADDRESS_RELATIONSHIPS = [
    ['one', 'business', TABLES.Business, F.BUSINESS_FIELDS, 'businessId'],
    ['many', 'orders', TABLES.Order, F.ORDER_FIELDS, 'addressId']
];

export const BUSINESS_RELATIONSHIPS = [
    ['many', 'addresses', TABLES.Address, F.ADDRESS_FIELDS, 'businessId'],
    ['many', 'phones', TABLES.Phone, F.PHONE_FIELDS, 'businessId'],
    ['many', 'emails', TABLES.Email, F.EMAIL_FIELDS, 'businessId'],
    ['many', 'employees', TABLES.User, F.USER_FIELDS, 'businessId'],
    ['many-many', 'discounts', TABLES.Discount, TABLES.BusinessDiscounts, F.DISCOUNT_FIELDS, 'businessId', 'discountId']
];

export const DISCOUNT_RELATIONSHIPS = [
    ['many-many', 'businesses', TABLES.Business, TABLES.BusinessDiscounts, F.BUSINESS_FIELDS, 'discountId', 'businessId'],
    ['many-many', 'skus', TABLES.Sku, TABLES.SkuDiscounts, F.SKU_FIELDS, 'discountId', 'skuId']
];

export const EMAIL_RELATIONSHIPS = [
    ['one', 'user', TABLES.User, F.USER_FIELDS, 'userId'],
    ['one', 'business', TABLES.Business, F.BUSINESS_FIELDS, 'emailId']
];

export const FEEDBACK_RELATIONSHIPS = [
    ['one', 'user', TABLES.User, F.USER_FIELDS, 'userId']
];

export const ORDER_RELATIONSHIPS = [
    ['one', 'address', TABLES.Address, F.ADDRESS_FIELDS, 'addressId'],
    ['one', 'user', TABLES.User, F.USER_FIELDS, 'userId'],
    ['many', 'items', TABLES.OrderItem, F.ORDER_ITEM_FIELDS, 'orderId']
];

export const ORDER_ITEM_RELATIONSHIPS = [
    ['one', 'order', TABLES.Order, F.ORDER_FIELDS, 'orderId'],
    ['one', 'sku', TABLES.Sku, F.SKU_FIELDS, 'skuId']
];

export const PHONE_RELATIONSHIPS = [
    ['one', 'user', TABLES.User, F.USER_FIELDS, 'userId'],
    ['one', 'business', TABLES.Business, F.BUSINESS_FIELDS, 'businessId']
];

export const PLANT_RELATIONSHIPS = [
    ['one', 'sku', TABLES.Sku, F.SKU_FIELDS, 'skuId']
];

export const ROLE_RELATIONSHIPS = [
    ['many-many', 'users', TABLES.User, TABLES.UserRoles, F.USER_FIELDS, 'roleId', 'userId']
];

export const SKU_RELATIONSHIPS = [
    ['one', 'plant', TABLES.Plant, F.PLANT_FIELDS, 'plantId'],
    ['many-many', 'discounts', TABLES.Discount, TABLES.SkuDiscounts, F.DISCOUNT_FIELDS, 'skuId', 'discountId']
];

export const TRAIT_RELATIONSHIPS = [
    ['many-many', 'plants', TABLES.Plant, TABLES.PlantTraits, F.ROLE_FIELDS, 'plantId', 'traitId']
];

export const USER_RELATIONSHIPS = [
    ['one', 'business', TABLES.Business, F.BUSINESS_FIELDS, 'businessId'],
    ['many', 'emails', TABLES.Email, F.EMAIL_FIELDS, 'userId'],
    ['many', 'phones', TABLES.Phone, F.PHONE_FIELDS, 'userId'],
    ['many', 'orders', TABLES.Order, F.ORDER_FIELDS, 'userId'],
    ['many-many', 'roles', TABLES.Role, TABLES.UserRoles, F.ROLE_FIELDS, 'userId', 'roleId'],
    ['many', 'feedback', TABLES.Feedback, F.FEEDBACK_FIELDS, 'userId']
];