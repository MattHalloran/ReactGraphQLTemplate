#!/bin/bash
# Sets up Nginx using .env

HERE=`dirname $0`
source "${HERE}/../.env"
CONF="${HERE}/../data/nginx"
SITES="/etc/nginx/sites-available"

cp ${CONF}/* ${SITES}/

find ${SITES} -type f -exec sed -i "s#<SITE_IP>#${SITE_IP}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SITE_NAME>#${SITE_NAME}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SERVER_PORT>#${SERVER_PORT}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SERVER_ROUTE>#${SERVER_ROUTE}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<UI_PORT>#${UI_PORT}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<UI_ROUTE>#${UI_ROUTE}#g" {} \;

cat ${SITES}/default

${HERE}/wait-for.sh localhost:5432 -t 2000 -- echo 'UI is up. Starting Nginx'

sudo systemctl enable nginx
sudo systemctl restart nginx

echo "Installing Certbot"
sudo apt-add-repository -r ppa:certbot/certbot
echo "Installing Nginx package for Certbot"
sudo apt-get update
sudo apt-get install python3-certbot-nginx
echo "Creating SSL certificate"
sudo certbot --nginx -d ${SITE_NAME} -d "www.${SITE_NAME}"
echo "Testing certificate auto-renewal"
sudo certbot renew --dry-run