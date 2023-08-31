# build with:
# nix-build -E 'let pkgs = import <nixpkgs> { }; in pkgs.callPackage ./default.nix {}'


{ lib, buildNpmPackage, fetchFromGitHub }:

buildNpmPackage rec {
  pname = "register";
  version = "1.2.3";

  src = ./.;
  # makeCacheWritable=true;
  npmDepsHash = "sha256-FIBlEqTwIA9O6WqRDk5TRbY9xSc+Scd1ulxYxKOpB1o=";

  # The prepack script runs the build script, which we'd rather do in the build phase.
  npmPackFlags = [ "--ignore-scripts" ];

  NODE_OPTIONS = "--openssl-legacy-provider";

  meta = with lib; {
    description = "Register app for MMS";
    homepage = "";
    license = licenses.gpl3Only;
    maintainers = with maintainers; [ ralpheichelberger ];
  };
}

