/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { OrderInput, OrderStatus, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateOrder
// ====================================================

export interface updateOrder_updateOrder_address {
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

export interface updateOrder_updateOrder_customer {
  __typename: "Customer";
  id: string;
}

export interface updateOrder_updateOrder_items_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface updateOrder_updateOrder_items_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface updateOrder_updateOrder_items_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: updateOrder_updateOrder_items_sku_product_images_image_files[] | null;
}

export interface updateOrder_updateOrder_items_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: updateOrder_updateOrder_items_sku_product_images_image;
}

export interface updateOrder_updateOrder_items_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: updateOrder_updateOrder_items_sku_product_traits[] | null;
  images: updateOrder_updateOrder_items_sku_product_images[] | null;
}

export interface updateOrder_updateOrder_items_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface updateOrder_updateOrder_items_sku_discounts {
  __typename: "SkuDiscount";
  discount: updateOrder_updateOrder_items_sku_discounts_discount;
}

export interface updateOrder_updateOrder_items_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: updateOrder_updateOrder_items_sku_product;
  discounts: updateOrder_updateOrder_items_sku_discounts[] | null;
}

export interface updateOrder_updateOrder_items {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: updateOrder_updateOrder_items_sku;
}

export interface updateOrder_updateOrder {
  __typename: "Order";
  id: string;
  status: OrderStatus;
  specialInstructions: string | null;
  desiredDeliveryDate: any | null;
  expectedDeliveryDate: any | null;
  isDelivery: boolean | null;
  address: updateOrder_updateOrder_address | null;
  customer: updateOrder_updateOrder_customer;
  items: updateOrder_updateOrder_items[];
}

export interface updateOrder {
  updateOrder: updateOrder_updateOrder;
}

export interface updateOrderVariables {
  input: OrderInput;
}
