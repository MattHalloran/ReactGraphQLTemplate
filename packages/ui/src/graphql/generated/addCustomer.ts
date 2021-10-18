/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { CustomerInput, AccountStatus, OrderStatus, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: addCustomer
// ====================================================

export interface addCustomer_addCustomer_emails {
  __typename: "Email";
  id: string;
  emailAddress: string;
  receivesDeliveryUpdates: boolean;
}

export interface addCustomer_addCustomer_phones {
  __typename: "Phone";
  id: string;
  number: string;
  receivesDeliveryUpdates: boolean;
}

export interface addCustomer_addCustomer_business {
  __typename: "Business";
  id: string;
  name: string;
}

export interface addCustomer_addCustomer_orders_address {
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

export interface addCustomer_addCustomer_orders_customer {
  __typename: "Customer";
  id: string;
}

export interface addCustomer_addCustomer_orders_items_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface addCustomer_addCustomer_orders_items_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface addCustomer_addCustomer_orders_items_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: addCustomer_addCustomer_orders_items_sku_product_images_image_files[] | null;
}

export interface addCustomer_addCustomer_orders_items_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: addCustomer_addCustomer_orders_items_sku_product_images_image;
}

export interface addCustomer_addCustomer_orders_items_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: addCustomer_addCustomer_orders_items_sku_product_traits[] | null;
  images: addCustomer_addCustomer_orders_items_sku_product_images[] | null;
}

export interface addCustomer_addCustomer_orders_items_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface addCustomer_addCustomer_orders_items_sku_discounts {
  __typename: "SkuDiscount";
  discount: addCustomer_addCustomer_orders_items_sku_discounts_discount;
}

export interface addCustomer_addCustomer_orders_items_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: addCustomer_addCustomer_orders_items_sku_product;
  discounts: addCustomer_addCustomer_orders_items_sku_discounts[] | null;
}

export interface addCustomer_addCustomer_orders_items {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: addCustomer_addCustomer_orders_items_sku;
}

export interface addCustomer_addCustomer_orders {
  __typename: "Order";
  id: string;
  status: OrderStatus;
  specialInstructions: string | null;
  desiredDeliveryDate: any | null;
  expectedDeliveryDate: any | null;
  isDelivery: boolean | null;
  address: addCustomer_addCustomer_orders_address | null;
  customer: addCustomer_addCustomer_orders_customer;
  items: addCustomer_addCustomer_orders_items[];
}

export interface addCustomer_addCustomer_roles_role {
  __typename: "Role";
  title: string;
}

export interface addCustomer_addCustomer_roles {
  __typename: "CustomerRole";
  role: addCustomer_addCustomer_roles_role;
}

export interface addCustomer_addCustomer {
  __typename: "Customer";
  id: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  emails: addCustomer_addCustomer_emails[];
  phones: addCustomer_addCustomer_phones[];
  business: addCustomer_addCustomer_business | null;
  status: AccountStatus;
  orders: addCustomer_addCustomer_orders[];
  roles: addCustomer_addCustomer_roles[];
}

export interface addCustomer {
  addCustomer: addCustomer_addCustomer;
}

export interface addCustomerVariables {
  input: CustomerInput;
}
