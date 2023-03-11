#/bin/bash
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

running_docker=$(docker ps -a -q)
echo "running: ${running_docker}"
if [ -z $running_docker ]; then
	echo "no services running"
else
	(echo "stopping all services" && 
	    docker rm -f ${running_docker} && 
	    echo -e "\n${GREEN}successfully stopped all services ${NC}\n") ||
	    (echo -e "\n${RED}failed${NC}\n" && exit 1)
fi
docker_images=$(docker images -a -q)
if [ -z $docker_images ]; then
	echo "no images found"
else
	echo skipping..
#	(echo "removing old images" && docker rmi -f ${docker_images} &&
#	    echo -e "\n${GREEN}successfully removed all images ${NC}\n") ||
#	    (echo -e "\n${RED}failed${NC}\n" && exit 1)
fi
(echo "updateing gm65server.." && docker run -d -p 8070:8070 -v /dev/serial/by-id/:/dev/serial/by-id --privileged --name gm65 --restart=always  www.greisslomat.at:5000/gm65 && 
 echo -e "\n${GREEN}gm65server updated and running${NC}\n") ||
    (echo -e "\n${RED}failed${NC}\n" && exit 1)
pt_ip=$(line=`egrep  "pt$" /etc/hosts`; echo ${line:0:15}); echo $pt_ip
(echo "updateing ptapiserver.." && docker run -d -p 8060:8060 -v /var/log/zvt:/var/log/zvt --add-host=pt:${pt_ip} -e PRODUCTIVE=YES --name ptapi --restart=always  www.greisslomat.at:5000/ptapi &&
 echo -e "\n${GREEN}ptapiserver updated and running${NC}\n") ||
    (echo -e "\n${RED}failed${NC}\n" && exit 1)
(echo "updateing register.." && docker run -d -p 443:443 --name register --restart=always  www.greisslomat.at:5000/register && 
 echo -e "\n${GREEN}register updated and running${NC}\n") ||
    (echo -e "\n${RED}failed${NC}\n" && exit 1)
docker ps

