FROM jonasal/nginx-certbot:latest
EXPOSE 80 443

# Set variables
ARG PROJECT_DIR
ARG CONF_DIR=/etc/nginx/conf.d

# Create directories
RUN mkdir -p ${CONF_DIR} /etc/letsencrypt /var/www.certbot

# Set working directory
WORKDIR ${PROJECT_DIR}

# Copy files in data/nginx
COPY ./data/nginx ${CONF_DIR}

COPY ./scripts/nginx.sh ./scripts/nginx.sh
RUN chmod +x ./scripts/nginx.sh
CMD ./scripts/nginx.sh