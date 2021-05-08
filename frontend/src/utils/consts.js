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

export const COOKIE = {
    User: "user",
    Likes: "likes",
    Cart: "cart",
    Theme: "theme",
    Session: "session-f234y7fdiafhdja2",
    Roles: "roles",
}

export const PUBS = {
    ...COOKIE,
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