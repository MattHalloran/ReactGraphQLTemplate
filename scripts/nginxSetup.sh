#!/bin/bash
# Sets up Nginx using .env

HERE=`dirname $0`
source "${HERE}/../.env"
DATA_NGINX="/etc/nginx/nginx.conf"

mkdir -p ${DATA_NGINX}
rm -rf ${DATA_NGINX}/*
cp ${HERE}/conf.d/* ${DATA_NGINX}

find ${DATA_NGINX} -type f -exec sed -i "s#<SITE_IP>#${SITE_IP}#g" {} \;
find ${DATA_NGINX} -type f -exec sed -i "s#<SITE_NAME>#${SITE_NAME}#g" {} \;
find ${DATA_NGINX} -type f -exec sed -i "s#<SERVER_PORT>#${SERVER_PORT}#g" {} \;
find ${DATA_NGINX} -type f -exec sed -i "s#<SERVER_ROUTE>#${SERVER_ROUTE}#g" {} \;
find ${DATA_NGINX} -type f -exec sed -i "s#<UI_PORT>#${UI_PORT}#g" {} \;
find ${DATA_NGINX} -type f -exec sed -i "s#<UI_ROUTE>#${UI_ROUTE}#g" {} \;
