export const AccountStatus = {
    DELETED: 'Deleted',
    UNLOCKED: 'Unlocked',
    SOFT_LOCKED: 'SoftLock',
    HARD_LOCKED: 'HardLock'
} as const;
export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus];

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
} as const;
export type IMAGE_EXTENSION = typeof IMAGE_EXTENSION[keyof typeof IMAGE_EXTENSION];

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
} as const;
export type IMAGE_SIZE = typeof IMAGE_SIZE[keyof typeof IMAGE_SIZE];

export const ImageUse = {
    HERO: 'Hero',
    GALLERY: 'Gallery',
    PRODUCT_DISPLAY: 'Display'
} as const;
export type ImageUse = typeof ImageUse[keyof typeof ImageUse];

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
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PRODUCT_SORT_OPTIONS = {
    AZ: 'AZ',
    ZA: 'ZA',
    Featured: 'Featured',
    Newest: 'Newest',
    Oldest: 'Oldest'
} as const;
export type PRODUCT_SORT_OPTIONS = typeof PRODUCT_SORT_OPTIONS[keyof typeof PRODUCT_SORT_OPTIONS];

export const SKU_SORT_OPTIONS = {
    AZ: 'AZ',
    ZA: 'ZA',
    PriceLowHigh: 'PriceLowHigh',
    PriceHighLow: 'PriceHighLow',
    Featured: 'Featured',
    Newest: 'Newest',
    Oldest: 'Oldest'
} as const;
export type SKU_SORT_OPTIONS = typeof SKU_SORT_OPTIONS[keyof typeof SKU_SORT_OPTIONS];

export const SkuStatus = {
    DELETED: 'DELETED',
    INACTIVE: 'INACTIVE',
    ACTIVE: 'ACTIVE',
} as const;
export type SkuStatus = typeof SkuStatus[keyof typeof SkuStatus];

export const THEME = {
    Light: 'light',
    Dark: 'dark'
} as const;
export type THEME = typeof THEME[keyof typeof THEME];

export const ROLES = {
    Customer: "Customer",
    Owner: "Owner",
    Admin: "Admin",
} as const;
export type ROLES = typeof ROLES[keyof typeof ROLES];
