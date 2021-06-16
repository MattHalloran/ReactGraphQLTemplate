FROM node:14.17
WORKDIR /app
COPY . /app
RUN yarn install
CMD ["npm", "run", "start"]