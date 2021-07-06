import Bull from 'bull';
import { emailProcess } from './process';
import { BUSINESS_NAME, WEBSITE_URL } from '@local/shared';

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
        text: `${name} has created an account with ${BUSINESS_NAME.Long}. Website accounts can be viewed at ${WEBSITE_URL}/admin/customers`,
        html: `<p>${name} has created an account with ${BUSINESS_NAME.Long}. Website accounts can be viewed at <a href=\"${WEBSITE_URL}/admin/customers\">${WEBSITE_URL}/admin/customers</a></p>`
    });
}

export function orderNotifyAdmin() {
    emailQueue.add({
        to: [process.env.SITE_EMAIL_USERNAME],
        subject: "New Order Received!",
        text: `A new order has been submitted. It can be viewed at ${WEBSITE_URL}/admin/orders`,
        html: `<p>A new order has been submitted. It can be viewed at <a href=\"${WEBSITE_URL}/admin/orders\">${WEBSITE_URL}/admin/orders</a></p>`
    });
}

export function sendResetPasswordLink(email, code) {
    emailQueue.add({
        to: [email],
        subject: `${BUSINESS_NAME.Short} Password Reset`,
        text: `A password reset was requested for your account with ${BUSINESS_NAME.Long}. If you sent this request, please click this link (${WEBSITE_URL}/forgot-password/${code}) to continue. If you did not send this request, please ignore this email.`,
        html: `<p>A password reset was requested for your account with ${BUSINESS_NAME.Long}.</p><p>If you sent this request, please click this link (<a href=\"${WEBSITE_URL}/forgot-password/${code}\">${WEBSITE_URL}/verify/${code}</a>) to continue.<p>If you did not send this request, please ignore this email.<p>`
    });
}

export function sendVerificationLink(email, user_id) {
    emailQueue.add({
        to: [email],
        subject: `Verify ${BUSINESS_NAME.Short} Account`,
        text: `Welcome to ${BUSINESS_NAME.Long}! Please click this link (${WEBSITE_URL}/login/${user_id}) to verify your account. If you did not create an account with us, please ignore this link.`,
        html: `<p>Welcome to ${BUSINESS_NAME.Long}!</p><p>Please click this link (<a href=\"${WEBSITE_URL}/login/${user_id}\">${WEBSITE_URL}/login/${user_id}</a>) to verify your account.</p><p>If you did not create an account with us, please ignore this message.</p>`
    });
}