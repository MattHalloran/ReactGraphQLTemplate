import { FIELDS } from './fields';
import { TABLES } from './tables';

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
    constructor(name, relationships) {
        this.name = name;
        this.relationships = relationships;
    }
}

const createModel = (name, data) => {
    let relationships = data.map(r => {
        return new Relationship(...r);
    })
    return new Model(name, relationships);
}

export const AddressModel = createModel(TABLES.Address, [
    ['one', 'business', [TABLES.Business], ['businessId']],
    ['many', 'orders', [TABLES.Order], ['addressId']]
]);

export const BusinessModel = createModel(TABLES.Business, [
    ['many', 'addresses', [TABLES.Address], ['businessId']],
    ['many', 'phones', [TABLES.Phone], ['businessId']],
    ['many', 'emails', [TABLES.Email], ['businessId']],
    ['many', 'employees', [TABLES.User], ['businessId']],
    ['many-many', 'discounts', [TABLES.Discount, TABLES.BusinessDiscounts], ['businessId', 'discountId']]
]);

export const DiscountModel = createModel(TABLES.Discount, [
    ['many-many', 'businesses', [TABLES.Business, TABLES.BusinessDiscounts], ['discountId', 'businessId']],
    ['many-many', 'skus', [TABLES.Sku, TABLES.SkuDiscounts], ['discountId', 'skuId']]
]);

export const EmailModel = createModel(TABLES.Email, [
    ['one', 'user', [TABLES.User], ['userId']],
    ['one', 'business', [TABLES.Business], ['emailId']]
]);

export const FeedbackModel = createModel(TABLES.Feedback, [
    ['one', 'user', [TABLES.User], ['userId']]
]);

export const ImageModel = createModel(TABLES.Image, [
    ['many-many', 'labels', [TABLES.Label, TABLES.ImageLabels], ['hash', 'label']]
]);

export const OrderModel = createModel(TABLES.Order, [
    ['one', 'address', [TABLES.Address], ['addressId']],
    ['one', 'user', [TABLES.User], ['userId']],
    ['many', 'items', [TABLES.OrderItem], ['orderId']]
]);

export const OrderItemModel = createModel(TABLES.OrderItem, [
    ['one', 'order', [TABLES.Order], ['orderId']],
    ['one', 'sku', [TABLES.Sku], ['skuId']]
]);

export const PhoneModel = createModel(TABLES.Phone, [
    ['one', 'user', [TABLES.User], ['userId']],
    ['one', 'business', [TABLES.Business], ['businessId']]
]);

export const PlantModel = createModel(TABLES.Plant, [
    ['one', 'sku', [TABLES.Sku], ['skuId']]
]);

export const RoleModel = createModel(TABLES.Role, [
    ['many-many', 'users', [TABLES.User, TABLES.UserRoles], ['roleId', 'userId']]
]);

export const SkuModel = createModel(TABLES.Sku, [
    ['one', 'plant', [TABLES.Plant], ['plantId']],
    ['many-many', 'discounts', [TABLES.Discount, TABLES.SkuDiscounts], ['skuId', 'discountId']]
]);

export const TraitModel = createModel(TABLES.Trait, [
    ['many-many', 'plants', [TABLES.Plant, TABLES.PlantTraits], ['plantId', 'traitId']]
]);

export const UserModel = createModel(TABLES.User, [
    ['one', 'business', [TABLES.Business], ['businessId']],
    ['many', 'emails', [TABLES.Email], ['userId']],
    ['many', 'phones', [TABLES.Phone], ['userId']],
    ['many', 'orders', [TABLES.Order], ['userId']],
    ['many-many', 'roles', [TABLES.Role, TABLES.UserRoles], ['userId', 'roleId']],
    ['many', 'feedback', [TABLES.Feedback], ['userId']]
]);