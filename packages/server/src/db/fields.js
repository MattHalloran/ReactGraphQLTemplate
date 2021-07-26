import { TABLES } from "./tables";

// Fields that can be exposed in a query
export const FIELDS = {
    [TABLES.Address]: [
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
    ],
    [TABLES.Business]: [
        'id',
        'name',
        'subscribedToNewsletters'
    ],
    [TABLES.Discount]: [
        'id',
        'discount',
        'title',
        'comment',
        'terms'
    ],
    [TABLES.Email]: [
        'id',
        'emailAddress',
        'receivesDeliveryUpdates',
        'userId',
        'businessId'
    ],
    [TABLES.Feedback]: [
        'id',
        'text',
        'userId'
    ],
    [TABLES.Image]: [
        'id',
        'extension',
        'alt',
        'description',
        'usedFor',
        'hash',
        'width',
        'height'
    ],
    [TABLES.Order]: [
        'id',
        'status',
        'specialInstructions',
        'desiredDeliveryDate',
        'expectedDeliveryDate',
        'isDelivery',
        'addressId',
        'userId'
    ],
    [TABLES.OrderItem]: [
        'id',
        'quantity',
        'orderId',
        'skuId'
    ],
    [TABLES.Phone]: [
        'id',
        'number',
        'countryCode',
        'extension',
        'receivesDeliveryUpdates',
        'userId',
        'businessId'
    ],
    [TABLES.Plant]: [
        'id',
        'latinName',
        'traitData',
        'imageData'
    ],
    [TABLES.Role]: [
        'id',
        'title',
        'description'
    ],
    [TABLES.Sku]: [
        'id',
        'sku',
        'isDiscountable',
        'size',
        'note',
        'availability',
        'price',
        'status',
        'plantId'
    ],
    [TABLES.Task]: [
        'id',
        'taskId',
        'name',
        'status',
        'description',
        'result',
        'resultCode'
    ],
    [TABLES.Trait]: [
        'id',
        'name',
        'value'
    ],
    [TABLES.User]: [
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
}