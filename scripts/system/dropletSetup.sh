#!/bin/bash
# Sets up general droplet settings
HERE=`dirname $0`
source "$HERE/../utils/formatting.sh"

header "Cleaning up apt library"
sudo rm -rvf /var/lib/apt/lists/*

header "Upgrading cache limit"
# Note: If using sed command on MacOS, -i might need an option to specify the backup file's extension (this can be '')
sed -i 's/^.*APT::Cache-Limit.*$/APT::Cache-Limit \"100000000\";/' /etc/apt/apt.conf.d/70debconf

header "Checking for package updates"
sudo apt-get update
header "Running upgrade"
sudo apt-get -y upgrade

info "Updating max listeners, since npm uses a lot. Not sure exactly what they do, but the default max amount is not enough"
echo fs.inotify.max_user_watches=20000 | sudo tee -a /etc/sysctl.conf
echo vm.overcommit_memory=1 | sudo tee -a /etc/sysctl.conf

header "Setting up firewall"
# Enable firewall
sudo ufw enable -y
# Only allow 80 and 443
sudo ufw allow 'Nginx Full'
sudo sysctl -p