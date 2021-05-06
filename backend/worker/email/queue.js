import Bull from 'bull';
import emailProcess from './process';

const emailQueue = new Bull('email');
emailQueue.process(emailProcess);

export function sendMail(to=[], subject='', text='', html='') {
    emailQueue.add({
        to: to,
        subject: subject,
        text: text,
        html: html
    });
}

export function customerNotifyAdmin(name) {
    emailQueue.add({
        to: [process.env.AFA_EMAIL_USERNAME],
        subject: `Account created for ${name}`,
        text: `${name} has created an account with New Life Nursery. Website accounts can be viewed at https://newlifenurseryinc.com/admin/customers`,
        html: `<p>${name} has created an account with New Life Nursery. Website accounts can be viewed at <a href=\"https://newlifenurseryinc.com/admin/customers\">https://newlifenurseryinc.com/admin/customers</a></p>`
    });
}

export function orderNotifyAdmin() {
    emailQueue.add({
        to: [process.env.AFA_EMAIL_USERNAME],
        subject: "New Order Received!",
        text: "A new order has been submitted. It can be viewed at https://newlifenurseryinc.com/admin/orders",
        html: "<p>A new order has been submitted. It can be viewed at <a href=\"https://newlifenurseryinc.com/admin/orders\">https://newlifenurseryinc.com/admin/orders</a></p>"
    });
}

export function sendResetPasswordLink(email, user_id) {
    emailQueue.add({
        to: [email],
        subject: "New Life Nursery Password Reset",
        text: `A password reset was requested for your New Life Nursery account. If you sent this request, please click this link (https://newlifenurseryinc.com/forgot-password/${user_id}) to continue. If you did not send this request, please ignore this email.`,
        html: `<p>A password reset was requested for your New Life Nursery account.</p><p>If you sent this request, please click this link (<a href=\"https://newlifenurseryinc.com/forgot-password/${user_id}\">https://newlifenurseryinc.com/verify/${user_id}</a>) to continue.<p>If you did not send this request, please ignore this email.<p>`
    });
}

export function sendVerificationLink(email, user_id) {
    emailQueue.add({
        to: [email],
        subject: "Verify New Life Nursery Account",
        text: `Welcome to New Life Nursery! Please click this link (https://newlifenurseryinc.com/login/${user_id}) to verify your account. If you did not create an account with us, please ignore this link.`,
        html: `<p>Welcome to New Life Nursery!</p><p>Please click this link (<a href=\"https://newlifenurseryinc.com/login/${user_id}\">https://newlifenurseryinc.com/login/${user_id}</a>) to verify your account.</p><p>If you did not create an account with us, please ignore this message.</p>`
    });
}