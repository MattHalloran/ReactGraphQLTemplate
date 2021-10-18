import { PrismaSelect } from "@paljs/plugins";
import { onlyPrimitives } from "../../utils/objectTools";
import { CustomError } from "../../error";
import { CODE } from '@local/shared';
import pkg from '@prisma/client';
const { OrderStatus } = pkg;

// Validates email address, and returns customer data
export async function customerFromEmail(email: string, prisma: any) {
    if (!email) throw new CustomError(CODE.BadCredentials);
    // Validate email address
    const emailRow = await prisma.email.findUnique({ where: { emailAddress: email } });
    if (!emailRow) throw new CustomError(CODE.BadCredentials);
    // Find customer
    let customer = await prisma.customer.findUnique({ where: { id: emailRow.customerId } });
    if (!customer) throw new CustomError(CODE.ErrorUnknown);
    return customer;
}

// 'cart' is not a field or relationship in the database,
// so it must be removed from the select
export function getCustomerSelect(info: any) {
    let prismaInfo = new PrismaSelect(info).value;
    delete prismaInfo.select.cart;
    return prismaInfo;
}

// 'cart' is not a field or relationship in the database,
// so it must be manually queried
export async function getCart(prisma: any, info: any, customerId: any) {
    const selectInfo = new PrismaSelect(info).value.select.cart;
    let results;
    if (selectInfo) {
        results = await prisma.order.findMany({ 
            where: { customerId: customerId, status: OrderStatus.DRAFT },
            ...selectInfo
        });
    }
    return results?.length > 0 ? results[0] : null;
}

// Upsert a customer, with business, emails, phones, and roles
export async function upsertCustomer({ prisma, info, data }: any) {
    // Remove relationship data, as they are handled on a 
    // case-by-case basis
    let cleanedData: any = onlyPrimitives(data);
    // If user already exists, try to find their business
    let business;
    if (data.id) {
        const businessResults = await prisma.business.findMany({
            where: { employees: { some: { id: data.id } } },
        });
        if (businessResults.length > 0) business = businessResults[0];
    }
    // Upsert business
    if (data.business) {
        if (data.business.id) {
            business = await prisma.business.update({ where: { id: data.business.id }, data: data.business });
        } else {
            business = await prisma.business.create({ data: data.business });
        }
        cleanedData.business = { connect: { id: business.id } }
    }
    // Upsert customer
    let customer;
    if (!data.id) {
        customer = await prisma.customer.create({ data: cleanedData })
    } else {
        customer = await prisma.customer.update({ 
            where: { id: data.id },
            data: cleanedData
        })
    }
    // Upsert emails
    for (const email of (data.emails ?? [])) {
        const emailExists = await prisma.email.findUnique({ where: { emailAddress: email.emailAddress } });
        if (emailExists && emailExists.id !== email.id) throw new CustomError(CODE.EmailInUse);
        if (!email.id) {
            await prisma.email.create({ data: { ...email, id: undefined, customerId: customer.id } })
        } else {
            await prisma.email.update({
                where: { id: email.id },
                data: email
            })
        }
    }
    // Upsert phones
    for (const phone of (data.phones ?? [])) {
        const phoneExists = await prisma.phone.findUnique({ where: { number: phone.number }});
        if (phoneExists && phoneExists.id !== phone.id) throw new CustomError(CODE.PhoneInUse)
        if (!phone.id) {
            await prisma.phone.create({ data: { ...phone, id: undefined, customerId: customer.id } })
        } else {
            await prisma.phone.update({
                where: { id: phone.id },
                data: phone
            })
        }
    }
    // Upsert roles
    for (const role of (data.roles ?? [])) {
        if (!role.id) continue;
        const roleData = { customerId: customer.id, roleId: role.id };
        await prisma.customer_roles.upsert({
            where: { customer_roles_customerid_roleid_unique: roleData },
            create: roleData,
            update: roleData
        })
    }
    const prismaInfo = getCustomerSelect(info);
    const cart = await getCart(prisma, info, customer.id);
    const customerData = await prisma.customer.findUnique({ where: { id: customer.id }, ...prismaInfo });
    if (cart) customerData.cart = cart;
    return customerData;
}