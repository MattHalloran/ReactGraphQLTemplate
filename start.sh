#!/bin/sh

if [ "${NODE_ENV}" == "dev" ] ; then
    (cd packages/server && npm run start-dev) & (cd packages/ui && npm run start-dev)
else
    (cd packages/server && npm run start-prod) & (cd packages/ui && npm run start-prod)
fi