import { TABLES } from '../tables';
import bcrypt from 'bcrypt';
import { HASHING_ROUNDS } from '../../consts';
import { db } from '../db';
import pkg from '@prisma/client';
const { PrismaClient, AccountStatus } = pkg;

const prisma = new PrismaClient();

async function main() {
    console.info('🌱 Starting database intial seed...');

    // Find existing roles
    const role_titles = await prisma[TABLES.Role].findMany({ select: { title: true } }).map(r => r.title);
    // Specify roles that should exist
    const role_data = [
        ['Customer', 'This role allows a customer to order products'],
        ['Owner', 'This role grants administrative access. This comes with the ability to \
        approve new customers, change customer information, modify inventory and \
        contact hours, and more.'],
        ['Admin', 'This role grants access to everything. Only for developers']
    ]
    // Add missing roles
    for (const role of role_data) {
        if (!role_titles.includes(role[0])) {
            console.info(`🏗 Creating ${role[0]} role`);
            await prisma[TABLES.Role].create({ data: { title: role[0], description: role[1] } })
        }
    }

    // Determine if admin needs to be added
    const role_admin_id = await prisma[TABLES.Role].findUnique({ where: { title: 'Admin' }, select: { id: true } })?.id;
    const has_admin = (await prisma[TABLES.CustomerRoles].findMany({ where: { roleId: role_admin_id }})).length > 0;
    if (!has_admin) {
        console.info(`👩🏼‍💻 Creating admin account`);
        // Insert admin's business
        const business_id = (await db(TABLES.Business).insert([
            {
                name: 'Admin'
            }
        ]).returning('id'))[0];
        // Insert admin
        const customer_admin_id = (await db(TABLES.Customer).insert([
            {
                firstName: 'admin',
                lastName: 'account',
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, HASHING_ROUNDS),
                emailVerified: true,
                status: AccountStatus.UNLOCKED,
                businessId: business_id
            }
        ]).returning('id'))[0];

        // Insert admin email
        await db(TABLES.Email).insert([
            {
                emailAddress: process.env.ADMIN_EMAIL,
                receivesDeliveryUpdates: false,
                customerId: customer_admin_id
            }
        ])

        // Associate the admin account with an admin role
        await db(TABLES.CustomerRoles).insert([
            {
                customerId: customer_admin_id,
                roleId: role_admin_id
            }
        ])
    }

    // Populate mock data
    if (process.env.CREATE_MOCK_DATA) {
        import { main } from './mock';
    }
    console.info(`✅ Database seeding complete.`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
})