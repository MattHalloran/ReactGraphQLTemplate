/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { ProductInput, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: updateProduct
// ====================================================

export interface updateProduct_updateProduct_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface updateProduct_updateProduct_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface updateProduct_updateProduct_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: updateProduct_updateProduct_images_image_files[] | null;
}

export interface updateProduct_updateProduct_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: updateProduct_updateProduct_images_image;
}

export interface updateProduct_updateProduct_skus_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface updateProduct_updateProduct_skus_discounts {
  __typename: "SkuDiscount";
  discount: updateProduct_updateProduct_skus_discounts_discount;
}

export interface updateProduct_updateProduct_skus {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  discounts: updateProduct_updateProduct_skus_discounts[] | null;
}

export interface updateProduct_updateProduct {
  __typename: "Product";
  id: string;
  name: string;
  traits: updateProduct_updateProduct_traits[] | null;
  images: updateProduct_updateProduct_images[] | null;
  skus: updateProduct_updateProduct_skus[] | null;
}

export interface updateProduct {
  updateProduct: updateProduct_updateProduct;
}

export interface updateProductVariables {
  input: ProductInput;
}
