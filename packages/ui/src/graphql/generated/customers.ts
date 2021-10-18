/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountStatus, OrderStatus, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: customers
// ====================================================

export interface customers_customers_emails {
  __typename: "Email";
  id: string;
  emailAddress: string;
  receivesDeliveryUpdates: boolean;
}

export interface customers_customers_phones {
  __typename: "Phone";
  id: string;
  number: string;
  receivesDeliveryUpdates: boolean;
}

export interface customers_customers_business {
  __typename: "Business";
  id: string;
  name: string;
}

export interface customers_customers_orders_address {
  __typename: "Address";
  tag: string | null;
  name: string | null;
  country: string;
  administrativeArea: string;
  subAdministrativeArea: string | null;
  locality: string;
  postalCode: string;
  throughfare: string;
  premise: string | null;
}

export interface customers_customers_orders_customer {
  __typename: "Customer";
  id: string;
}

export interface customers_customers_orders_items_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface customers_customers_orders_items_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface customers_customers_orders_items_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: customers_customers_orders_items_sku_product_images_image_files[] | null;
}

export interface customers_customers_orders_items_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: customers_customers_orders_items_sku_product_images_image;
}

export interface customers_customers_orders_items_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: customers_customers_orders_items_sku_product_traits[] | null;
  images: customers_customers_orders_items_sku_product_images[] | null;
}

export interface customers_customers_orders_items_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface customers_customers_orders_items_sku_discounts {
  __typename: "SkuDiscount";
  discount: customers_customers_orders_items_sku_discounts_discount;
}

export interface customers_customers_orders_items_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: customers_customers_orders_items_sku_product;
  discounts: customers_customers_orders_items_sku_discounts[] | null;
}

export interface customers_customers_orders_items {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: customers_customers_orders_items_sku;
}

export interface customers_customers_orders {
  __typename: "Order";
  id: string;
  status: OrderStatus;
  specialInstructions: string | null;
  desiredDeliveryDate: any | null;
  expectedDeliveryDate: any | null;
  isDelivery: boolean | null;
  address: customers_customers_orders_address | null;
  customer: customers_customers_orders_customer;
  items: customers_customers_orders_items[];
}

export interface customers_customers_roles_role {
  __typename: "Role";
  title: string;
}

export interface customers_customers_roles {
  __typename: "CustomerRole";
  role: customers_customers_roles_role;
}

export interface customers_customers {
  __typename: "Customer";
  id: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  emails: customers_customers_emails[];
  phones: customers_customers_phones[];
  business: customers_customers_business | null;
  status: AccountStatus;
  orders: customers_customers_orders[];
  roles: customers_customers_roles[];
}

export interface customers {
  customers: customers_customers[];
}
