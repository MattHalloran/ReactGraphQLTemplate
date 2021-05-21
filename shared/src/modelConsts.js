module.exports = {
    ACCOUNT_STATUS: {
        Deleted: 'Deleted',
        Unlocked: 'Unlocked',
        SoftLock: 'Soft Lock',
        HardLock: 'Hard Lock'
    },
    DEFAULT_PRONOUNS: [
        "Custom",
        "he/him/his",
        "she/her/hers",
        "they/them/theirs",
        "ze/zir/zirs",
        "ze/hir/hirs",
    ],
    IMAGE_EXTENSION: {
        Bmp: 'bmp',
        Gif: 'gif',
        Png: 'png',
        Jpg: 'jpg',
        Jpeg: 'jpeg',
        Ico: 'ico'
    },
    // Possible image sizes stored, and their max size
    IMAGE_SIZE: {
        XS: 64,
        S: 128,
        M: 256,
        ML: 512,
        L: 1024
    },
    IMAGE_USE: {
        Hero: 'Hero',
        Gallery: 'Gallery',
        PlantFlower: 'Plant Flower',
        PlantLeaf: 'Plant Leaf',
        PlantFruit: 'Plant Fruit',
        PlantBark: 'Plant Bark',
        PlantHabit: 'Plant Habit',
        Display: 'Display'
    },
    // CANCELED_BY_ADMIN    | Admin canceled the order at any point before delivery
    // CANCELED_BY_USER     |   1) User canceled order before approval (i.e. no admin approval needed), OR
    //                          2) PENDING_CANCEL was approved by admin
    // PENDING_CANCEL       | User canceled order after approval (i.e. admin approval needed)
    // REJECTED             | Order was pending, but admin denied it
    // DRAFT                | Order that hasn't been submitted yet (i.e. cart)
    // PENDING              | Order that has been submitted, but not approved by admin yet
    // APPROVED             | Order that has been approved by admin
    // SCHEDULED            | Order has been scheduled for delivery
    // IN_TRANSIT           | Order is currently being delivered
    // DELIVERED            | Order has been delivered
    ORDER_STATUS: {
        CanceledByAdmin: 'Canceled By Admin',
        CanceledByUser: 'Canceled By User',
        PendingCancel: 'Pending Cancel',
        Rejected: 'Rejected',
        Draft: 'Draft',
        Pending: 'Pending',
        Approved: 'Approved',
        Scheduled: 'Scheduled',
        InTransit: 'In Transit',
        Delivered: 'Delivered'
    },
    SKU_STATUS: {
        Deleted: 'Deleted',
        Inactive: 'Inactive',
        Active: 'Active',
    },
    TASK_STATUS: {
        Unknown: 'Unknown',
        Failed: 'Failed',
        Active: 'Active',
        Completed: 'Completed',
    },
    THEME: {
        Light: 'light',
        Dark: 'dark'
    },
    TRAIT_NAME: {
        DroughtTolerance: 'Drought tolerance',
        GrownHeight: 'Grown height',
        GrownSpread: 'Grown spread',
        GrowthRate: 'Growth rate',
        JerseryNative: 'Jersey native',
        OptimalLight: 'Optimal light',
        PlantType: 'Plant type',
        SaltTolerance: 'Salt tolerance',
        AttractsPollinatorsAndWildlife: 'Attracts pollinators and wildlife',
        BloomTime: 'Bloom time',
        BloomColor: 'Bloom color',
        Zone: 'Zone',
        PhysiographicRegion: 'Physiographic region',
        SoilMoisture: 'Soil moisture',
        SoilPh: 'Soil PH',
        SoilType: 'Soil Type',
        LightRange: 'Light range'
    },
    USER_ROLES: {
        Customer: "Customer",
        Admin: "Admin",
    }
}