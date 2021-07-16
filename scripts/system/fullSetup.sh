# A full setup of the website, deleting any old data and configurations
HERE=`dirname $0`
BASE_DIR="${HERE}/../../"
source "${BASE_DIR}/.env"

# Remove old data
echo "Deleting all data, including database, images, and certificates"
rm -rf "${BASE_DIR}/data"

${HERE}/dropletSetup.sh

# Update NGINX files
${HERE}/nginxSetup.sh

# Create SSL encryption
${HERE}/init-letsencrypt.sh

cd "${BASE_DIR}"
docker-compose down && docker system prune --all --volumes -f