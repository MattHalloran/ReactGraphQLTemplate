/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SkuSortBy, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: products
// ====================================================

export interface products_products_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface products_products_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface products_products_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: products_products_images_image_files[] | null;
}

export interface products_products_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: products_products_images_image;
}

export interface products_products_skus_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface products_products_skus_discounts {
  __typename: "SkuDiscount";
  discount: products_products_skus_discounts_discount;
}

export interface products_products_skus {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  discounts: products_products_skus_discounts[] | null;
}

export interface products_products {
  __typename: "Product";
  id: string;
  name: string;
  traits: products_products_traits[] | null;
  images: products_products_images[] | null;
  skus: products_products_skus[] | null;
}

export interface products {
  products: products_products[];
}

export interface productsVariables {
  ids?: string[] | null;
  sortBy?: SkuSortBy | null;
  searchString?: string | null;
}
