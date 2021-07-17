import { FIELDS } from './fields';
import { TABLES } from './tables';
import {
    addressSchema,
    businessSchema,
    discountSchema,
    emailSchema,
    feedbackSchema,
    orderSchema,
    orderItemSchema,
    phoneSchema,
    plantSchema,
    roleSchema,
    skuSchema
} from '@local/shared';

export const REL_TYPE = Object.freeze({ One: 1, Many: 2, ManyMany: 3 });

export class Relationship {
    constructor(type, name, classNames, ids) { 
        this.type = type;
        this.name = name;
        this.classNames = classNames;
        this.ids = ids;
    }

    exposedFields() { return FIELDS[this.classNames[0]] }
}

export class Model {
    constructor(name, validationSchema, relationships) {
        this.name = name;
        this.validationSchema = validationSchema;
        this.relationships = relationships;
    }

    exposedFields() { return FIELDS[this.name] }

    getRelationship(name) { return this.relationships.find(r => r.name === name); }
}

const createModel = (name, validationSchema, data) => {
    let relationships = data.map(r => {
        return new Relationship(...r);
    })
    return new Model(name, validationSchema, relationships);
}

export const AddressModel = createModel(TABLES.Address, addressSchema, [
    [REL_TYPE.One, 'business', [TABLES.Business], ['businessId']],
    [REL_TYPE.Many, 'orders', [TABLES.Order], ['addressId']]
]);

export const BusinessModel = createModel(TABLES.Business, businessSchema, [
    [REL_TYPE.Many, 'addresses', [TABLES.Address], ['businessId']],
    [REL_TYPE.Many, 'phones', [TABLES.Phone], ['businessId']],
    [REL_TYPE.Many, 'emails', [TABLES.Email], ['businessId']],
    [REL_TYPE.Many, 'employees', [TABLES.User], ['businessId']],
    [REL_TYPE.ManyMany, 'discounts', [TABLES.Discount, TABLES.BusinessDiscounts], ['businessId', 'discountId']]
]);

export const DiscountModel = createModel(TABLES.Discount, discountSchema, [
    [REL_TYPE.ManyMany, 'businesses', [TABLES.Business, TABLES.BusinessDiscounts], ['discountId', 'businessId']],
    [REL_TYPE.ManyMany, 'skus', [TABLES.Sku, TABLES.SkuDiscounts], ['discountId', 'skuId']]
]);

export const EmailModel = createModel(TABLES.Email, emailSchema, [
    [REL_TYPE.One, 'user', [TABLES.User], ['userId']],
    [REL_TYPE.One, 'business', [TABLES.Business], ['emailId']]
]);

export const FeedbackModel = createModel(TABLES.Feedback, feedbackSchema, [
    [REL_TYPE.One, 'user', [TABLES.User], ['userId']]
]);

export const ImageModel = createModel(TABLES.Image, null, [
    [REL_TYPE.ManyMany, 'labels', [TABLES.Label, TABLES.ImageLabels], ['hash', 'label']]
]);

export const OrderModel = createModel(TABLES.Order, orderSchema, [
    [REL_TYPE.One, 'address', [TABLES.Address], ['addressId']],
    [REL_TYPE.One, 'user', [TABLES.User], ['userId']],
    [REL_TYPE.Many, 'items', [TABLES.OrderItem], ['orderId']]
]);

export const OrderItemModel = createModel(TABLES.OrderItem, orderItemSchema, [
    [REL_TYPE.One, 'order', [TABLES.Order], ['orderId']],
    [REL_TYPE.One, 'sku', [TABLES.Sku], ['skuId']]
]);

export const PhoneModel = createModel(TABLES.Phone, phoneSchema, [
    [REL_TYPE.One, 'user', [TABLES.User], ['userId']],
    [REL_TYPE.One, 'business', [TABLES.Business], ['businessId']]
]);

export const PlantModel = createModel(TABLES.Plant, plantSchema, [
    [REL_TYPE.One, 'sku', [TABLES.Sku], ['skuId']]
]);

export const RoleModel = createModel(TABLES.Role, roleSchema, [
    [REL_TYPE.ManyMany, 'users', [TABLES.User, TABLES.UserRoles], ['roleId', 'userId']]
]);

export const SkuModel = createModel(TABLES.Sku, skuSchema, [
    [REL_TYPE.One, 'plant', [TABLES.Plant], ['plantId']],
    [REL_TYPE.ManyMany, 'discounts', [TABLES.Discount, TABLES.SkuDiscounts], ['skuId', 'discountId']]
]);

export const TraitModel = createModel(TABLES.Trait, null, [
    [REL_TYPE.ManyMany, 'plants', [TABLES.Plant, TABLES.PlantTraits], ['plantId', 'traitId']]
]);

export const UserModel = createModel(TABLES.User, null, [
    [REL_TYPE.One, 'business', [TABLES.Business], ['businessId']],
    [REL_TYPE.Many, 'emails', [TABLES.Email], ['userId']],
    [REL_TYPE.Many, 'phones', [TABLES.Phone], ['userId']],
    [REL_TYPE.Many, 'orders', [TABLES.Order], ['userId']],
    [REL_TYPE.ManyMany, 'roles', [TABLES.Role, TABLES.UserRoles], ['userId', 'roleId']],
    [REL_TYPE.Many, 'feedback', [TABLES.Feedback], ['userId']]
]);

export const MODELS = [
    AddressModel,
    BusinessModel,
    DiscountModel,
    EmailModel,
    FeedbackModel,
    ImageModel,
    OrderModel,
    OrderItemModel,
    PhoneModel,
    PlantModel,
    RoleModel,
    SkuModel,
    TraitModel,
    UserModel
]