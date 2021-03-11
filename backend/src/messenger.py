# --------------------------------------------
# Generates and sends emails/texts
# Initially created with the help of https://www.youtube.com/watch?v=JRCJ6RtE3xU
# Arguments
#   recipients - who should receive this email
#   to_text - This changes what the 'To' field of the email says.
#             If left blank, the emails will be used
#   message - This sets the text of the message. This is optional, depending on
#             the html used
#   html_file - The name of the html file being sent.
#              If left blank, a plaintext message will be sent
# Author: Matt Halloran
# Version: 20191104
# --------------------------------------------

import os
import sys
import smtplib
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from twilio.rest import Client
import difflib
import traceback
from typing import Union
import ssl

MAIL_SERVICE = 'smtp.gmail.com'
PORT_NUM = 465
ASSET_LOCATION = '../assets/messaging'
# Stored in environment variables so it's not uploaded to GitHub.
EMAIL_USERNAME = os.environ.get("AFA_EMAIL_USERNAME")  # What you login as
EMAIL_FROM = os.environ.get("AFA_EMAIL_FROM")  # Who the recipient thinks the email is from
EMAIL_PASSWORD = os.environ.get("AFA_EMAIL_PASSWORD")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")

try:
    twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
except Exception:
    print(traceback.format_exc())
    print(f'Could not establish twilio client connection for sid {TWILIO_ACCOUNT_SID}')

carrier_remove_characters = ['-', '.', '&']
carrier_dict = {
    "tmobile": "tmomail.net",
    "virgin Mobile": "vmobl.com",
    "att": "txt.att.net",
    "sprint": "messaging.sprintpcs.com",
    "verizon Wireless": "vtext.com",
    "tracfone": "mmst5.tracfone.com",
    "ting": "message.ting.com",
    "boost mobile": "myboostmobile.com",
    "us cellular": "email.uscc.net",
    "metro pcs": "mymetropcs.com"
}


# Parses an html file from a relative path
# Returns html as a string
def htmlToString(path: str) -> str:
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(dir_path, path), 'rb') as f:
        return f.read().decode('utf8')


# Returns the email associated with a phone number. Currently only implemented for the US
# Arguments:
# 1) number - The phone number. This should preferrably include the country code (ex: '+16098675309')
def numberToEmail(number: str) -> str:
    # Already an email
    if '@' in number:
        return number
    if twilio_client is None:
        raise Exception('Twilio client not set up. Cannot convert number to email')
    carrier_info = twilio_client.lookups.phone_numbers(number).fetch(type=['carrier'])
    if carrier_info.carrier['type'] != 'mobile':
        raise Exception('Cannot send a text message to a landline!')
    # Using the carrier string from twilio, try to match it to the carrier dict. 
    # Since we don't know the exact format twilio is using, we must find the closest match
    carrier = carrier_info.carrier['name'].lower()
    for character in carrier_remove_characters:
        carrier = carrier.replace(character, '')
    closest_carriers = difflib.get_close_matches(carrier, carrier_dict)
    if len(closest_carriers) < 1:
        raise Exception('Could not find the carrier for this number!')
    carrier_extension = carrier_dict[closest_carriers[0]]
    # Return {number without country code}@{carrier email extension}
    return f'{number[-10:]}@{carrier_extension}'


# Sends message using smtp
def send_smtp_message(message: Union[MIMEMultipart, EmailMessage]) -> bool:
    try:
        with smtplib.SMTP_SSL(MAIL_SERVICE, PORT_NUM) as smtp:
            smtp.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            smtp.send_message(message)
            return True
    except Exception:
        print(traceback.format_exc())
        return False


