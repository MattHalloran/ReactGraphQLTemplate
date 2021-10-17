/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AccountStatus {
  DELETED = "DELETED",
  HARD_LOCKED = "HARD_LOCKED",
  SOFT_LOCKED = "SOFT_LOCKED",
  UNLOCKED = "UNLOCKED",
}

export enum OrderStatus {
  APPROVED = "APPROVED",
  CANCELED_BY_ADMIN = "CANCELED_BY_ADMIN",
  CANCELED_BY_CUSTOMER = "CANCELED_BY_CUSTOMER",
  DELIVERED = "DELIVERED",
  DRAFT = "DRAFT",
  IN_TRANSIT = "IN_TRANSIT",
  PENDING = "PENDING",
  PENDING_CANCEL = "PENDING_CANCEL",
  REJECTED = "REJECTED",
  SCHEDULED = "SCHEDULED",
}

export enum SkuSortBy {
  AZ = "AZ",
  Featured = "Featured",
  Newest = "Newest",
  Oldest = "Oldest",
  PriceHighLow = "PriceHighLow",
  PriceLowHigh = "PriceLowHigh",
  ZA = "ZA",
}

export enum SkuStatus {
  ACTIVE = "ACTIVE",
  DELETED = "DELETED",
  INACTIVE = "INACTIVE",
}

export interface BusinessInput {
  id?: string | null;
  name: string;
  subscribedToNewsletters?: boolean | null;
  discountIds?: string[] | null;
  employeeIds?: string[] | null;
}

export interface CustomerInput {
  id?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  pronouns?: string | null;
  emails?: EmailInput[] | null;
  phones?: PhoneInput[] | null;
  business?: BusinessInput | null;
  theme?: string | null;
  status?: AccountStatus | null;
}

export interface EmailInput {
  id?: string | null;
  emailAddress: string;
  receivesDeliveryUpdates?: boolean | null;
  customerId?: string | null;
  businessId?: string | null;
}

export interface ImageUpdate {
  hash: string;
  alt?: string | null;
  description?: string | null;
}

export interface OrderInput {
  id?: string | null;
  status?: OrderStatus | null;
  specialInstructions?: string | null;
  desiredDeliveryDate?: any | null;
  isDelivery?: boolean | null;
  items?: OrderItemInput[] | null;
}

export interface OrderItemInput {
  id: string;
  quantity?: number | null;
}

export interface PhoneInput {
  id?: string | null;
  number: string;
  receivesDeliveryUpdates?: boolean | null;
  customerId?: string | null;
  businessID?: string | null;
}

export interface ProductImageInput {
  hash: string;
  isDisplay?: boolean | null;
}

export interface ProductInput {
  id?: string | null;
  name: string;
  traits: (ProductTraitInput | null)[];
  images?: ProductImageInput[] | null;
  skus?: SkuInput[] | null;
}

export interface ProductTraitInput {
  name: string;
  value: string;
}

export interface SkuInput {
  id?: string | null;
  sku: string;
  isDiscountable?: boolean | null;
  size?: string | null;
  note?: string | null;
  availability?: number | null;
  price?: string | null;
  status?: SkuStatus | null;
  productId?: string | null;
  discountIds?: string[] | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
