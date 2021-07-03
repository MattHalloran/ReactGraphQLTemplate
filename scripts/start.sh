#!/bin/sh

if [ "${NODE_ENV}" == "development" ] ; then
    #(cd packages/server && npm run start-dev) & (cd packages/ui && npm run start-dev)
    # For some reason, running knex npm commands doesn't work from here. So we'll have to call them manually for now...
    (cd packages/server && knex migrate:latest --env development --knexfile ./src/db/knexfile.js --esm)
    (cd packages/server && knex seed:run --knexfile ./src/db/knexfile.js --specific init.js --esm)
    (cd packages/server && npm run start-dev) & (cd packages/ui && npm run start-dev)
else
    (cd packages/server && npm run start-prod) & (cd packages/ui && npm run start-prod)
fi