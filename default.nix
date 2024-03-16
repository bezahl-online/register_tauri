{ lib
, cmake
, dbus
, fetchFromGitHub
, fetchYarnDeps
, freetype
, gtk3
, libsoup
, mkYarnPackage
, openssl
, pkg-config
, rustPlatform
, webkitgtk
}:

let

  pname = "Register";
  repo = "register_tauri";
  version = "v1.3.0";
  src = fetchFromGitHub {
    owner = "bezahl-online";
    repo = repo;
    rev = "";
    sha256 = "";
  };

  frontend-build = mkYarnPackage {
    inherit version src pname;

    offlineCache = fetchYarnDeps {
      yarnLock = src + "/yarn.lock";
      sha256 = "sha256-27ZgaJc4XfcWFokjPblD6z9ythwN4jmZuuAK5I7UM/Q=";
    };

    packageJSON = src+"/package.json";

    buildPhase = ''
      export HOME=$(mktemp -d)
      yarn --offline vite build

      cp -r deps/register/ $out
    '';

    distPhase = "true";
    dontInstall = true;
  };
in

rustPlatform.buildRustPackage {
  inherit version src pname repo;

  sourceRoot = "${src.name}/src-tauri";

  cargoLock = {
    lockFile = src+"/src-tauri/Cargo.lock";
    outputHashes = {
      "tauri-plugin-log-0.0.0" = "sha256-t+zmMMSnD9ASZZvqlhu1ah2OjCUtRXdk/xaI37uI49c=";
    };
  };

  # copy the frontend static resources to final build directory
  # Also modify tauri.conf.json so that it expects the resources at the new location
  postPatch = ''
    cp ${src}/Cargo.lock Cargo.lock

    mkdir -p frontend-build
    cp -R ${frontend-build}/dist frontend-build

    substituteInPlace tauri.conf.json --replace '"distDir": "../dist"' '"distDir": "frontend-build/dist"'
  '';

  nativeBuildInputs = [ cmake pkg-config ];
  buildInputs = [ dbus openssl freetype libsoup gtk3 webkitgtk ];

  checkFlags = [
    # tries to mutate the parent directory
    "--skip=test_file_operation"
  ];

  postInstall = ''
    mv $out/bin/app $out/bin/register
  '';

  meta = with lib; {
    description = "register client for MMS";
    homepage = "https://bezahl.online";
    license = licenses.mit;
    maintainers = with maintainers; [ ralpheichelberger ];
  };
}

# my nix expression now works - it builds mosty complelty from github - but I have an annoying little problem that I just dont understand - I need to provide Cargo.lock and packages.json in the build directory - how can I prepair the script not not need that?
# after all it is in the tar from github (Cargo.lock is unter src-tauri - but I also have a copy of it in the root of the tar)
