#/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

if [ -z "$1" ] 
    then echo "please provide last number of address (10.8.5.x)"
    exit
fi

echo "installing wireguard.."
apt install wireguard

echo "changing into /etc/wireguard"
cd /etc/wireguard
ENDPOINT="185.206.144.105:41194"
umask 077; wg genkey | tee privatekey | wg pubkey > publickey
echo -n "[Interface]
PrivateKey = " >  wg0.conf
cat privatekey >> wg0.conf
echo "Address = 10.8.5.$1/32

[Peer]
AllowedIPs = 10.8.5.0/24
PublicKey = kss2503hZnCkKb1JeZSl4drryJdFRLrDGnCEyAyCWkw=
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE; iptables -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE; iptables -D FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --clamp-mss-to-pmtu

Endpoint = $ENDPOINT

PersistentKeepalive = 15
">> wg0.conf

echo "enabling wireguard service.."
systemctl enable wg-quick@wg0
echo "starting wireguard service.."
systemctl start wg-quick@wg0

echo "NOW you need to append following to endpoint at '$ENDPOINT':"
echo -n "[Peer]
## $(hostname)
PublicKey = "
cat publickey
echo "AllowedIPs = 10.8.5.$1/32"
echo ""
echo "AND restart wireguard on endpoint:"
echo "-> systemctl restart wg-quick@wg0"