# Arguments:
# recipients - a list of recipients. Can contain phone numbers or emails
# to_text - Who the recipients will think the email is sent to. Useful for bcc. Defaults to the list of recipients, but can actually be any text
# subject - The subject of the message
# alt_text - The plaintext message, in case the recipient has html emails disabled
# html - String of html data
# images - a list of MIMEImage (embedded images in the html file)
# Notes:
# 1) Emojis work for emails, but not phone numbers
def send_html_email(recipients: list,
                    to_text: str = '',
                    subject: str = '',
                    alt: str = '',
                    html: str = '',
                    images: list = None) -> bool:

    if len(recipients) == 0:
        print('No email addresses passed in')
        return False

    # Fail if any recipients are phone numbers, as these cannot receive html texts
    for r in recipients:
        if '@' not in r:
            print('A phone number was passed in. These are not supported for html emails')
            return False

    if to_text == '':
        if len(recipients) > 1:
            to_text = ', '.join(recipients)
        else:
            to_text = recipients[0]

    msg = MIMEMultipart('related')
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to_text
    # msg['Bcc'] = recipients #So recipients don't see other email addresses
    msg.preamble = 'This is a multi-part message in MIME format. '

    # Set plaintext and html versions as alternatives, so the email client can determine which to display
    alt_mime = MIMEMultipart('alternative')
    msg.attach(alt_mime)
    if alt:
        alt_mime.attach(MIMEText(alt))
    if html:
        alt_mime.attach(MIMEText(html, 'html'))

    # Add embedded images
    if images:
        for i in images:
            msg.attach(i)

    return send_smtp_message(msg)


# Arguments:
# recipients - a list of recipients. Can contain phone numbers or emails
# to_text - Who the recipients will think the email is sent to. Useful for bcc. Defaults to the list of recipients, but can actually be any text
# subject - The subject of the message
# message - The actual message, in plaintext. If sending an html file instead (such as a newsletter), it is still a good
def send_plaintext_email(recipients: list,
                         to_text: str = '',
                         subject: str = '',
                         message: str = '') -> bool:

    if len(recipients) == 0:
        print('No email addresses passed in')
        return False

    # Convert any phone numbers into emails
    recipients = [numberToEmail(x) for x in recipients]

    if to_text == '':
        if len(recipients) > 1:
            to_text = ', '.join(recipients)
        else:
            to_text = recipients[0]

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to_text
    msg['Bcc'] = recipients  # So recipients don't see other email addresses
    msg.set_content(message)

    return send_smtp_message(msg)


# Sends a welcome email. Used for newly-registered users
def welcome(recipient: str) -> bool:
    try:
        # # Load all embedded images into MIMEImage
        # fp = open(f'{ASSET_LOCATION}/img/Welcome-to-new-life.png', 'rb')
        # welcome_image_mime = MIMEImage(fp.read())
        # welcome_image_mime.add_header('Content-ID', '<welcomeImage>')
        # fp.close()
        # Define alt text in case recipient has html emails disabled
        html = "<h1>Welcome to New Life Nursery!</h1><p>You're now registered for online ordering.</p><h3>What happens next?</h3><p>You can view our availability at <a href=\"https://newlifenurseryinc.com/shopping\">https://newlifenurseryinc.com/shopping</a>.</p><p>After ordering, we will contact you for payment information.</p>"
        alt = "Welcome to New Life Nursery! You're now registered for online ordering. You can view our availability at https://newlifenurseryinc.com/shopping. After ordering, we will contact you for payment information."
        sub = 'Welcome to New Life Nursery!'
        #return send_html_email([recipient], subject=sub, alt=alt, html=html)
        return send_plaintext_email([recipient], 'boop', 'asdf', 'beeeeeeeeeeee')
    except Exception:
        print(traceback.format_exc())
        return False


# Sends a password reset request to the specified email
def reset_password(recipient: str):
    # Define alt text in case recipient has html emails disabled
    alt = "Too bad"
    sub = 'New Life Nursery Password Reset'
    html = htmlToString('emailTemplates/reset-password.html')
    send_html_email([recipient], subject=sub, alt=alt, html=html)


if __name__ == '__main__':
    num_args_required = 2
    if len(sys.argv) > num_args_required:
        send_plaintext_email(sys.argv[1], sys.argv[2])
