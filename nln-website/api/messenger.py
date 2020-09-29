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
from twilio.rest import Client
import difflib

PORT_NUM = 465
# Stored in environment variables so it's not uploaded to GitHub. 
EMAIL_USERNAME = os.environ.get("AFA_EMAIL_USERNAME") #What you login as
EMAIL_FROM = os.environ.get("AFA_EMAIL_FROM") #Who the recipient thinks the email is from
EMAIL_PASSWORD = os.environ.get("AFA_EMAIL_PASSWORD")
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")

twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

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

#Returns the email associated with a phone number. Currently only implemented for the US
#Arguments:
#1) number - The phone number. This should preferrably include the country code (ex: '+16098675309')
def numberToEmail(number:str):
    #Already an email
    if '@' in number:
        return number
    carrier_info = twilio_client.lookups.phone_numbers(number).fetch(type=['carrier'])
    if carrier_info.carrier['type'] != 'mobile':
        raise Exception('Cannot send a text message to a landline!')
    #Using the carrier string from twilio, try to match it to the carrier dict. 
    #Since we don't know the exact format twilio is using, we must find the closest match
    carrier = carrier_info.carrier['name'].lower()
    for character in carrier_remove_characters:
        carrier = carrier.replace(character, '')
    closest_carriers = difflib.get_close_matches(carrier, carrier_dict)
    if len(closest_carriers) < 1:
        raise Exception('Could not find the carrier for this number!')
    carrier_extension = carrier_dict[closest_carriers[0]]
    #Return {number without country code}@{carrier email extension}
    return f'{number[-10:]}@{carrier_extension}'

#Arguments:
#recipients - a list of recipients. Can contain phone numbers or emails
#to_text - Who the recipients will think the email is sent to. Useful for bcc. Defaults to the list of recipients, but can actually be any text
#subject - The subject of the message
#message - The actual message, in plaintext. If sending an html file instead (such as a newsletter), it is still a good
#idea to set this field in case some recipients have disabled HTML emails
#html_file - Path to an html file, if sending one
#Notes:
#1) Emojis work for emails, but not phone numbers
#2) Please do not try sending an html file to an email
def main(recipients:list, to_text:str = '', subject:str = '', message:str = '', html_file:str = ''):

    if len(recipients) == 0:
        print('No email addresses passed in')
        return

    #Convert any phone numbers into emails
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
    msg['Bcc'] = recipients #So recipients don't see other email addresses
    msg.set_content(message)
    
    if html_file == '':
        if message == '':
            print('No message or file passed in. One of these is needed to send the email')
            return
    else:
        dir_path = os.path.dirname(os.path.realpath(__file__))
        #HTML template from https://www.crazyegg.com/blog/how-to-code-an-email-newsletter/
        with open(os.path.join(dir_path, html_file), 'rb') as f:
            email_html = f.read().decode('utf8')
            msg.add_alternative(email_html, subtype = 'html')

    with smtplib.SMTP_SSL('smtp.gmail.com', PORT_NUM) as smtp:
        try:
            smtp.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            to_string = ', '.join(recipients)
            print(f'Sending email to {to_string}')
            smtp.send_message(msg)
        except Exception as e:
            print('caught exception')
            print(repr(e))

if __name__ == '__main__':
    num_args_required = 2
    if len(sys.argv) > num_args_required:
        main(sys.argv[1], sys.argv[2])
