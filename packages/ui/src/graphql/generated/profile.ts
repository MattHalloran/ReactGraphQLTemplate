/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: profile
// ====================================================

export interface profile_profile_business {
  __typename: "Business";
  id: string;
  name: string;
}

export interface profile_profile_emails {
  __typename: "Email";
  id: string;
  emailAddress: string;
  receivesDeliveryUpdates: boolean;
}

export interface profile_profile_phones {
  __typename: "Phone";
  id: string;
  number: string;
  receivesDeliveryUpdates: boolean;
}

export interface profile_profile {
  __typename: "Customer";
  id: string;
  firstName: string;
  lastName: string;
  pronouns: string;
  theme: string;
  business: profile_profile_business | null;
  emails: profile_profile_emails[];
  phones: profile_profile_phones[];
}

export interface profile {
  profile: profile_profile;
}
