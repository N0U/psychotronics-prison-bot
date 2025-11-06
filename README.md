Простой бот для телеграма для создания анонимной группы. Он автоматически делает анонимами всех новых юзеров.
Можно использовать как в группе так и в канале. Группа/канал обязательно должны быть приватными и на инвайте должно быть включено одобрение админом. Бот всех одобряет и делает админами, вот какой он добрый :D

## Запуск на сервере

```
npm i
openssl req -newkey rsa:2048 -sha256 -nodes -keyout cert.key -x509 -days 365 -out cert.pem -subj "/CN=$YOUR_DOMAIN_OR_IP" -addext "subjectAltName = IP:$YOUR_IP"
PROD=true IP=$IP PORT=$PORT TOKEN=$TOKEN KEY=$KEY CERT=$CERT node index.js
```

## Для NixOs

psy-bot.nix    
```nix
{ config, pkgs, lib, ... }:
let
  src = builtins.fetchTarball {
    url = "https://github.com/N0U/psychotronics-prison-bot/archive/e90041c2d0511b127becd12be9135fc66d2bc286.tar.gz";
    sha256 = "16zaj1b5yqfyy02iimnfs6inahs3bcxfw5bl231a88pfy6a4mbnl";
  };
in {
	imports = [
    "${src}/module.nix"
	];	
	services.psychotronics-tg-bot = {
		enable = true;
		port = 8443;
		ip = "IP";
		token = "TOKEN";
		key = "/var/lib/psy-bot/ssl/cert.key";
		cert = "/var/lib/psy-bot/ssl/cert.pem";
	};
} 
```

После ребилда надо добавить ключи   
```bash
sudo mkdir -p /var/lib/psy-bot/ssl
sudo cd /var/lib/psy-bot/ssl
sudo openssl req -newkey rsa:2048 -sha256 -nodes -keyout cert.key -x509 -days 365 -out cert.pem -subj "/CN=$YOUR_DOMAIN_OR_IP" -addext "subjectAltName = IP:$YOUR_IP"
sudo chown psy-bot:psy-bot -R /var/lib/psy-bot/ssl
```
