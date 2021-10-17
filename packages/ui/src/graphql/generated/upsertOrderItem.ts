/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: upsertOrderItem
// ====================================================

export interface upsertOrderItem_upsertOrderItem_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface upsertOrderItem_upsertOrderItem_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface upsertOrderItem_upsertOrderItem_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: upsertOrderItem_upsertOrderItem_sku_product_images_image_files[] | null;
}

export interface upsertOrderItem_upsertOrderItem_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: upsertOrderItem_upsertOrderItem_sku_product_images_image;
}

export interface upsertOrderItem_upsertOrderItem_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: upsertOrderItem_upsertOrderItem_sku_product_traits[] | null;
  images: upsertOrderItem_upsertOrderItem_sku_product_images[] | null;
}

export interface upsertOrderItem_upsertOrderItem_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface upsertOrderItem_upsertOrderItem_sku_discounts {
  __typename: "SkuDiscount";
  discount: upsertOrderItem_upsertOrderItem_sku_discounts_discount;
}

export interface upsertOrderItem_upsertOrderItem_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: upsertOrderItem_upsertOrderItem_sku_product;
  discounts: upsertOrderItem_upsertOrderItem_sku_discounts[] | null;
}

export interface upsertOrderItem_upsertOrderItem {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: upsertOrderItem_upsertOrderItem_sku;
}

export interface upsertOrderItem {
  upsertOrderItem: upsertOrderItem_upsertOrderItem;
}

export interface upsertOrderItemVariables {
  quantity: number;
  orderId?: string | null;
  skuId: string;
}
