export const ASSOCIATION_TABLES = {
    BusinessDiscounts: 'business_discounts',
    ImageLabels: 'image_labels',
    PlantImages: 'plant_images',
    SkuDiscounts: 'sku_discounts',
    SkuSizes: 'sku_sizes',
    CustomerRoles: 'customer_roles',
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
    PlantTrait: 'plant_trait',
    Role: 'role',
    Task: 'queue_task',
    Trait: 'plant_trait',
    Sku: 'sku',
    Customer: 'customer', // User is a reserved word in many databases, so we use customer instead
}

export const TABLES = {
    ...ASSOCIATION_TABLES,
    ...STANDARD_TABLES
}