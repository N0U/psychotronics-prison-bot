{ lib, pkgs ? import <nixpkgs> {} }:

pkgs.buildNpmPackage {
  pname = "psychotronics-tg-bot";
  version = "2.0";
  src = ./.;

	npmDepsHash = "sha256-/kX85j9YuxoqmchLjctJhmQ+oDWQx0F2KdSc9uTaqOk="; 

	nodejs = pkgs.nodejs_22;

	dontNpmBuild = true;
	
  installPhase = ''
    mkdir -p $out/bin
		mkdir -p $out/lib

    cp -r . $out/lib
		
		ln -s $out/lib/index.js $out/bin/index.js
  '';

  meta = with pkgs.lib; {
    description = "Telegram bot for managing anonymous chats";
    homepage = "https://github.com/N0U/psychotronics-prison-bot";
    platforms = platforms.linux;
  };
}
