export type UUID = string | number;

export interface ExistingObject {
    id: UUID;
}

export interface Address {
    id: UUID;
    tag?: string;
    name?: string;
    country: string;
    administrativeArea: string;
    subAdministrativeArea?: string;
    locality: string;
    postalCode: string;
    throughfare: string;
    premise?: string;
    deliveryInstructions?: string;
    businessId?: UUID;
    business?: Business;
}

export interface Business {
    id: UUID;
    name: string;
    subscribedToNewsletters: boolean;
    addresses: Address[];
    discounts: BusinessDiscounts[];
    employees: Customer[];
    emails: Email[];
    phones: Phone[];
}

export interface Customer {
    id: UUID;
    firstName: string;
    lastName: string;
    pronouns: string;
    theme: string;
    password?: string;
    emailVerified: boolean;
    status: string;
    businessId: UUID;
    business: Business;
    roles: CustomerRoles[];
    emails: Email[];
    feedback: Feedback[];
    orders: Order[];
    phones: Phone[];
}