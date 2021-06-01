// Fields that can be exposed in a query

export const ADDRESS_FIELDS = [
    'id',
    'tag',
    'name',
    'country',
    'administrativeArea',
    'subAdministrativeArea',
    'locality',
    'postalCode',
    'premise',
    'business_id'
];

export const BUSINESS_FIELDS = [
    'id',
    'name',
    'subscribedToNewsletters'
];

export const DISCOUNT_FIELDS = [
    'id',
    'discount',
    'title',
    'comment',
    'terms'
];

export const EMAIL_FIELDS = [
    'id',
    'emailAddress',
    'receivesDeliveryUpdates',
    'userId',
    'businessId'
];

export const FEEDBACK_FIELDS = [
    'id',
    'text',
    'userId'
];

export const IMAGE_FIELDS = [
    'id',
    'extension',
    'alt',
    'hash',
    'width',
    'height'
];

export const ORDER_FIELDS = [
    'id',
    'status',
    'specialInstructions',
    'desiredDeliveryDate',
    'expectedDeliveryDate',
    'isDelivery',
    'addressId',
    'userId'
];

export const ORDER_ITEM_FIELDS = [
    'id',
    'quantity',
    'orderId',
    'skuId'
];

export const PHONE_FIELDS = [
    'id',
    'number',
    'countryCode',
    'extension',
    'receivesDeliveryUpdates',
    'userId',
    'businessId'
];

export const PLANT_FIELDS = [
    'id',
    'latinName',
    'textData',
    'imageData'
];

export const ROLE_FIELDS = [
    'id',
    'title',
    'description'
];

export const SKU_FIELDS = [
    'id',
    'sku',
    'isDiscountable',
    'size',
    'note',
    'availability',
    'price',
    'status',
    'plantId'
];

export const TASK_FIELDS = [
    'id',
    'taskId',
    'name',
    'status',
    'description',
    'result',
    'resultCode'
];

export const TRAIT_FIELDS = [
    'id',
    'name',
    'value'
];

export const USER_FIELDS = [
    'id',
    'firstName',
    'lastName',
    'pronouns',
    'theme',
    'lastLoginAttempt',
    'sessionToken',
    'accountApproved',
    'emailVerified',
    'status',
    'businessId'
]