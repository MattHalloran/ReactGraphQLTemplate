#!/bin/bash
# Gives website an auto-renewing SSL certificate, using Certbot
# Prereqs:
#   -Nginx must be set up

HERE=`dirname $0`
source "$HERE/prettify.sh"
source "${HERE}/../.env"

MSG="Installing Certbot"
sudo apt-add-repository -r ppa:certbot/certbot
MSG="Installing Nginx package for Certbot"
sudo apt-get update
sudo apt-get install python3-certbot-nginx
MSG="Creating SSL certificate"
sudo certbot --nginx -d $WEBSITE_NAME -d "www.$WEBSITE_NAME"
MSG="Testing certificate auto-renewal"
sudo certbot renew --dry-run