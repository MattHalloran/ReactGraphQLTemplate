#!/bin/sh

# Start PostgreSQL
/etc/init.d/postgresql start
# Create a PostgreSQL role
echo "Creating database role ${DB_USER}"
psql --command "CREATE USER ${DB_USER} WITH SUPERUSER PASSWORD '${DB_PASSWORD}';"
# Create a database owned by the newly-created role
echo "Creating database table ${DB_NAME}"
createdb -O ${DB_USER} ${DB_NAME}