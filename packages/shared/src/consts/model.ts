import { ValueOf } from '.';

export const AccountStatus = {
    DELETED: 'Deleted',
    UNLOCKED: 'Unlocked',
    SOFT_LOCKED: 'SoftLock',
    HARD_LOCKED: 'HardLock'
}
export type AccountStatus = ValueOf<typeof AccountStatus>;

export const DEFAULT_PRONOUNS = [
    "he/him/his",
    "she/her/hers",
    "they/them/theirs",
    "ze/zir/zirs",
    "ze/hir/hirs",
]

export const IMAGE_EXTENSION = {
    Bmp: '.bmp',
    Gif: '.gif',
    Png: '.png',
    Jpg: '.jpg',
    Jpeg: '.jpeg',
    Heic: '.heic',
    Heif: '.heif',
    Ico: '.ico'
}
export type IMAGE_EXTENSION = ValueOf<typeof IMAGE_EXTENSION>;

// Possible image sizes stored, and their max size
export const IMAGE_SIZE = {
    XXS: 32,
    XS: 64,
    S: 128,
    M: 256,
    ML: 512,
    L: 1024,
    XL: 2048,
    XXL: 4096,
}
export type IMAGE_SIZE = ValueOf<typeof IMAGE_SIZE>;

export const ImageUse = {
    HERO: 'Hero',
    GALLERY: 'Gallery',
    PRODUCT_DISPLAY: 'Display'
}
export type ImageUse = ValueOf<typeof ImageUse>;

// CANCELED_BY_ADMIN    | Admin canceled the order at any point before delivery
// CANCELED_BY_CUSTOMER |   1) Customer canceled order before approval (i.e. no admin approval needed), OR
//                          2) PENDING_CANCEL was approved by admin
// PENDING_CANCEL       | Customer canceled order after approval (i.e. admin approval needed)
// REJECTED             | Order was pending, but admin denied it
// DRAFT                | Order that hasn't been submitted yet (i.e. cart)
// PENDING              | Order that has been submitted, but not approved by admin yet
// APPROVED             | Order that has been approved by admin
// SCHEDULED            | Order has been scheduled for delivery
// IN_TRANSIT           | Order is currently being delivered
// DELIVERED            | Order has been delivered
export const OrderStatus = {
    CANCELED_BY_ADMIN: 'CANCELED_BY_ADMIN',
    CANCELED_BY_CUSTOMER: 'CANCELED_BY_CUSTOMER',
    PENDING_CANCEL: 'PENDING_CANCEL',
    REJECTED: 'REJECTED',
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    SCHEDULED: 'SCHEDULED',
    IN_TRANSIT: 'IN_TRANSIT',
    DELIVERED: 'DELIVERED'
}
export type OrderStatus = ValueOf<typeof OrderStatus>;

export const PRODUCT_SORT_OPTIONS = {
    AZ: 'AZ',
    ZA: 'ZA',
    Featured: 'Featured',
    Newest: 'Newest',
    Oldest: 'Oldest'
}
export type PRODUCT_SORT_OPTIONS = ValueOf<typeof PRODUCT_SORT_OPTIONS>;

export const SKU_SORT_OPTIONS = {
    AZ: 'AZ',
    ZA: 'ZA',
    PriceLowHigh: 'PriceLowHigh',
    PriceHighLow: 'PriceHighLow',
    Featured: 'Featured',
    Newest: 'Newest',
    Oldest: 'Oldest'
}
export type SKU_SORT_OPTIONS = ValueOf<typeof SKU_SORT_OPTIONS>;

export const SkuStatus = {
    DELETED: 'DELETED',
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
}
export type SkuStatus = ValueOf<typeof SkuStatus>;

export const THEME = {
    Light: 'light',
    Dark: 'dark'
}
export type THEME = ValueOf<typeof THEME>;

export const ROLES = {
    Customer: "Customer",
    Owner: "Owner",
    Admin: "Admin",
}
export type ROLES = ValueOf<typeof ROLES>;
