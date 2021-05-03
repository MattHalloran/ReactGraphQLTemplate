// Sends emails and text messages
import nodemailer from 'nodemailer';

// ---------- EMAIL SETUP -------------
const HOST = 'smtp.gmail.com';
const PORT = 465;
// What you login as
const EMAIL_USERNAME = process.env.AFA_EMAIL_USERNAME;
// Who the recipient sees the email is from
const EMAIL_FROM = process.env.AFA_EMAIL_FROM;
// Email API password (see MessengerSetup.txt for more info)
const EMAIL_PASSWORD = process.env.AFA_EMAIL_PASSWORD;
const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
    }
})

// ---------- TEXTING SETUP --------------
const PHONE_NUMBER = process.env.PHONE_NUMBER;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
let texting_client = null;
try {
    texting_client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
} catch(err) {
    console.warn('TWILIO client could not be initialized. Sending SMS will not work')
    console.error(err);
}

// Sends an email. Returns a success boolean, and the transporter response
export function sendEmail(to=[], subject='', text='', html='') {
    transporter.sendMail({
        from : `"${EMAIL_FROM}" <${EMAIL_USERNAME}>`,
        to: to.join(', '),
        subject: subject,
        text: text,
        html: html
    }).then(info => {
        return {
            'success': info.rejected.length === 0,
            'info': info
        }
    }).catch(err => {
        console.error(err);
        return {
            'success': false
        }
    });
}

export function sendSms(to=[], body) {
    if(texting_client === null) {
        console.error('Cannot send SMS. Texting client not initialized');
        return false;
    }
    to.forEach(t => {
        texting_client.messages.create({
            to: t,
            from: PHONE_NUMBER,
            body: body
        }).then(message => console.log(message))
    })
    return true;
}

export function customerNotifyAdmin(name) {
    let html = `<p>${name} has created an account with New Life Nursery. Website accounts can be viewed at <a href=\"https://newlifenurseryinc.com/admin/customers\">https://newlifenurseryinc.com/admin/customers</a></p>`;
    let text = `${name} has created an account with New Life Nursery. Website accounts can be viewed at https://newlifenurseryinc.com/admin/customers`;
    let sub = `Account created for ${name}`
    return sendEmail([EMAIL_USERNAME], sub, text, html);
}

export function orderNotifyAdmin() {
    let html = "<p>A new order has been submitted. It can be viewed at <a href=\"https://newlifenurseryinc.com/admin/orders\">https://newlifenurseryinc.com/admin/orders</a></p>"
    let text = "A new order has been submitted. It can be viewed at https://newlifenurseryinc.com/admin/orders"
    let sub = "New Order Received!"
    return send_html_email([EMAIL_USERNAME], sub, text, html);
}

export function sendResetPasswordLink(email, user_tag) {
    let html = `<p>A password reset was requested for your New Life Nursery account.</p><p>If you sent this request, please click this link (<a href=\"https://newlifenurseryinc.com/forgot-password/${user_tag}\">https://newlifenurseryinc.com/verify/${user_tag}</a>) to continue.<p>If you did not send this request, please ignore this email.<p>`;
    let text = `A password reset was requested for your New Life Nursery account. If you sent this request, please click this link (https://newlifenurseryinc.com/forgot-password/${user_tag}) to continue. If you did not send this request, please ignore this email.`;
    let sub = "New Life Nursery Password Reset"
    return send_html_email([email], sub, text, html);
}

export function sendVerificationLink(email, user_tag) {
    let html = `<p>Welcome to New Life Nursery!</p><p>Please click this link (<a href=\"https://newlifenurseryinc.com/login/${user_tag}\">https://newlifenurseryinc.com/login/${user_tag}</a>) to verify your account.</p><p>If you did not create an account with us, please ignore this message.</p>`;
    let text = `Welcome to New Life Nursery! Please click this link (https://newlifenurseryinc.com/login/${user_tag}) to verify your account. If you did not create an account with us, please ignore this link.`;
    let sub = "Verify New Life Nursery Account"
    return send_html_email([email], sub, text, html);
}