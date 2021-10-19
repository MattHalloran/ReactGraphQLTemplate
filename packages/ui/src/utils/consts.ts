/* eslint-disable @typescript-eslint/no-redeclare */
import { COOKIE, OrderStatus, ValueOf } from '@local/shared';
import { SkuSortBy } from 'graphql/generated/globalTypes';

export const ORDER_FILTERS = [
    {
        label: 'All',
        value: 'All',
    },
    {
        label: 'Canceled by Admin',
        value: OrderStatus.CANCELED_BY_ADMIN,
    },
    {
        label: 'Canceled by Customer',
        value: OrderStatus.CANCELED_BY_CUSTOMER,
    },
    {
        label: 'Pending Cancel',
        value: OrderStatus.PENDING_CANCEL,
    },
    {
        label: 'Rejected',
        value: OrderStatus.REJECTED,
    },
    {
        label: 'Pending',
        value: OrderStatus.PENDING,
    },
    {
        label: 'Approved',
        value: OrderStatus.APPROVED,
    },
    {
        label: 'Scheduled',
        value: OrderStatus.SCHEDULED,
    },
    {
        label: 'In Transit',
        value: OrderStatus.IN_TRANSIT,
    },
    {
        label: 'Delivered',
        value: OrderStatus.DELIVERED,
    },
]

export const SORT_OPTIONS = [
    {
        label: 'A-Z',
        value: SkuSortBy.AZ,
    },
    {
        label: 'Z-A',
        value: SkuSortBy.ZA,
    },
    {
        label: 'Price: Low to High',
        value: SkuSortBy.PriceLowHigh,
    },
    {
        label: 'Price: High to Low',
        value: SkuSortBy.PriceHighLow,
    },
    {
        label: 'Featured',
        value: SkuSortBy.Featured,
    },
    {
        label: 'Newest',
        value: SkuSortBy.Newest,
    },
    {
        label: 'Oldest',
        value: SkuSortBy.Oldest,
    }
]

export const PUBS = {
    ...COOKIE,
    Loading: "loading",
    AlertDialog: "alertDialog",
    Snack: "snack",
    BurgerMenuOpen: "burgerMenuOpen",
    ArrowMenuOpen: "arrowMenuOpen",
    Business: "business",
    Theme: "theme",
}
export type PUBS = ValueOf<typeof PUBS>;

export const LINKS = {
    About: "/about",
    Admin: "/admin",
    AdminContactInfo: "/admin/contact-info",
    AdminCustomers: "/admin/customers",
    AdminGallery: "/admin/gallery",
    AdminHero: "/admin/hero",
    AdminInventory: "/admin/inventory",
    AdminOrders: "/admin/orders",
    Cart: "/cart",
    ForgotPassword: "/forgot-password",
    Gallery: "/gallery",
    Home: "/",
    LogIn: "/login",
    PrivacyPolicy: "/privacy-policy",
    Profile: "/profile",
    Register: "/register",
    ResetPassword: "/password-reset",
    Shopping: "/shopping",
    Terms: "/terms-and-conditions",
}
export type LINKS = ValueOf<typeof LINKS>;