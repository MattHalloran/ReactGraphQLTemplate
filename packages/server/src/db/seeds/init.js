import { ACCOUNT_STATUS } from '@local/shared';
import { TABLES } from '../tables';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { HASHING_ROUNDS } from '../models/user';

export async function seed(knex) {
    // // Truncate existing tables (delete all data)
    // await Object.values(TABLES).forEach(async t => {
    //     await knex.raw(`TRUNCATE TABLE "${t}" CASCADE`);
    // });

    // Determine if roles need to be added
    const curr_role_titles = (await db(TABLES.Role).select('title')).map(r => r.title);
    const role_data = [];
    if (!curr_role_titles.includes('Customer')) {
        role_data.push({ id: uuidv4(), title: 'Customer', description: 'This role allows a user to order products' });
    }
    if (!curr_role_titles.includes('Admin')) {
        role_data.push({
            id: uuidv4(), title: 'Admin', description: 'This role grants administrative access. This comes with the ability to \
        approve new customers, change customer information, modify inventory and \
        contact hours, and more.' });
    }
    // Insert roles
    if (roles_to_add.length > 0) {
        await knex(TABLES.Role).insert(role_data);
    }

    // Determine if admin needs to be added
    console.log('ADMIN EMAIL IS', process.env.ADMIN_EMAIL);
    const role_admin_id = db(TABLES.Role).where('title', 'Admin').first();
    const has_admin = (await knex(TABLES.UserRoles).where('roleId', role_admin_id).count()) > 0;
    if (!has_admin) {
        console.log('INSERTING ADMIN')
        // Insert admin
        const user_admin_id = await knex(TABLES.User).insert([
            {
                id: uuidv4(),
                firstName: 'admin',
                lastName: 'account',
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, HASHING_ROUNDS),
                accountApproved: true,
                emailVerified: true,
                status: ACCOUNT_STATUS.Unlocked
            }
        ]).returning('id');

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
}