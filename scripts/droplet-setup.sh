#!/bin/bash
# Sets up general droplet settings

HERE=`dirname $0`
source "$HERE/formatting.sh"

group "Unix Setup"
MSG="Cleaning up apt library"
checker sudo rm -rvf /var/lib/apt/lists/*
MSG="Upgrading cache limit"
# Note: If using sed command on MacOS, -i might need an option to specify the backup file's extension (this can be '')
checker sed -i 's/^.*APT::Cache-Limit.*$/APT::Cache-Limit \"100000000\";/' /etc/apt/apt.conf.d/70debconf
MSG="Checking for package updates"
checker sudo apt-get update
MSG="Running upgrade"
checker sudo apt-get -y upgrade
MSG="Setting up Nginx"
NGINX_LOGS="/usr/share/nginx/logs"
mkdir -p "${NGINX_LOGS}" && touch "${NGINX_LOGS}/error.log" "${NGINX_LOGS}/nginx.pid"
checker sudo apt install nginx
MSG="Setting up firewall"
# Enable firewall
checker sudo ufw enable
# Add nginx to firewall whitelist
checker sudo ufw allow 'Nginx Full'
info "Updating max listeners, since npm uses a lot. Not sure exactly what they do, but the default max amount is not enough"
echo fs.inotify.max_user_watches=20000 | sudo tee -a /etc/sysctl.conf
echo vm.overcommit_memory=1 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p