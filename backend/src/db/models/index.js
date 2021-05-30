import { merge } from 'lodash';
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
import { typeDef as Trait, resolvers as TraitResolvers } from './trait';
import { typeDef as User, resolvers as UserResolvers } from './user'

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
    Trait,
    User
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
    TraitResolvers,
    UserResolvers
)

// export * from './root';
// export * from './address';
// export * from './business';
// export * from './discount';
// export * from './email';
// export * from './feedback';
// export * from './image';
// export * from './order';
// export * from './orderItem';
// export * from './phone';
// export * from './plant';
// export * from './role';
// export * from './sku';
// export * from './task';
// export * from './trait';
// export * from './user';