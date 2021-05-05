import { TYPES, THEME, ACCOUNT_STATUS, TRAIT_NAME, SKU_STATUS, IMAGE_EXTENSION, IMAGE_USE, ORDER_STATUS, TASK_STATUS } from '../types';
import { TABLES } from '../tables';

export async function up (knex) {
    await knex.schema.createTable(TABLES.Task, (table) => {
        table.increments();
        table.integer('taskId').notNullable();
        table.string('name', 256).notNullable();
        table.enu(TYPES.TaskStatus, Object.values(TASK_STATUS)).defaultTo(TASK_STATUS.Active).notNullable();
        table.string('description', 1024);
        table.string('result', 8192);
        table.integer('resultCode');
    });
    await knex.schema.createTable(TABLES.Business, (table) => {
        table.increments();
        table.string('name', 128).notNullable();
        table.boolean('subscribedToNewsletters').defaultTo(true).notNullable();
    });
    await knex.schema.createTable(TABLES.User, (table) => {
        table.uuid('id').primary();
        table.string('firstName', 128).notNullable();
        table.string('lastName', 128).notNullable();
        table.string('pronouns', 128).defaultTo('they/them').notNullable();
        table.string('theme').defaultTo(THEME.Light).notNullable();
        table.string('password', 256).notNullable();
        table.integer('loginAttempts').defaultTo(0).notNullable();
        table.timestamp('lastLoginAttempt').defaultTo(knex.fn.now()).notNullable();
        table.string('sessionToken', 256);
        table.boolean('accountApproved').defaultTo(false).notNullable();
        table.enu(TYPES.AccountStatus, Object.values(ACCOUNT_STATUS)).defaultTo(ACCOUNT_STATUS.WaitingEmailVerification).notNullable();
        table.integer('businessId').references('id').inTable(TABLES.Business);
    });
    await knex.schema.createTable(TABLES.Discount, (table) => {
        table.increments();
        table.decimal('discount', 4, 4).defaultTo(0).notNullable();
        table.string('title', 128).defaultTo('').notNullable();
        table.string('comment', 1024);
        table.string('terms', 4096);
    });
    await knex.schema.createTable(TABLES.Feedback, (table) => {
        table.increments();
        table.string('text', 4096).notNullable();
        table.integer('userId').references('id').inTable(TABLES.User);
    });
    await knex.schema.createTable(TABLES.Role, (table) => {
        table.increments();
        table.string('title', 128).notNullable().unique();
        table.string('description', 2048);
    });
    await knex.schema.createTable(TABLES.Address, (table) => {
        // tag - Optional tag associated with address (ex: 'Main address')
        // name - Optional name, sometimes required for internal mail delivery systems
        // country - ISO 3166 country code
        // administrative_area - State/Province/Region (ISO code when available [ex: NJ])
        // sub_administrative_area - County/District (currently unused)
        // locality - City/Town
        // postal_code - Postal/Zip code
        // throughfare - Street Address
        // premise - Apartment, Suite, P.O. box number, etc.
        table.increments();
        table.string('tag', 128);
        table.string('name', 128);
        table.string('country', 2).defaultTo('US').notNullable();
        table.string('administrativeArea', 64).notNullable();
        table.string('subAdministrativeArea', 64);
        table.string('locality', 64).notNullable();
        table.string('postalCode', 16).notNullable();
        table.string('throughfare', 256).notNullable();
        table.string('premise', 64);
        table.string('deliveryInstructions', 1024);
        table.integer('businessId').references('id').inTable(TABLES.Business);
    });
    await knex.schema.createTable(TABLES.Email, (table) => {
        //TODO CONSTRAINT chk_keys check (user_id is not null or business_id is not null)
        table.increments();
        table.string('emailAddress', 128).notNullable().unique();
        table.boolean('receivesDeliveryUpdates').defaultTo(true).notNullable();
        table.integer('userId').references('id').inTable(TABLES.User);
        table.integer('businessId').references('id').inTable(TABLES.Business);
    });
    await knex.schema.createTable(TABLES.Phone, (table) => {
        // Numbers should be stored without formatting
        //TODO CONSTRAINT chk_keys check (user_id is not null or business_id is not null),
        //TODO UNIQUE (number, country_code, extension)
        table.increments();
        table.string('number', 10).notNullable();
        table.string('countryCode', 8).defaultTo('1').notNullable();
        table.string('extension', 8);
        table.boolean('receivesDeliveryUpdates').defaultTo(true).notNullable();
        table.integer('userId').references('id').inTable(TABLES.User);
        table.integer('businessId').references('id').inTable(TABLES.Business);
    });
    await knex.schema.createTable(TABLES.Trait, (table) => {
        //TODO UNIQUE (trait, value)
        table.increments();
        table.enu(TYPES.TraitName, Object.values(TRAIT_NAME)).notNullable();
        table.string('value', 512).notNullable();
    });
    await knex.schema.createTable(TABLES.Plant, (table) => {
        table.increments();
        table.string('latinName', 256).notNullable().unique();
        table.string('commonName', 256);
        table.string('plantnetUrl', 2048);
        table.string('yardsUrl', 2048);
        table.string('description', 4096);
        table.boolean('jerseyNative');
        table.integer('deerResistanceId').references('id').inTable(TABLES.Trait);
        table.integer('droughtToleranceId').references('id').inTable(TABLES.Trait);
        table.integer('grownHeightId').references('id').inTable(TABLES.Trait);
        table.integer('grownSpreadId').references('id').inTable(TABLES.Trait);
        table.integer('growthRateId').references('id').inTable(TABLES.Trait);
        table.integer('optimalLightId').references('id').inTable(TABLES.Trait);
        table.integer('saltToleranceId').references('id').inTable(TABLES.Trait);
        table.integer('displayImageId').references('id').inTable(TABLES.Image);
    });
    await knex.schema.createTable(TABLES.Sku, (table) => {
        table.increments();
        table.string('sku', 32).notNullable();
        table.boolean('isDiscountable').defaultTo(true).notNullable();
        table.string('size', 32).defaultTo('N/A').notNullable();
        table.string('note', 2048);
        table.integer('availability').defaultTo(0).notNullable();
        table.string('price', 16).defaultTo('N/A').notNullable();
        table.enu(TYPES.SkuStatus, Object.values(SKU_STATUS)).defaultTo(SKU_STATUS.Active).notNullable();
        table.integer('plantId').references('id').inTable(TABLES.Plant);
        table.timestamps(true, true);
    });
    await knex.schema.createTable(TABLES.Image, (table) => {
        //TODO UNIQUE (hash, used_for),
        //TODO UNIQUE (foler, file_name, extension)
        table.increments();
        table.string('folder', 256).notNullable();
        table.string('fileName', 256).notNullable();
        table.enu(TYPES.ImageExtension, Object.values(IMAGE_EXTENSION)).notNullable();
        table.string('alt', 256);
        table.string('hash', 128).notNullable();
        table.enu(TYPES.ImageUse, Object.values(IMAGE_USE)).notNullable();
        table.integer('width').notNullable();
        table.integer('height').notNullable();
        table.integer('plantId').references('id').inTable(TABLES.Plant);
    });
    await knex.schema.createTable(TABLES.Order, (table) => {
        table.increments();
        table.enu(TYPES.OrderStatus, Object.values(ORDER_STATUS)).defaultTo(ORDER_STATUS.Draft).notNullable();
        table.string('specialInstructions', 1024);
        table.timestamp('desiredDeliveryDate');
        table.timestamp('expectedDeliveryDate');
        table.boolean('isDelivery').defaultTo(true).notNullable();
        table.integer('addressId').references('id').inTable(TABLES.Address);
        table.integer('userId').references('id').inTable(TABLES.User);
    });
    await knex.schema.createTable(TABLES.OrderItem, (table) => {
        table.increments();
        table.integer('quantity').defaultTo(1).notNullable();
        table.integer('orderId').references('id').inTable(TABLES.Order);
        table.integer('skuId').references('id').inTable(TABLES.Sku);
    });
    await knex.schema.createTable(TABLES.BusinessDiscounts, (table) => {
        table.increments();
        table.integer('businessId').references('id').inTable(TABLES.Business);
        table.integer('discountId').references('id').inTable(TABLES.Discount);
    });
    await knex.schema.createTable(TABLES.PlantTraits, (table) => {
        table.increments();
        table.integer('plantId').references('id').inTable(TABLES.Plant);
        table.integer('TraitId').references('id').inTable(TABLES.Trait);
    });
    await knex.schema.createTable(TABLES.SkuDiscounts, (table) => {
        table.increments();
        table.integer('skuId').references('id').inTable(TABLES.Sku);
        table.integer('discountId').references('id').inTable(TABLES.Discount);
    });
    await knex.schema.createTable(TABLES.UserRoles, (table) => {
        table.increments();
        table.integer('userId').references('id').inTable(TABLES.User);
        table.integer('roleId').references('id').inTable(TABLES.Role);
    });
}

