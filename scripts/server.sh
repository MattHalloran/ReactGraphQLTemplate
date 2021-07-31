#!/bin/sh

# Before backend can start, it must first wait for the database and redis to finish initializing
${PROJECT_DIR}/scripts/wait-for.sh ${DB_CONN} -t 1000 -- echo 'Database is up'
${PROJECT_DIR}/scripts/wait-for.sh ${REDIS_CONN} -t 1000 -- echo 'Redis is up'
echo 'Starting backend...'

#(cd packages/server && npm run start-dev) & (cd packages/ui && npm run start-dev)
# For some reason, knex will not run if using npm run commands. So we must call them manually :(
cd ${PROJECT_DIR}/packages/server
knex migrate:latest --env development --knexfile ./src/db/knexfile.js --esm
knex seed:run --knexfile ./src/db/knexfile.js --specific init.js --esm
# knex migrate:latest --env development --knexfile ./src/db/knexfile.js --esm

# Clean any unused files
npm run clean

cd ${PROJECT_DIR}/packages/server
npm run start-${NODE_ENV}