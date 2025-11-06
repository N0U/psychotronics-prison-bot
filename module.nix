{ config, pkgs, lib, ... }:

let
  package = pkgs.callPackage ./default.nix { inherit pkgs; };
in {
	options.services.psychotronics-tg-bot = {
		enable = lib.mkEnableOption "Enable the Psychotronics tg bot service";
		port = lib.mkOption {
      type = lib.types.port;
      default = 8443;
      description = "Port";
    };
		domain = lib.mkOption {
			type = lib.types.str;
			default = "";
			description = "Domain";
		};
		ip = lib.mkOption {
			type = lib.types.str;
			default = "";
			description = "Ip";
		};
		token = lib.mkOption {
			type = lib.types.str;
			default = "";
			description = "Tg bot token";
		};
		user = lib.mkOption {
			type = lib.types.str;
			default = "psy-bot";
		};
		group = lib.mkOption {
			type = lib.types.str;
			default = "psy-bot";
		};
		key = lib.mkOption {
			type = lib.types.str;
		};
		cert = lib.mkOption {
			type = lib.types.str;
		};
	};

	config = lib.mkIf config.services.psychotronics-tg-bot.enable {
		users.groups."${config.services.psychotronics-tg-bot.group}" = {};
		users.users."${config.services.psychotronics-tg-bot.user}" = {
			isSystemUser = true;
			group = config.services.psychotronics-tg-bot.group;
			home = "/var/lib/${config.services.psychotronics-tg-bot.user}";
			createHome = true;
		};

		systemd.services.psychotronics-tg-bot = {
			description = "Psychotronics tg bot";
			after = [ "network-online.target" ];
    	wants = [ "network-online.target" ];
    	wantedBy = [ "multi-user.target" ];
			environment = {
				PORT = builtins.toString config.services.psychotronics-tg-bot.port;
				TOKEN = config.services.psychotronics-tg-bot.token;
				PROD = "true";
				IP = config.services.psychotronics-tg-bot.ip;
				DOMAIN = config.services.psychotronics-tg-bot.domain;
				KEY = config.services.psychotronics-tg-bot.key;
				CERT = config.services.psychotronics-tg-bot.cert;
			};
			serviceConfig = {
				Restart = "on-failure";
        RestartSec = "10s";
				User = config.services.psychotronics-tg-bot.user;
				Group = config.services.psychotronics-tg-bot.group;
				ExecStart = "${pkgs.nodejs_22}/bin/node ${package}/bin/index.js";
			};
		};
	};
}
