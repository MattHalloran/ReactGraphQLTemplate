# --------------------------------------------
# Generates and sends emails
# Initially created with the help of https://www.youtube.com/watch?v=JRCJ6RtE3xU
# Arguments
#   email_addresses - who should receive this email
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

PORT_NUM = 465
# Stored in environment variables so it's not uploaded to GitHub. 
print(os.environ)
EMAIL_USERNAME = os.environ.get("AFA_EMAIL_USERNAME") #What you login as
EMAIL_FROM = os.environ.get("AFA_EMAIL_FROM") #Who the recipient thinks the email is from
EMAIL_PASSWORD = os.environ.get("AFA_EMAIL_PASSWORD")

#Arguments:
#email_addresses - a list of recipients
#to_text - Who the recipients will think the email is sent to. Useful for bcc. Defaults to the list of recipients, but can actually be any text
#subject - The subject of the message
#message - The actual message, in plaintext. If sending an html file instead (such as a newsletter), it is still a good
#idea to set this field in case some recipients have disabled HTML emails
#html_file - Path to an html file, if sending one
def main(email_addresses:list, to_text:str = '', subject:str = '', message:str = '', html_file:str = ''):

    if len(email_addresses) == 0:
        print('No email addresses passed in')
        return

    if to_text == '':
        if len(email_addresses) > 1:
            to_text = ', '.join(email_addresses)
        else:
            to_text = email_addresses[0]

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = EMAIL_FROM
    msg['To'] = to_text
    msg['Bcc'] = email_addresses #So recipients don't see other email addresses
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
            to_string = ', '.join(email_addresses)
            print(f'Sending email to {to_string}')
            smtp.send_message(msg)
        except Exception as e:
            print('caught exception')
            print(repr(e))

if __name__ == '__main__':
    num_args_required = 2
    if len(sys.argv) > num_args_required:
        main(sys.argv[1], sys.argv[2])
    else:
        main(['matthalloran8@gmail.com'], 'recipients', 'this is a subject', 'this is a message')
