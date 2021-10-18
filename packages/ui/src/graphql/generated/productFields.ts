/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: productFields
// ====================================================

export interface productFields_traits {
  __typename: "ProductTrait";
  name: string;
  value: string;
}

export interface productFields_images_image_files {
  __typename: "ImageFile";
  src: string;
  width: number;
  height: number;
}

export interface productFields_images_image {
  __typename: "Image";
  hash: string;
  alt: string | null;
  description: string | null;
  files: productFields_images_image_files[] | null;
}

export interface productFields_images {
  __typename: "ProductImage";
  index: number;
  isDisplay: boolean;
  image: productFields_images_image;
}

export interface productFields {
  __typename: "Product";
  id: string;
  name: string;
  traits: productFields_traits[] | null;
  images: productFields_images[] | null;
}
