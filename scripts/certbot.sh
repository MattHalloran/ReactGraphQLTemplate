echo "Installing Certbot"
sudo apt-add-repository -r ppa:certbot/certbot
echo "Installing Nginx package for Certbot"
sudo apt-get update
sudo apt-get install python3-certbot-nginx
echo "Creating SSL certificate"
sudo certbot --nginx -d ${SITE_NAME} -d "www.${SITE_NAME}"
echo "Testing certificate auto-renewal"
sudo certbot renew --dry-run