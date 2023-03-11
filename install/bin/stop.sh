#/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

running_docker=$(docker ps -q)
echo "running: ${running_docker}"
if [ "${running_docker}" == "" ]; then
	echo "no services running"
else
	(echo "stopping all services" && 
	    docker stop ${running_docker} && 
	    echo -e "\n${GREEN}successfully stopped all services ${NC}\n") ||
	    (echo -e "\n${RED}failed${NC}\n" && exit 1)
fi
docker ps

