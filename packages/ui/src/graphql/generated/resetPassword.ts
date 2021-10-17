/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { AccountStatus, OrderStatus, SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL mutation operation: resetPassword
// ====================================================

export interface resetPassword_resetPassword_roles_role {
  __typename: "Role";
  title: string;
  description: string | null;
}

export interface resetPassword_resetPassword_roles {
  __typename: "CustomerRole";
  role: resetPassword_resetPassword_roles_role;
}

export interface resetPassword_resetPassword_cart_address {
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

export interface resetPassword_resetPassword_cart_customer {
  __typename: "Customer";
  id: string;
}

export interface resetPassword_resetPassword_cart_items_sku_product_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface resetPassword_resetPassword_cart_items_sku_product_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface resetPassword_resetPassword_cart_items_sku_product_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: resetPassword_resetPassword_cart_items_sku_product_images_image_files[] | null;
}

export interface resetPassword_resetPassword_cart_items_sku_product_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: resetPassword_resetPassword_cart_items_sku_product_images_image;
}

export interface resetPassword_resetPassword_cart_items_sku_product {
  __typename: "Product";
  id: string;
  name: string;
  traits: resetPassword_resetPassword_cart_items_sku_product_traits[] | null;
  images: resetPassword_resetPassword_cart_items_sku_product_images[] | null;
}

export interface resetPassword_resetPassword_cart_items_sku_discounts_discount {
  __typename: "Discount";
  id: string;
  discount: number;
  title: string;
  comment: string | null;
  terms: string | null;
}

export interface resetPassword_resetPassword_cart_items_sku_discounts {
  __typename: "SkuDiscount";
  discount: resetPassword_resetPassword_cart_items_sku_discounts_discount;
}

export interface resetPassword_resetPassword_cart_items_sku {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
  product: resetPassword_resetPassword_cart_items_sku_product;
  discounts: resetPassword_resetPassword_cart_items_sku_discounts[] | null;
}

export interface resetPassword_resetPassword_cart_items {
  __typename: "OrderItem";
  id: string;
  quantity: number;
  sku: resetPassword_resetPassword_cart_items_sku;
}

export interface resetPassword_resetPassword_cart {
  __typename: "Order";
  id: string;
  status: OrderStatus;
  specialInstructions: string | null;
  desiredDeliveryDate: any | null;
  expectedDeliveryDate: any | null;
  isDelivery: boolean | null;
  address: resetPassword_resetPassword_cart_address | null;
  customer: resetPassword_resetPassword_cart_customer;
  items: resetPassword_resetPassword_cart_items[];
}

export interface resetPassword_resetPassword {
  __typename: "Customer";
  id: string;
  emailVerified: boolean;
  status: AccountStatus;
  theme: string;
  roles: resetPassword_resetPassword_roles[];
  cart: resetPassword_resetPassword_cart | null;
}

export interface resetPassword {
  resetPassword: resetPassword_resetPassword;
}

export interface resetPasswordVariables {
  id: string;
  code: string;
  newPassword: string;
}
