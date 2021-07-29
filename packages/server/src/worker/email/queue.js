import Bull from 'bull';
import { emailProcess } from './process';
import fs from 'fs';
import { BUSINESS_JSON } from '../../consts';
const { BUSINESS_NAME, SITE_URL } = JSON.parse(fs.readFileSync(BUSINESS_JSON, 'utf8'));

const emailQueue = new Bull('email', { redis: process.env.REDIS_CONN });
emailQueue.process(emailProcess);

export function sendMail(to=[], subject='', text='', html='') {
    console.log('in send mail.....')
    emailQueue.add({
        to: to,
        subject: subject,
        text: text,
        html: html
    });
}

export function customerNotifyAdmin(name) {
    emailQueue.add({
        to: [process.env.SITE_EMAIL_USERNAME],
        subject: `Account created for ${name}`,
        text: `${name} has created an account with ${BUSINESS_NAME.Long}. Website accounts can be viewed at ${SITE_URL}/admin/customers`,
        html: `<p>${name} has created an account with ${BUSINESS_NAME.Long}. Website accounts can be viewed at <a href=\"${SITE_URL}/admin/customers\">${SITE_URL}/admin/customers</a></p>`
    });
}

export function orderNotifyAdmin() {
    emailQueue.add({
        to: [process.env.SITE_EMAIL_USERNAME],
        subject: "New Order Received!",
        text: `A new order has been submitted. It can be viewed at ${SITE_URL}/admin/orders`,
        html: `<p>A new order has been submitted. It can be viewed at <a href=\"${SITE_URL}/admin/orders\">${SITE_URL}/admin/orders</a></p>`
    });
}

export function sendResetPasswordLink(email, code) {
    emailQueue.add({
        to: [email],
        subject: `${BUSINESS_NAME.Short} Password Reset`,
        text: `A password reset was requested for your account with ${BUSINESS_NAME.Long}. If you sent this request, please click this link (${SITE_URL}/forgot-password/${code}) to continue. If you did not send this request, please ignore this email.`,
        html: `<p>A password reset was requested for your account with ${BUSINESS_NAME.Long}.</p><p>If you sent this request, please click this link (<a href=\"${SITE_URL}/forgot-password/${code}\">${SITE_URL}/verify/${code}</a>) to continue.<p>If you did not send this request, please ignore this email.<p>`
    });
}

export function sendVerificationLink(email, customer_id) {
    emailQueue.add({
        to: [email],
        subject: `Verify ${BUSINESS_NAME.Short} Account`,
        text: `Welcome to ${BUSINESS_NAME.Long}! Please click this link (${SITE_URL}/login/${customer_id}) to verify your account. If you did not create an account with us, please ignore this link.`,
        html: `<p>Welcome to ${BUSINESS_NAME.Long}!</p><p>Please click this link (<a href=\"${SITE_URL}/login/${customer_id}\">${SITE_URL}/login/${customer_id}</a>) to verify your account.</p><p>If you did not create an account with us, please ignore this message.</p>`
    });
}