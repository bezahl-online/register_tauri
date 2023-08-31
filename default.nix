# As I said, you'll need a two-stage build
# Build your frontend with buildNpmPackage or similar first
# CoderGrandpa
# is there an example on how to do that?
# K900 ⚡️
# And then you can symlink it into place with preBuild
# Search nixpkgs for buildNpmPackage


{ rustPlatform, 
  fetchFromGitHub, 
  lib, 
  gtk3, 
  webkitgtk, 
  pkgconfig, 
  appimagekit, 
  openssl, 
  cmake, 
  stdenv, 
  libsoup
}:

rustPlatform.buildRustPackage rec {
  pname = "Register";
  version = "1.2.3"; 
  
  src = ./src-tauri/.;

  nativeBuildInputs = [ pkgconfig openssl cmake ];
  
  buildInputs = [ libsoup webkitgtk];

  cargoSha256 = "sha256-LC1YLwMg8bQgsSvKiEcjiXTaj/7qBiDBTGgwzqZwSJ8=";

  meta = with lib; {
    homepage = "https://github.com/bezahl-online/register_tauri";
    description = "Register for MMS";
    license = licenses.mit;
    maintainers = with maintainers; [ ralpheichelberger ];
    platforms = platforms.unix;
  };
}
