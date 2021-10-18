/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderStatus, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: orders
// ====================================================

export interface orders_orders_address {
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

export interface orders_orders_customer_emails {
  __typename: "Email";
  id: string;
  emailAddress: string;
  receivesDeliveryUpdates: boolean;
}

export interface orders_orders_customer_phones {
  __typename: "Phone";
  id: string;
  number: string;
  receivesDeliveryUpdates: boolean;
}

export interface orders_orders_customer_business {
  __typename: "Business";
  id: string;
  name: string;
}

export interface orders_orders_customer {
  __typename: "Customer";
  id: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  emails: orders_orders_customer_emails[];
  phones: orders_orders_customer_phones[];
  business: orders_orders_customer_business | null;
}

export interface orders_orders_items_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface orders_orders_items_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface orders_orders_items_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: orders_orders_items_sku_product_images_image_files[] | null;
}

export interface orders_orders_items_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: orders_orders_items_sku_product_images_image;
}

export interface orders_orders_items_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: orders_orders_items_sku_product_traits[] | null;
  images: orders_orders_items_sku_product_images[] | null;
}

export interface orders_orders_items_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface orders_orders_items_sku_discounts {
  __typename: "SkuDiscount";
  discount: orders_orders_items_sku_discounts_discount;
}

export interface orders_orders_items_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: orders_orders_items_sku_product;
  discounts: orders_orders_items_sku_discounts[] | null;
}

export interface orders_orders_items {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: orders_orders_items_sku;
}

export interface orders_orders {
  __typename: "Order";
  id: string;
  status: OrderStatus;
  specialInstructions: string | null;
  desiredDeliveryDate: any | null;
  expectedDeliveryDate: any | null;
  isDelivery: boolean | null;
  address: orders_orders_address | null;
  customer: orders_orders_customer;
  items: orders_orders_items[];
}

export interface orders {
  orders: orders_orders[];
}

export interface ordersVariables {
  ids?: string[] | null;
  status?: OrderStatus | null;
  searchString?: string | null;
}
