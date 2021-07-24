#!/bin/bash
# Fully sets up server
HERE=`dirname $0`
source "${HERE}/../.env"
source "${HERE}/prettify.sh"

# ========================================================
# General Ubuntu setup
# ========================================================
header "Cleaning up apt library"
sudo rm -rvf /var/lib/apt/lists/*

header "Upgrading cache limit"
sed -i 's/^.*APT::Cache-Limit.*$/APT::Cache-Limit \"100000000\";/' /etc/apt/apt.conf.d/70debconf

header "Checking for package updates"
sudo apt-get update
header "Running upgrade"
sudo apt-get -y upgrade

info "Updating max listeners, since npm uses a lot. Not sure exactly what they do, but the default max amount is not enough"
echo fs.inotify.max_user_watches=20000 | sudo tee -a /etc/sysctl.conf
echo vm.overcommit_memory=1 | sudo tee -a /etc/sysctl.conf

# ========================================================
# Installing required packages
# ========================================================

# --------------------------------------------------------
# Docker
# --------------------------------------------------------
header "Cleaning up old versions of Docker"
sudo apt-get remove docker docker-engine docker.io containerd runc

header "Installing Docker prerequisites"
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

header "Installing Docker from official GPG key"
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

header "Specify stable version of Docker"
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

header "Installing Docker Engine"
sudo apt-get install docker-ce docker-ce-cli containerd.io

header "Verify that Docker Engine is running successfully. Container will automatically close"
sudo docker run hello-world

header "Creating docker user group, so docker can be run without sudo"
sudo groupadd docker
sudo usermod -aG docker $USER

header "Configuring Docker to run on boot"
sudo systemctl enable docker.service
sudo systemctl enable containerd.service

header "Installing Docker Compose"
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

header "Making Docker Compose executable"
sudo chmod +x /usr/local/bin/docker-compose


# --------------------------------------------------------
# Nginx
# --------------------------------------------------------
header "Purging any existing Nginx configurations"
sudo apt-get purge nginx nginx-common

header "Installing Nginx"
sudo apt install nginx

header "Starting Nginx"
sudo systemctl enable nginx

# Update NGINX files
${HERE}/nginxSetup.sh

header "Restarting Nginx"
sudo service nginx restart

# Create SSL encryption
${HERE}/certbot.sh


# ========================================================
# Setting up firewall
# ========================================================
header "Setting up firewall"
# Enable firewall
sudo ufw enable
# Only allow 80 and 443
sudo ufw allow 'Nginx Full'
sudo sysctl -p