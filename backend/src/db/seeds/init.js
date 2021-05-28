import { ACCOUNT_STATUS } from '@local/shared';
import { TABLES } from '../tables';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { HASHING_ROUNDS } from '../models/user';

export async function seed(knex) {
    // Truncate existing tables
    await Object.values(TABLES).forEach(async t => {
        await knex.raw(`TRUNCATE TABLE "${t}" CASCADE`);
    });

    // Insert roles
    const role_customer_id = uuidv4();
    const role_admin_id = uuidv4();
    await knex(TABLES.Role).insert([
        { id: role_customer_id, title: 'Customer', description: 'This role allows a user to order products' },
        { id: role_admin_id, title: 'Admin', description: 'This role grants administrative access. This comes with the ability to \
        approve new customers, change customer information, modify inventory and \
        contact hours, and more.' }
    ]);

    // Insert admin. Since we're using knex, the User's password must
    // be hashed manually
    const user_admin_id = uuidv4();
    await knex(TABLES.User).insert([
        { 
            id: user_admin_id,
            firstName: 'admin', 
            lastName: 'account', 
            password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, HASHING_ROUNDS), 
            accountApproved: true,
            emailVerified: true,
            status: ACCOUNT_STATUS.Unlocked
        }
    ]);

    // Insert admin email
    await knex(TABLES.Email).insert([
        {
            emailAddress: process.env.ADMIN_EMAIL,
            receivesDeliveryUpdates: false,
            userId: user_admin_id
        }
    ])

    // Associate the admin account with an admin role
    await knex(TABLES.UserRoles).insert([
        {
            userId: user_admin_id,
            roleId: role_admin_id
        }
    ])
}