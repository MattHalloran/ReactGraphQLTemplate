export const BUSINESS_NAME = "New Life Nursery";
export const FULL_BUSINESS_NAME = "New Life Nursery Inc.";
export const GOOGLE_MAPS_ADDRESS = "https://www.google.com/maps/place/106+S+Woodruff+Rd,+Bridgeton,+NJ+08302/@39.4559443,-75.1793432,17z/";

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
    PopupOpen: "popupOpen",
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
}

export const ACCOUNT_STATUS = {
    Deleted: -1,
    Unlocked: 1,
    WaitingApproval: 2,
    SoftLock: 3,
    HardLock: 4,
}