FROM node:14

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Copy app source
COPY . /app

CMD ["npm", "start"]