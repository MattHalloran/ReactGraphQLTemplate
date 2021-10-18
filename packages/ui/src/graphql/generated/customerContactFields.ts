/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: customerContactFields
// ====================================================

export interface customerContactFields_emails {
  __typename: "Email";
  id: string;
  emailAddress: string;
  receivesDeliveryUpdates: boolean;
}

export interface customerContactFields_phones {
  __typename: "Phone";
  id: string;
  number: string;
  receivesDeliveryUpdates: boolean;
}

export interface customerContactFields_business {
  __typename: "Business";
  id: string;
  name: string;
}

export interface customerContactFields {
  __typename: "Customer";
  id: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  emails: customerContactFields_emails[];
  phones: customerContactFields_phones[];
  business: customerContactFields_business | null;
}
