/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { SkuStatus } from "./globalTypes";

// ====================================================
// GraphQL fragment: skuFields
// ====================================================

export interface skuFields {
  __typename: "Sku";
  id: string;
  sku: string;
  isDiscountable: boolean;
  size: string | null;
  note: string | null;
  availability: number;
  price: string | null;
  status: SkuStatus;
}
