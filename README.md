
# New Life Nursery Website
This website is designed both as a functional website for New Life Nursery Inc., and as a reference for creating powerful, maintainable websites.

## Development stack
* React
* Apollo (for GraphQL)
* ExpressJS
* PostgreSQL
* Nginx

## Prerequisites
Before developing a website from this template, you will need to install:   
1. [Docker](https://www.docker.com/)
2. [VSCode](https://code.visualstudio.com/)
3. The template repository (git clone https://github.com/MattHalloran/NLN)

## Project structure  
The first directories you'll notice in this repository are

## Project setup
### Environment variables
This project uses many environment variables. Some are required for the next steps. A full list of the environment variables used and their explanations can be found in [.env-example](https://github.com/MattHalloran/NLN/blob/master/.env-example).
### Docker  
- Build: docker-compose up
- Turn off: docker-compose down
- Full rebuild, deleting all docker data, including wiping database: docker-compose down && docker system prune --all -f && rm -rf data/postgres/ && docker-compose up


## Deploying project
Currently, the cheapest way to deploy a web project seems to be through VPS hosting. [Here](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-ubuntu-20-04-server-on-a-digitalocean-droplet) is an example of how to do this on DigitalOcean. Instead of a plain Ubuntu server, however, it is easier to install one that already contains Docker.

### Setting up DNS
The site can be accessed by the VPS's IP address, but in most cases you'll want to associate the server with a domain name. There are many places to buy domains, but I use [Google Domains](https://domains.google)

Once you buy a domain, you must set up the correct DNS records. This can be done through the site that you bought the domain from, or the site that you bought the VPS from. [Here](https://www.youtube.com/watch?v=wYDDYahCg60) is a good example. **Note**: DNS changes may take several hours to take effect

### Setting up VPS
The VPS you'll be running this website on must be configured to handle website traffic. This is done through Nginx https://olex.biz/2019/09/hosting-with-docker-nginx-reverse-proxy-letsencrypt/

Once you are connected to your VPS, do the following:
1. git clone <your_projects_url>
2. cd into project
3. Edit .env variables
4. chmod +x ./scripts/system/*
5. If starting for first time, ./scripts/system/cleanSetup.sh
6. docker-compose up &