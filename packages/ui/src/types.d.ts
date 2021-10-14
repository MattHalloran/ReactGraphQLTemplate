import { Order, Role } from "@local/shared";

// Allow local font import
declare module '*.woff';
declare module '*.woff2';

// Define common props
export interface CommonProps {
    sessionChecked: boolean;
    onSessionUpdate: any;
    business: any;
    userRoles: Role[];
    cart: Order | null;
    onRedirect: (link: string) => void;
}