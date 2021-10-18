// Define common props
import { Order, Role } from "@local/shared";

export type SessionChecked = boolean;
export type OnSessionUpdate = any;
export type Business = any;
export type UserRoles = Role[] | null;
export type Cart = Order | null;

export interface CommonProps {
    sessionChecked: SessionChecked;
    onSessionUpdate: OnSessionUpdate;
    business: Business;
    userRoles: UserRoles;
    cart: Cart;
}