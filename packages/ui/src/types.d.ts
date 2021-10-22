// Define common props
import { customers_customers } from 'graphql/generated/customers';
import { login_login_cart } from 'graphql/generated/login'
import { orders_orders } from 'graphql/generated/orders';
import { products_products_skus } from 'graphql/generated/products';
import { skus_skus } from 'graphql/generated/skus';

// Top-level props that can be passed into any routed component
export type Business = any;
export type Cart = login_login_cart | null;
export type UserRoles = { title: string; description: string | null; }[] | null;
export type SessionChecked = boolean;
export type OnSessionUpdate = any;
export interface CommonProps {
    business: Business;
    cart: Cart;
    userRoles: UserRoles;
    sessionChecked: SessionChecked;
    onSessionUpdate: OnSessionUpdate;
}

// Rename auto-generated query objects
export type Customer = customers_customers;
export type Order = orders_orders;
export type Product = products_products;
export type Sku = skus_skus | products_products_skus;