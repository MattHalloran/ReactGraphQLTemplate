
# New Life Nursery Website
This website is designed both as a functional website for New Life Nursery Inc., and as a reference for creating powerful, maintainable websites.

## Development stack
* React
* Apollo (for GraphQL)
* ExpressJS
* PostgreSQL

## Prerequisites
Before developing a website from this template, you will need to install:   
1. [Docker](https://www.docker.com/)
2. [VSCode](https://code.visualstudio.com/)
3. The template repository (git clone https://github.com/MattHalloran/NLN)

## Project setup
### Environment variables
This project uses many environment variables. Some are required for the next steps. A full list of the environment variables used and their explanations can be found in [.env-example](https://github.com/MattHalloran/NLN/blob/master/.env-example).
### Docker  
- Build: docker-compose up
- Turn off: docker-compose down
- Full rebuild, deleting all docker data, including wiping database: docker-compose down && docker system prune --all -f && rm -rf data/postgres/ && docker-compose up


## Deploying project
Currently, the cheapest way to deploy a web project seems to be through VPS hosting. [Here](https://www.digitalocean.com/community/tutorials/how-to-set-up-an-ubuntu-20-04-server-on-a-digitalocean-droplet) is an example of how to do this on DigitalOcean. Instead of a plain Ubuntu server, however, it is easier to install one that already contains Docker.

Once you are connected to your VPS, do the following:
1. git clone <your_projects_url>
2. Edit .env variables
3. nohup docker-compose up &
