import codes from 'query/codes.json';
import orderStatus from 'query/orderStatus.json';

export const WEBSITE_URL = 'https://www.newlifenurseryinc.com/';
export const BUSINESS_NAME = {
    Short: 'New Life Nursery Inc.',
    Long: 'New Life Nursery Inc.',
}
export const ADDRESS = {
    Label: '106 South Woodruff Road Bridgeton, NJ 08302',
    Link: 'https://www.google.com/maps/place/106+S+Woodruff+Rd,+Bridgeton,+NJ+08302/@39.4559443,-75.1793432,17z/',
}
export const PHONE = {
    Label: '(856) 455-3601',
    Link: 'tel:+18564553601',
}
export const FAX = {
    Label: '(856) 451-1530',
    Link: 'tel:+18564511530',
}
export const EMAIL = {
    Label: 'info@newlifenurseryinc.com',
    Link: 'mailto:info@newlifenurseryinc.com',
}

export const STATUS_CODES = codes;
export const ORDER_STATUS = orderStatus;

export const ORDER_STATES = [
    {
        label: 'Canceled by Admin',
        value: -4,
    },
    {
        label: 'Canceled by User',
        value: -3,
    },
    {
        label: 'Pending Cancel',
        value: -2,
    },
    {
        label: 'Rejected',
        value: -1,
    },
    {
        label: 'Pending',
        value: 1,
    },
    {
        label: 'Approved',
        value: 2,
    },
    {
        label: 'Scheduled',
        value: 3,
    },
    {
        label: 'In Transit',
        value: 4,
    },
    {
        label: 'Delivered',
        value: 5,
    },
]

export const PLANT_ATTRIBUTES = [
    'Drought Tolerance',
    'Grown Height',
    'Grown Spread',
    'Growth Rate',
    'Optimal Light',
    'Salt Tolerance',
]

export const DEFAULT_PRONOUNS = [
    "Custom",
    "he/him/his",
    "she/her/hers",
    "they/them/theirs",
    "ze/zir/zirs",
    "ze/hir/hirs",
]

export const SORT_OPTIONS = [
    {
        label: 'A-Z',
        value: 'az',
    },
    {
        label: 'Z-A',
        value: 'za',
    },
    {
        label: 'Price: Low to High',
        value: 'lth',
    },
    {
        label: 'Price: High to Low',
        value: 'htl',
    },
    {
        label: 'Featured',
        value: 'feat',
    },
    {
        label: 'Newest',
        value: 'new',
    },
    {
        label: 'Oldest',
        value: 'old',
    }
]

export const USER_ROLES = {
    Customer: "Customer",
    Admin: "Admin",
}

export const LOCAL_STORAGE = {
    Likes: "likes",
    Cart: "cart",
    Theme: "theme",
    Session: "session",
    Roles: "roles",
}

export const PUBS = {
    ...LOCAL_STORAGE,
    Loading: "loading",
    AlertDialog: "alertDialog",
    Snack: "snack",
    BurgerMenuOpen: "burgerMenuOpen",
    ArrowMenuOpen: "arrowMenuOpen",
}

export const LINKS = {
    About: "/about",
    Admin: "/admin",
    AdminContactInfo: "/admin/contact-info",
    AdminCustomers: "/admin/customers",
    AdminGallery: "/admin/gallery",
    AdminInventory: "/admin/inventory",
    AdminOrders: "/admin/orders",
    Cart: "/cart",
    Contact: "/contact",
    ForgotPassword: "/forgot-password",
    Gallery: "/gallery",
    Home: "/",
    LogIn: "/login",
    PrivacyPolicy: "/privacy-policy",
    Profile: "/profile",
    Register: "/register",
    Shopping: "/shopping",
    Terms: "/terms-and-conditions",
}

export const ACCOUNT_STATUS = {
    Deleted: -1,
    Unlocked: 1,
    WaitingApproval: 2,
    SoftLock: 3,
    HardLock: 4,
}