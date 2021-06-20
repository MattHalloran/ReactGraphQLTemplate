FROM postgres:13
EXPOSE 5432

USER postgres
WORKDIR /srv/app/db

# Copy package into working directory
COPY --chown=postgres:postgres ./ ./

RUN pg_createcluster 13 main
# Create a PostgreSQL role and
# then create a database owned by the newly-created role.
# Note: here we use ``&&\`` to run commands one after the other - the ``\``
#       allows the RUN command to span multiple lines.
# RUN /etc/init.d/postgresql start &&\
#     psql --command "CREATE USER ${DB_USER} WITH SUPERUSER PASSWORD '${DB_PASSWORD}';" &&\
#     createdb -O ${DB_USER} ${DB_NAME}

# # Initialize database
RUN chmod +x ./init.sh
CMD ./init.sh