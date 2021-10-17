/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SkuSortBy, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL query operation: skus
// ====================================================

export interface skus_skus_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface skus_skus_discounts {
  __typename: "SkuDiscount";
  discount: skus_skus_discounts_discount;
}

export interface skus_skus_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface skus_skus_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface skus_skus_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: skus_skus_product_images_image_files[] | null;
}

export interface skus_skus_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: skus_skus_product_images_image;
}

export interface skus_skus_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: skus_skus_product_traits[] | null;
  images: skus_skus_product_images[] | null;
}

export interface skus_skus {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  discounts: skus_skus_discounts[] | null;
  product: skus_skus_product;
}

export interface skus {
  skus: skus_skus[];
}

export interface skusVariables {
  ids?: string[] | null;
  sortBy?: SkuSortBy | null;
  searchString?: string | null;
  onlyInStock?: boolean | null;
}
