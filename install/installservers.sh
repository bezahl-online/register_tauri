# FIXME: check for dependencies
if [ ! -e stage2 ]
then
    sudo apt update
    sudo apt -y upgrade
    sudo apt -y install joe cups

    sudo apt-get -y install --no-install-recommends xserver-xorg x11-xserver-utils xinit xinput libnss3-tools openbox
    sudo snap install chromium

    mkdir -p $HOME/.config/openbox
    echo "export DISPLAY=:0
    xset -dpms
    xset s noblank
    xset s off
    xrandr --output HDMI-1 --mode 1920x1080 --rotate right
    xinput set-prop 'eGalax Inc. eGalaxTouch P80H84 2215 vMK215X k4.10.143' 'Coordinate Transformation Matrix' 0 1 0 -1 0 1 0 0 1
    chromium-browser --kiosk --disable-pinch  --remote-debugging-port=9222 http://localhost" > .config/openbox/autostart


    # ip_ok=""
    # until [[ -n $ip_ok ]] ; do
    #     read -p "IP address for payment terminal (pt): " pt_ip
    #     ip_ok=`echo $pt_ip | grep -oP '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'`
    #     if [[ -z $ip_ok ]]; then echo "seams not quite correct - please try again"; fi
    # done
    # [[ ! $(grep /etc/hosts -e pt)  ]] && sudo echo "${pt_ip} pt" >> /etc/hosts

    # we can't add the cert before chrome hasn't been started once before
    # maybe we could start chrome so it can create its directories and then add the cert
    #. .profile &
    #sleep 5; killall -TERM Xorg
    #certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n bezahl-online -i myCA.pem
    #

    sudo apt -y install docker.io docker-compose
    sudo usermod -aG docker $USER

    sudo openssl s_client -showcerts -connect www.greisslomat.at:3307 < /dev/null | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > /usr/local/share/ca-certificates/ca.crt
    sudo update-ca-certificates


    touch ~/stage2
    echo -n "reboot to start 2nd stage of install in "
    echo -n "3 "
    sleep 1
    echo -n "2 "
    sleep 1
    echo -n "1 "
    sleep 1

    sudo reboot

else

    echo "cleanup.."
    sudo apt autoremove

    echo "install printer Brother HL-L2310.."

    echo "please provide hll2310-brother-printer-driver.deb for printer installation"
    echo "[OK]"
    read -n 1
    
    sudo dpkg --force-architecture -i hll2310dpdrv-4.0.0-1.i386.deb
    lpoptions -d HLL2310D -o PageSize=A4
    lpstat -t

    # FIXME: printapi.service need to be copied to pi first

    sudo cp printapi.service /lib/systemd/system
    sudo systemctl enable printapi
    sudo systemctl start printapi

    # FIXME: install greisslomat.at cert locally first
    docker login https://www.greisslomat.at:3307 --username ralph --password natural-Kennwort
    docker run -d -p 8040:8040 -v /dev/serial/by-id/:/dev/serial/by-id --privileged --name rfid --restart=always  www.greisslomat.at:3307/rfid:$(arch)_stable
    docker run -d -p 8070:8070 -v /dev/serial/by-id/:/dev/serial/by-id --privileged --name gm65 --restart=always  www.greisslomat.at:3307/gm65:$(arch)_stable
    docker run -d -p 8060:8060 -v /var/log/zvt:/var/log/zvt --add-host=pt:192.168.101.162 -e PRODUCTIVE=YES --name ptapi --restart=always  www.greisslomat.at:3307/ptapi:$(arch)_stable
    docker run -d -p 443:443 --name register --restart=always  www.greisslomat.at:3307/register:$(arch)_stable

    echo "execute after reboot: 'certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n bezahl-online -i myCA.pem'"
    echo "[OK]"
    read -n 1

    echo "start netdata install"
    echo "[OK]"
    read -n 1

    # bash <(curl -Ss https://my-netdata.io/kickstart.sh) --dont-wait

    echo "starting wireguard setup.."
    read -p "please provide last number of address (10.8.5.x)" ipnumber
    #./wgsetup.sh $ipnumber # use tailscale now -> login with github ralpheichelberger
    curl -fsSL https://tailscale.com/install.sh | sh
    echo "you should turn off swap (sudo systemctl disable dphys-swapfile) and redirect logging"

fi