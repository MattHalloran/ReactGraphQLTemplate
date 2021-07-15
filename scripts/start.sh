#!/bin/sh

# Before monorepo can start, it must first wait for the database to finish initializing
${PROJECT_DIR}/scripts/wait-for.sh db:5432 -t 1000 -- echo 'Database is up. Starting monorepo'

#(cd packages/server && npm run start-dev) & (cd packages/ui && npm run start-dev)
# For some reason, knex will not run if using npm run commands. So we must call them manually :(
cd ${PROJECT_DIR}/packages/server
knex migrate:latest --env development --knexfile ./src/db/knexfile.js --esm
knex seed:run --knexfile ./src/db/knexfile.js --specific init.js --esm
# knex migrate:latest --env development --knexfile ./src/db/knexfile.js --esm
npm run clean

if [ "${NODE_ENV}" == "development" ] ; then
    (cd ${PROJECT_DIR}/packages/server && npm run start-dev) & (cd ${PROJECT_DIR}/packages/ui && npm run start-dev)
else
    (cd ${PROJECT_DIR}/packages/server && npm run start-prod) & (cd ${PROJECT_DIR}/packages/ui && npm run start-prod)
fi