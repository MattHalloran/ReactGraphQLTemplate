FROM node:14.17-alpine
EXPOSE 3000 5000

# Set variables
ARG PROJECT_DIR
ARG ui=packages/ui
ARG server=packages/server
ARG shared=packages/shared
ARG node=/node_modules

# Create directories with correct permissions
RUN mkdir -p ${node} ${PROJECT_DIR}/assets/images ${PROJECT_DIR}/assets/public ${PROJECT_DIR}/assets/private &&\ 
    chown -R node:node ${PROJECT_DIR} &&\ 
    chown -R node:node ${node}
# Let the script know where node_modules is located (see .yarnrc)
RUN PATH=$PATH:${node}/.bin

# Create .yarnrc
RUN echo -e "--modules-folder ${node}\n--cache-folder ${node}" > ${PROJECT_DIR}/.yarnrc

# Install global packages (must be done as the root user)
RUN yarn global add knex nodemon react-scripts

# Switch to a user with less permissions
USER node

# Set working directory
WORKDIR ${PROJECT_DIR}

# Copy packages over first. This helps with caching
COPY --chown=node:node package.json ./
COPY --chown=node:node ${shared}/package.json ${shared}/package.json
COPY --chown=node:node ${ui}/package.json ${ui}/package.json
COPY --chown=node:node ${server}/package.json ${server}/package.json

# Install packages
RUN yarn install

# Copy rest of repo over
COPY --chown=node:node ${shared}/index.js ${shared}/src ${shared}/
COPY --chown=node:node ${ui}/src ${ui}/public ${ui}/tsconfig.json ${ui}/
COPY --chown=node:node ${server}/src ${server}/tools ${server}/
COPY --chown=node:node ./scripts/start.sh ./scripts/start.sh

# # Start server and ui
RUN chmod +x ./scripts/*
CMD ./scripts/start.sh