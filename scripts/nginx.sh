#!/bin/sh
# Sets up Nginx using .env

HERE=`dirname $0`
CONF="/etc/nginx/conf.d"

find ${CONF} -type f -exec sed -i "s#<SITE_IP>#${SITE_IP}#g" {} \;
find ${CONF} -type f -exec sed -i "s#<SITE_NAME>#${SITE_NAME}#g" {} \;
find ${CONF} -type f -exec sed -i "s#<SERVER_PORT>#${SERVER_PORT}#g" {} \;
find ${CONF} -type f -exec sed -i "s#<SERVER_ROUTE>#${SERVER_ROUTE}#g" {} \;
find ${CONF} -type f -exec sed -i "s#<UI_PORT>#${UI_PORT}#g" {} \;
find ${CONF} -type f -exec sed -i "s#<UI_ROUTE>#${UI_ROUTE}#g" {} \;
