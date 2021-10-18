import bcrypt from 'bcrypt';
import pkg from '@prisma/client';
import { PrismaType } from '../../types';
const { AccountStatus } = pkg;
const HASHING_ROUNDS = 8;

// Create a user, with business, emails, phones, and roles
async function createUser({ prisma, userData, businessData, emailsData, phonesData, roleIds }: any) {
    let business = await prisma.business.findFirst({ where: { name: businessData.name }});
    if (!business) {
        console.info(`🏢 Creating business for ${userData.firstName}`);
        business = await prisma.business.create({ data: businessData });
    }
    let customer = await prisma.customer.findFirst({ where: { firstName: userData.firstName, lastName: userData.lastName }});
    if (!customer) {
        console.info(`👩🏼‍💻 Creating account for ${userData.firstName}`);
        // Insert account
        const customer = await prisma.customer.create({ data: { ...userData, businessId: business.id } });
        // Insert emails
        for (const email of emailsData) {
            await prisma.email.create({ data: { ...email, customerId: customer.id }})
        }
        // Insert phones
        for (const phone of phonesData) {
            await prisma.phone.create({ data: { ...phone, customerId: customer.id }})
        }
        // Insert roles
        for (const roleId of roleIds) {
            await prisma.customer_roles.create({ data: { roleId, customerId: customer.id }})
        }
    }
}

export async function mock(prisma: PrismaType) {
    console.info('🎭 Creating mock data...');

    // Find existing roles
    const roles = await prisma.role.findMany({ select: { id: true, title: true } });
    const customerRoleId = roles.filter(r => r.title === 'Customer')[0].id;
    const ownerRoleId = roles.filter(r => r.title === 'Owner')[0].id;
    // const adminRoleId = roles.filter(r => r.title === 'Admin')[0].id;

    // Create user with owner role
    await createUser({
        prisma,
        businessData: { name: 'SpaceX' },
        userData: {
            firstName: 'Elon',
            lastName: 'Tusk🦏',
            password: bcrypt.hashSync('Elon', HASHING_ROUNDS),
            emailVerified: true,
            status: AccountStatus.UNLOCKED,
        },
        emailsData: [
            { emailAddress: 'notarealemail@afakesite.com', receivesDeliveryUpdates: false },
            { emailAddress: 'backupemailaddress@afakesite.com', receivesDeliveryUpdates: false }
        ],
        phonesData: [
            { number: '15558675309', receivesDeliveryUpdates: false },
            { number: '5555555555', receivesDeliveryUpdates: false }
        ],
        roleIds: [ownerRoleId]
    });

    // Create a few customers
    await createUser({
        prisma,
        businessData: { name: 'Rocket supplier A' },
        userData: {
            firstName: 'John',
            lastName: 'Cena',
            password: bcrypt.hashSync('John', HASHING_ROUNDS),
            emailVerified: true,
            status: AccountStatus.UNLOCKED,
        },
        emailsData: [
            { emailAddress: 'itsjohncena@afakesite.com', receivesDeliveryUpdates: false }
        ],
        phonesData: [],
        roleIds: [customerRoleId]
    });
    await createUser({
        prisma,
        businessData: { name: '🤘🏻A Steel Company' },
        userData: {
            firstName: 'Spongebob',
            lastName: 'Customerpants',
            password: bcrypt.hashSync('Spongebob', HASHING_ROUNDS),
            emailVerified: true,
            status: AccountStatus.UNLOCKED,
        },
        emailsData: [
            { emailAddress: 'spongebobmeboy@afakesite.com', receivesDeliveryUpdates: false }
        ],
        phonesData: [
            { number: '15553214321', receivesDeliveryUpdates: false },
            { number: '8762342222', receivesDeliveryUpdates: false }
        ],
        roleIds: [customerRoleId]
    });

    console.info(`✅ Database mock complete.`);
}