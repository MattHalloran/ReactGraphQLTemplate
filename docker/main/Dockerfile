FROM node:14.17-alpine
EXPOSE 3000 5000

# Set variables
ARG PROJECT_DIR
ARG ui=packages/ui
ARG server=packages/server
ARG shared=packages/shared
ARG node=/node_modules

# Create directories with correct permissions
RUN mkdir ${PROJECT_DIR} ${node} &&\ 
    chown -R node:node ${PROJECT_DIR} &&\ 
    chown -R node:node ${node}
# Let the script know where node_modules is located (see .yarnrc)
RUN PATH=$PATH:${node}/.bin

# Create .yarnrc
RUN echo "--modules-folder ${node}" > ${PROJECT_DIR}/.yarnrc

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
COPY --chown=node:node ${shared}/index.js ${shared}/index.js
COPY --chown=node:node ${shared}/src ${shared}/src
COPY --chown=node:node ${ui}/src ${ui}/src
COPY --chown=node:node ${ui}/public ${ui}/public
COPY --chown=node:node ${ui}/tsconfig.json ${ui}/tsconfig.json
COPY --chown=node:node ${server}/src ${server}/src
COPY --chown=node:node ${server}/tools ${server}/tools
COPY --chown=node:node ./scripts/start.sh ./scripts/start.sh

# # Start server and ui
RUN chmod +x ./scripts/*
CMD ./scripts/start.sh