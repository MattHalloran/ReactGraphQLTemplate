
# New Life Nursery Website
This website is designed both as a functional website for New Life Nursery Inc., and as a reference for creating powerful, maintainable websites.

## Development stack
* React
* Apollo (for GraphQL)
* ExpressJS
* PostgreSQL

## Prerequisites
Before developing a website from this template, you will need to install:   
1. [Node Package Manager (NPM)](https://www.npmjs.com/get-npm)
2. [PostgreSQL](https://www.postgresql.org/download/)
3. The template repository (git clone https://github.com/MattHalloran/NLN)

Once NPM is installed, you must install a few global NPM packages. This allows for CLI support  
1. Yarn - Allows code and package sharing between frontend and backend  
    - npm install -g yarn
2. Nodemon - Listens for changes and automatically restarts server  
    - npm install -g nodemon


## Project setup
### Environment variables
This project uses many environment variables. Some are required for the next steps. A full list of the environment variables used and their explanations can be found [here](https://github.com/MattHalloran/WebServerScripts/blob/main/variables.sh).
### Dependencies
Using Yarn, you can install all project dependencies using:  
* yarn install
### Database
1. Allow PostgreSQL to start automatically. If installed with Homebrew, enter "brew services start postgresql".
2. Set environment variables that the website uses for connecting to the database. These are:  
    - DB_NAME - An arbitrary name for the database (ex: nlndb)
    - DB_USER - An arbitrary name for the user connecting to the database
    - DB_PASSWORD - A secure password for accessing the database. Please store this password somewhere safe
3. Create the user role. From the terminal, enter the following commands:
    1. psql postgres
    2. CREATE ROLE <DB_USER> WITH LOGIN PASSWORD '<DB_PASSWORD>';
        * Note: Replace <DB_USER> and <DB_PASSWORD> with the environment variables you created in the previous step.
        * Note: To view users, enter \du
    3. ALTER ROLE <DB_USER> CREATEDB;
    4. \q
4. Log into postgres with the newly-created user, and create the database.
    1. psql postgres -U <DB_USER>
    2. CREATE DATABASE <DB_NAME>;
        * Note: To view databases, enter \l
        * Note: To connect to database, enter \connect
    3. \q


## Deploying project
Currently, the cheapest way to deploy a web project seems to be through VPS hosting. [Here](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-ubuntu-20-04-server-on-a-digitalocean-droplet) is an example of how to do this on DigitalOcean.

Once you are connected to your VPS, you can use existing bash scripts to set up and deploy all parts of the website. This can be done by:  
1. wget https://github.com/MattHalloran/WebServerScripts/archive/1.0.tar.gz
2. tar xzf 1.0.tar.gz
3. chmod 744 WebServerScripts-1.0/*.sh
4. sudo WebServerScripts-1.0/full-setup.sh
