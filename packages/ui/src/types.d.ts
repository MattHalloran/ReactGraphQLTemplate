import { Order, Role } from "@local/shared";

// Define common props
export interface CommonProps {
    sessionChecked: boolean;
    onSessionUpdate: any;
    business: any;
    userRoles: Role[];
    cart: Order | null;
}