export async function down (knex) {
    await knex.schema.dropTableIfExists(TABLES.UserRoles);
    await knex.schema.dropTableIfExists(TABLES.SkuDiscounts);
    await knex.schema.dropTableIfExists(TABLES.PlantTaits);
    await knex.schema.dropTableIfExists(TABLES.BusinessDiscounts);
    await knex.schema.dropTableIfExists(TABLES.OrderItem);
    await knex.schema.dropTableIfExists(TABLES.Order);
    await knex.schema.dropTableIfExists(TABLES.Image);
    await knex.schema.dropTableIfExists(TABLES.Sku);
    await knex.schema.dropTableIfExists(TABLES.Plant);
    await knex.schema.dropTableIfExists(TABLES.Trait);
    await knex.schema.dropTableIfExists(TABLES.Phone);
    await knex.schema.dropTableIfExists(TABLES.Email);
    await knex.schema.dropTableIfExists(TABLES.Address);
    await knex.schema.dropTableIfExists(TABLES.Role);
    await knex.schema.dropTableIfExists(TABLES.Feedback);
    await knex.schema.dropTableIfExists(TABLES.Discount);
    await knex.schema.dropTableIfExists(TABLES.User);
    await knex.schema.dropTableIfExists(TABLES.Business);
    await knex.schema.dropTableIfExists(TABLES.Task);
}