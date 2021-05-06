export const ASSOCIATION_TABLES = {
    BusinessDiscounts: 'business_discounts',
    PlantTraits: 'plant_traits',
    SkuDiscounts: 'sku_discounts',
    SkuSizes: 'sku_sizes',
    UserRoles: 'user_roles',
    UserLikes: 'user_likes'
}

export const STANDARD_TABLES = {
    Address: 'address',
    Business: 'business',
    ContactInfo: 'contact_info',
    Discount: 'discount',
    Email: 'email',
    Feedback: 'feedback',
    Image: 'image',
    Order: 'order',
    OrderItem: 'order_item',
    Phone: 'phone',
    Plant: 'plant',
    Role: 'role',
    Task: 'queue_task',
    Trait: 'plant_trait',
    Sku: 'sku',
    User: 'customer', // User is a reserved word in many databases
}

export const TABLES = {
    ...ASSOCIATION_TABLES,
    ...STANDARD_TABLES
}