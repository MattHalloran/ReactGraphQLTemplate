import pkg from 'lodash';
const { merge } = pkg;
import { typeDef as Root, resolvers as RootResolvers } from './root';
import { typeDef as Address, resolvers as AddressResolvers } from './address';
import { typeDef as Business, resolvers as BusinessResolvers } from './business';
import { typeDef as Discount, resolvers as DiscountResolvers } from './discount';
import { typeDef as Email, resolvers as EmailResolvers } from './email';
import { typeDef as Feedback, resolvers as FeedbackResolvers } from './feedback';
import { typeDef as Image, resolvers as ImageResolvers } from './image';
import { typeDef as Order, resolvers as OrderResolvers } from './order';
import { typeDef as OrderItem, resolvers as OrderItemResolvers } from './orderItem';
import { typeDef as Phone, resolvers as PhoneResolvers } from './phone';
import { typeDef as Plant, resolvers as PlantResolvers } from './plant';
import { typeDef as Role, resolvers as RoleResolvers } from './role';
import { typeDef as Sku, resolvers as SkuResolvers } from './sku';
import { typeDef as Task, resolvers as TaskResolvers } from './task';
import { typeDef as PlantTrait, resolvers as PlantTraitResolvers } from './plantTrait';
import { typeDef as Customer, resolvers as CustomerResolvers } from './customer'

export const typeDefs = [
    Root, 
    Address, 
    Business, 
    Discount, 
    Email, 
    Feedback,
    Image,
    Order,
    OrderItem,
    Phone,
    Plant,
    Role,
    Sku,
    Task,
    PlantTrait,
    Customer
];

export const resolvers = merge(
    RootResolvers,
    AddressResolvers, 
    BusinessResolvers, 
    DiscountResolvers,
    EmailResolvers,
    FeedbackResolvers,
    ImageResolvers,
    OrderResolvers,
    OrderItemResolvers,
    PhoneResolvers,
    PlantResolvers,
    RoleResolvers,
    SkuResolvers,
    TaskResolvers,
    PlantTraitResolvers,
    CustomerResolvers
)
