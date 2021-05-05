import { ACCOUNT_STATUS } from "../type/accountStatusType";
import { TABLES } from "../tables";
import { v4 as uuidv4 } from 'uuid';


export async function seed(knex) {
    // Truncate existing tables
    TABLES.forEach(t => {
        await knex.raw(`TRUNCATE TABLE "${t}" CASCADE`);
    });

    // Insert roles
    await knex(TABLES.Role).insert([
        { id: 1, title: 'Customer', description: 'This role allows a user to order products' },
        { id: 2, title: 'Admin', description: 'This role grants administrative access. This comes with the ability to \
        approve new customers, change customer information, modify inventory and \
        contact hours, and more.' }
    ]);

    // Insert admin
    const admin_id = uuidv4();
    await knex(TABLES.User).insert([
        { 
            id: admin_id,
            first_name: 'admin', 
            last_name: 'account', 
            password: generateHash(process.env.ADMIN_PASSWORD), 
            account_approved: true,
            account_status: ACCOUNT_STATUS.Unlocked
        }
    ]);

    // Insert admin email
    await knex(TABLES.Email).insert([
        {
            email_address: process.env.ADMIN_EMAIL,
            receives_delivery_updates: false,
            user_id: admin_id
        }
    ])

    // Associate the admin account with an admin role
    await knex(TABLES.Role).insert([
        {
            user_id: admin_id,
            role_id: 2
        }
    ])
}