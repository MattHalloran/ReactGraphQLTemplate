# A full setup of the website, deleting any old data and configurations
HERE=`dirname $0`
BASE_DIR="${HERE}/../../"
source "${BASE_DIR}/.env"

# Remove old data
echo "Deleting certificates"
rm -rf "${PROJECT_DIR}/data/certbot"
echo "Deleting images"
rm -rf "${PROJECT_DIR}/assets/images"
echo "Deleting database"
rm -rf "${PROJECT_DIR}/data/postgres"

${HERE}/dropletSetup.sh

# Update NGINX files
${HERE}/nginxSetup.sh

# Create SSL encryption
${HERE}/init-letsencrypt.sh

# Start docker
cd "${BASE_DIR}"
docker-compose down && docker system prune --all --volumes -f && docker-compose up &