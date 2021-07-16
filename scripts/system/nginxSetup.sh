#!/bin/bash
# Sets up Nginx using .env

HERE=`dirname $0`
source "${HERE}/../../.env"

sudo systemctl enable nginx
sudo systemctl stop nginx

mkdir -p ${PROJECT_DIR}/data/nginx
rm -rf ${PROJECT_DIR}/data/nginx
cp ${HERE}/conf.d/* ${PROJECT_DIR}/data/nginx

find ${SITES} -type f -exec sed -i "s#<SITE_IP>#${SITE_IP}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SITE_NAME>#${SITE_NAME}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SERVER_PORT>#${SERVER_PORT}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<SERVER_ROUTE>#${SERVER_ROUTE}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<UI_PORT>#${UI_PORT}#g" {} \;
find ${SITES} -type f -exec sed -i "s#<UI_ROUTE>#${UI_ROUTE}#g" {} \;

# ${HERE}/../utils/wait-for.sh localhost:${UI_PORT} -t 2000 -- echo 'UI is up. Starting Nginx'
