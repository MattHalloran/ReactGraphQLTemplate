export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** Custom description for the date scalar */
  Date: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export enum AccountStatus {
  Deleted = 'DELETED',
  HardLocked = 'HARD_LOCKED',
  SoftLocked = 'SOFT_LOCKED',
  Unlocked = 'UNLOCKED'
}

export type AddImageResponse = {
  __typename?: 'AddImageResponse';
  hash?: Maybe<Scalars['String']>;
  src?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type Address = {
  __typename?: 'Address';
  administrativeArea: Scalars['String'];
  business: Business;
  country: Scalars['String'];
  id: Scalars['ID'];
  locality: Scalars['String'];
  name?: Maybe<Scalars['String']>;
  orders: Array<Order>;
  postalCode: Scalars['String'];
  premise?: Maybe<Scalars['String']>;
  subAdministrativeArea?: Maybe<Scalars['String']>;
  tag?: Maybe<Scalars['String']>;
  throughfare: Scalars['String'];
};

export type AddressInput = {
  administrativeArea: Scalars['String'];
  businessId: Scalars['ID'];
  country: Scalars['String'];
  deliveryInstructions?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  locality: Scalars['String'];
  name?: InputMaybe<Scalars['String']>;
  postalCode: Scalars['String'];
  premise?: InputMaybe<Scalars['String']>;
  subAdministrativeArea?: InputMaybe<Scalars['String']>;
  tag?: InputMaybe<Scalars['String']>;
  throughfare: Scalars['String'];
};

export type Business = {
  __typename?: 'Business';
  addresses: Array<Address>;
  discounts: Array<Discount>;
  emails: Array<Email>;
  employees: Array<Customer>;
  id: Scalars['ID'];
  name: Scalars['String'];
  phones: Array<Phone>;
  subscribedToNewsletters: Scalars['Boolean'];
};

export type BusinessInput = {
  discountIds?: InputMaybe<Array<Scalars['ID']>>;
  employeeIds?: InputMaybe<Array<Scalars['ID']>>;
  id?: InputMaybe<Scalars['ID']>;
  name: Scalars['String'];
  subscribedToNewsletters?: InputMaybe<Scalars['Boolean']>;
};

export type Count = {
  __typename?: 'Count';
  count?: Maybe<Scalars['Int']>;
};

export type Customer = {
  __typename?: 'Customer';
  business?: Maybe<Business>;
  cart?: Maybe<Order>;
  emailVerified: Scalars['Boolean'];
  emails: Array<Email>;
  feedback: Array<Feedback>;
  firstName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  orders: Array<Order>;
  phones: Array<Phone>;
  pronouns: Scalars['String'];
  roles: Array<CustomerRole>;
  status: AccountStatus;
  theme: Scalars['String'];
};

export type CustomerInput = {
  business?: InputMaybe<BusinessInput>;
  emails?: InputMaybe<Array<EmailInput>>;
  firstName?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  lastName?: InputMaybe<Scalars['String']>;
  phones?: InputMaybe<Array<PhoneInput>>;
  pronouns?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<AccountStatus>;
  theme?: InputMaybe<Scalars['String']>;
};

export type CustomerRole = {
  __typename?: 'CustomerRole';
  customer: Customer;
  role: Role;
};

export type Discount = {
  __typename?: 'Discount';
  businesses: Array<Business>;
  comment?: Maybe<Scalars['String']>;
  discount: Scalars['Float'];
  id: Scalars['ID'];
  skus: Array<Sku>;
  terms?: Maybe<Scalars['String']>;
  title: Scalars['String'];
};

export type DiscountInput = {
  businessIds?: InputMaybe<Array<Scalars['ID']>>;
  comment?: InputMaybe<Scalars['String']>;
  discount: Scalars['Float'];
  id?: InputMaybe<Scalars['ID']>;
  skuIds?: InputMaybe<Array<Scalars['ID']>>;
  terms?: InputMaybe<Scalars['String']>;
  title: Scalars['String'];
};

export type Email = {
  __typename?: 'Email';
  business?: Maybe<Business>;
  customer?: Maybe<Customer>;
  emailAddress: Scalars['String'];
  id: Scalars['ID'];
  receivesDeliveryUpdates: Scalars['Boolean'];
};

export type EmailInput = {
  businessId?: InputMaybe<Scalars['ID']>;
  customerId?: InputMaybe<Scalars['ID']>;
  emailAddress: Scalars['String'];
  id?: InputMaybe<Scalars['ID']>;
  receivesDeliveryUpdates?: InputMaybe<Scalars['Boolean']>;
};

export type Feedback = {
  __typename?: 'Feedback';
  customer?: Maybe<Customer>;
  id: Scalars['ID'];
  text: Scalars['String'];
};

export type FeedbackInput = {
  customerId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  text: Scalars['String'];
};

export type Image = {
  __typename?: 'Image';
  alt?: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  files?: Maybe<Array<ImageFile>>;
  hash: Scalars['String'];
};

export type ImageFile = {
  __typename?: 'ImageFile';
  hash: Scalars['String'];
  height: Scalars['Int'];
  src: Scalars['String'];
  width: Scalars['Int'];
};

export enum ImageSize {
  L = 'L',
  M = 'M',
  Ml = 'ML',
  S = 'S',
  Xl = 'XL',
  Xs = 'XS',
  Xxl = 'XXL',
  Xxs = 'XXS'
}

export type ImageUpdate = {
  alt?: InputMaybe<Scalars['String']>;
  description?: InputMaybe<Scalars['String']>;
  hash: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addAddress: Address;
  addBusiness: Business;
  addCustomer: Customer;
  addCustomerRole: Customer;
  addDiscount: Discount;
  addEmail: Email;
  addFeedback: Feedback;
  addImages: Array<AddImageResponse>;
  addPhone: Phone;
  addProduct: Product;
  addRole: Role;
  addSku: Sku;
  cancelOrder?: Maybe<OrderStatus>;
  changeCustomerStatus?: Maybe<Scalars['Boolean']>;
  deleteAddresses: Count;
  deleteBusinesses: Count;
  deleteCustomer?: Maybe<Scalars['Boolean']>;
  deleteDiscounts: Count;
  deleteEmails: Count;
  deleteFeedbacks: Count;
  deleteImages: Count;
  deleteImagesByLabel: Count;
  deleteOrderItems: Count;
  deleteOrders: Count;
  deletePhones: Count;
  deleteProducts: Count;
  deleteRoles: Count;
  deleteSkus: Count;
  login: Customer;
  logout?: Maybe<Scalars['Boolean']>;
  removeCustomerRole: Count;
  requestPasswordChange?: Maybe<Scalars['Boolean']>;
  resetPassword: Customer;
  signUp: Customer;
  submitOrder?: Maybe<Scalars['Boolean']>;
  updateAddress: Address;
  updateBusiness: Business;
  updateCustomer: Customer;
  updateDiscount: Discount;
  updateEmail: Email;
  updateImages: Scalars['Boolean'];
  updateOrder: Order;
  updatePhone: Phone;
  updateProduct: Product;
  updateRole: Role;
  updateSku: Sku;
  uploadAvailability?: Maybe<Scalars['Boolean']>;
  upsertOrderItem: OrderItem;
  writeAssets?: Maybe<Scalars['Boolean']>;
};


export type MutationAddAddressArgs = {
  input: AddressInput;
};


export type MutationAddBusinessArgs = {
  input: BusinessInput;
};


export type MutationAddCustomerArgs = {
  input: CustomerInput;
};


export type MutationAddCustomerRoleArgs = {
  id: Scalars['ID'];
  roleId: Scalars['ID'];
};


export type MutationAddDiscountArgs = {
  input: DiscountInput;
};


export type MutationAddEmailArgs = {
  input: EmailInput;
};


export type MutationAddFeedbackArgs = {
  input: FeedbackInput;
};


export type MutationAddImagesArgs = {
  alts?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  descriptions?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  files: Array<Scalars['Upload']>;
  labels?: InputMaybe<Array<Scalars['String']>>;
};


export type MutationAddPhoneArgs = {
  input: PhoneInput;
};


export type MutationAddProductArgs = {
  input: ProductInput;
};


export type MutationAddRoleArgs = {
  input: RoleInput;
};


export type MutationAddSkuArgs = {
  input: SkuInput;
};


export type MutationCancelOrderArgs = {
  id: Scalars['ID'];
};


export type MutationChangeCustomerStatusArgs = {
  id: Scalars['ID'];
  status: AccountStatus;
};


export type MutationDeleteAddressesArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteBusinessesArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteCustomerArgs = {
  id: Scalars['ID'];
  password?: InputMaybe<Scalars['String']>;
};


export type MutationDeleteDiscountsArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteEmailsArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteFeedbacksArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteImagesArgs = {
  hashes: Array<Scalars['String']>;
};


export type MutationDeleteImagesByLabelArgs = {
  labels: Array<Scalars['String']>;
};


export type MutationDeleteOrderItemsArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteOrdersArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeletePhonesArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteProductsArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteRolesArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationDeleteSkusArgs = {
  ids: Array<Scalars['ID']>;
};


export type MutationLoginArgs = {
  email?: InputMaybe<Scalars['String']>;
  password?: InputMaybe<Scalars['String']>;
  verificationCode?: InputMaybe<Scalars['String']>;
};


export type MutationRemoveCustomerRoleArgs = {
  id: Scalars['ID'];
  roleId: Scalars['ID'];
};


export type MutationRequestPasswordChangeArgs = {
  email: Scalars['String'];
};


export type MutationResetPasswordArgs = {
  code: Scalars['String'];
  id: Scalars['ID'];
  newPassword: Scalars['String'];
};


export type MutationSignUpArgs = {
  business: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  marketingEmails: Scalars['Boolean'];
  password: Scalars['String'];
  phone: Scalars['String'];
  pronouns?: InputMaybe<Scalars['String']>;
  theme: Scalars['String'];
};


export type MutationSubmitOrderArgs = {
  id: Scalars['ID'];
};


export type MutationUpdateAddressArgs = {
  input: AddressInput;
};


export type MutationUpdateBusinessArgs = {
  input: BusinessInput;
};


export type MutationUpdateCustomerArgs = {
  currentPassword: Scalars['String'];
  input: CustomerInput;
  newPassword?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateDiscountArgs = {
  input: DiscountInput;
};


export type MutationUpdateEmailArgs = {
  input: EmailInput;
};


export type MutationUpdateImagesArgs = {
  data: Array<ImageUpdate>;
  deleting?: InputMaybe<Array<Scalars['String']>>;
  label?: InputMaybe<Scalars['String']>;
};


export type MutationUpdateOrderArgs = {
  input?: InputMaybe<OrderInput>;
};


export type MutationUpdatePhoneArgs = {
  input: PhoneInput;
};


export type MutationUpdateProductArgs = {
  input: ProductInput;
};


export type MutationUpdateRoleArgs = {
  input: RoleInput;
};


export type MutationUpdateSkuArgs = {
  input: SkuInput;
};


export type MutationUploadAvailabilityArgs = {
  file: Scalars['Upload'];
};


export type MutationUpsertOrderItemArgs = {
  orderId?: InputMaybe<Scalars['ID']>;
  quantity: Scalars['Int'];
  skuId: Scalars['ID'];
};


export type MutationWriteAssetsArgs = {
  files: Array<Scalars['Upload']>;
};

export type Order = {
  __typename?: 'Order';
  address?: Maybe<Address>;
  customer: Customer;
  desiredDeliveryDate?: Maybe<Scalars['Date']>;
  expectedDeliveryDate?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  isDelivery?: Maybe<Scalars['Boolean']>;
  items: Array<OrderItem>;
  specialInstructions?: Maybe<Scalars['String']>;
  status: OrderStatus;
};

export type OrderInput = {
  desiredDeliveryDate?: InputMaybe<Scalars['Date']>;
  id?: InputMaybe<Scalars['ID']>;
  isDelivery?: InputMaybe<Scalars['Boolean']>;
  items?: InputMaybe<Array<OrderItemInput>>;
  specialInstructions?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<OrderStatus>;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  id: Scalars['ID'];
  order: Order;
  quantity: Scalars['Int'];
  sku: Sku;
};

export type OrderItemInput = {
  id: Scalars['ID'];
  quantity?: InputMaybe<Scalars['Int']>;
};

export enum OrderStatus {
  Approved = 'APPROVED',
  CanceledByAdmin = 'CANCELED_BY_ADMIN',
  CanceledByCustomer = 'CANCELED_BY_CUSTOMER',
  Delivered = 'DELIVERED',
  Draft = 'DRAFT',
  InTransit = 'IN_TRANSIT',
  Pending = 'PENDING',
  PendingCancel = 'PENDING_CANCEL',
  Rejected = 'REJECTED',
  Scheduled = 'SCHEDULED'
}

export type Phone = {
  __typename?: 'Phone';
  business?: Maybe<Business>;
  customer?: Maybe<Customer>;
  id: Scalars['ID'];
  number: Scalars['String'];
  receivesDeliveryUpdates: Scalars['Boolean'];
};

export type PhoneInput = {
  businessID?: InputMaybe<Scalars['ID']>;
  customerId?: InputMaybe<Scalars['ID']>;
  id?: InputMaybe<Scalars['ID']>;
  number: Scalars['String'];
  receivesDeliveryUpdates?: InputMaybe<Scalars['Boolean']>;
};

export type Product = {
  __typename?: 'Product';
  featured: Scalars['Boolean'];
  id: Scalars['ID'];
  images?: Maybe<Array<ProductImage>>;
  name: Scalars['String'];
  skus?: Maybe<Array<Sku>>;
  traits?: Maybe<Array<ProductTrait>>;
};

export type ProductImage = {
  __typename?: 'ProductImage';
  image: Image;
  index: Scalars['Int'];
  isDisplay: Scalars['Boolean'];
};

export type ProductImageInput = {
  hash: Scalars['String'];
  isDisplay?: InputMaybe<Scalars['Boolean']>;
};

export type ProductInput = {
  id?: InputMaybe<Scalars['ID']>;
  images?: InputMaybe<Array<ProductImageInput>>;
  name: Scalars['String'];
  skus?: InputMaybe<Array<SkuInput>>;
  traits: Array<InputMaybe<ProductTraitInput>>;
};

export type ProductTrait = {
  __typename?: 'ProductTrait';
  id: Scalars['ID'];
  name: Scalars['String'];
  value: Scalars['String'];
};

export type ProductTraitInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  addresses: Array<Address>;
  businesses: Array<Business>;
  customers: Array<Customer>;
  discounts: Array<Discount>;
  emails: Array<Email>;
  feedbacks: Array<Feedback>;
  imagesByLabel: Array<Image>;
  orders: Array<Order>;
  phones: Array<Phone>;
  products: Array<Product>;
  profile: Customer;
  readAssets: Array<Maybe<Scalars['String']>>;
  roles: Array<Role>;
  skus: Array<Sku>;
  tasks: Array<Task>;
  traitNames: Array<Scalars['String']>;
  traitOptions: Array<TraitOptions>;
  traitValues: Array<Scalars['String']>;
};


export type QueryImagesByLabelArgs = {
  label: Scalars['String'];
};


export type QueryOrdersArgs = {
  ids?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryProductsArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  ids?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<SkuSortBy>;
};


export type QueryReadAssetsArgs = {
  files: Array<Scalars['String']>;
};


export type QuerySkusArgs = {
  ids?: InputMaybe<Array<Scalars['ID']>>;
  onlyInStock?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
  sortBy?: InputMaybe<SkuSortBy>;
};


export type QueryTasksArgs = {
  ids?: InputMaybe<Array<Scalars['ID']>>;
  status?: InputMaybe<TaskStatus>;
};


export type QueryTraitValuesArgs = {
  name: Scalars['String'];
};

export type Response = {
  __typename?: 'Response';
  code?: Maybe<Scalars['Int']>;
  message: Scalars['String'];
};

export type Role = {
  __typename?: 'Role';
  customers: Array<Customer>;
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  title: Scalars['String'];
};

export type RoleInput = {
  customerIds?: InputMaybe<Array<Scalars['ID']>>;
  description?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  title: Scalars['String'];
};

export type Sku = {
  __typename?: 'Sku';
  availability: Scalars['Int'];
  discounts?: Maybe<Array<SkuDiscount>>;
  id: Scalars['ID'];
  isDiscountable: Scalars['Boolean'];
  note?: Maybe<Scalars['String']>;
  price?: Maybe<Scalars['String']>;
  product: Product;
  size?: Maybe<Scalars['String']>;
  sku: Scalars['String'];
  status: SkuStatus;
};

export type SkuDiscount = {
  __typename?: 'SkuDiscount';
  discount: Discount;
};

export type SkuInput = {
  availability?: InputMaybe<Scalars['Int']>;
  discountIds?: InputMaybe<Array<Scalars['ID']>>;
  id?: InputMaybe<Scalars['ID']>;
  isDiscountable?: InputMaybe<Scalars['Boolean']>;
  note?: InputMaybe<Scalars['String']>;
  price?: InputMaybe<Scalars['String']>;
  productId?: InputMaybe<Scalars['ID']>;
  size?: InputMaybe<Scalars['String']>;
  sku: Scalars['String'];
  status?: InputMaybe<SkuStatus>;
};

export enum SkuSortBy {
  Az = 'AZ',
  Featured = 'Featured',
  Newest = 'Newest',
  Oldest = 'Oldest',
  PriceHighLow = 'PriceHighLow',
  PriceLowHigh = 'PriceLowHigh',
  Za = 'ZA'
}

export enum SkuStatus {
  Active = 'ACTIVE',
  Deleted = 'DELETED',
  Inactive = 'INACTIVE'
}

export type Task = {
  __typename?: 'Task';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  result?: Maybe<Scalars['String']>;
  resultCode?: Maybe<Scalars['Int']>;
  status: TaskStatus;
  taskId: Scalars['Int'];
};

export enum TaskStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Inactive = 'INACTIVE',
  Unknown = 'UNKNOWN'
}

export type TraitOptions = {
  __typename?: 'TraitOptions';
  name: Scalars['String'];
  values: Array<Scalars['String']>;
};
