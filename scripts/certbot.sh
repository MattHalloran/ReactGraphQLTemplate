#!/bin/bash
# Gives website an auto-renewing SSL certificate, using Certbot
# Prereqs:
#   -Nginx must be set up

HERE=`dirname $0`
source "$HERE/formatting.sh"
source "${HERE}/../.env"

MSG="Installing Certbot"
checker sudo apt-add-repository -r ppa:certbot/certbot
MSG="Installing Nginx package for Certbot"
sudo apt-get update
checker sudo apt-get install python3-certbot-nginx
MSG="Creating SSL certificate"
checker sudo certbot --nginx -d $WEBSITE_NAME -d "www.$WEBSITE_NAME"
MSG="Testing certificate auto-renewal"
checker sudo certbot renew --dry-run