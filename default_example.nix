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

  pname = "register-tauri";
  version = "1.2.3";

  src = ./.;

  frontend-build = mkYarnPackage {
    inherit version src;
    pname = "register";

    offlineCache = fetchYarnDeps {
      yarnLock = src + "/yarn.lock";
      sha256 = "sha256-H37vD0GTSsWV5UH7C6UANDWnExTGh8yqajLn3y7P2T8=";
    };

    packageJSON = ./package.json;

    buildPhase = ''
      export HOME=$(mktemp -d)
      yarn --offline run prebuild

      cp -r deps/register/out $out
    '';

    distPhase = "true";
    dontInstall = true;
  };
in

rustPlatform.buildRustPackage {
  inherit version src pname;

  sourceRoot = "${src.name}/src-tauri";

  cargoLock = {
    lockFile = ./src-tauri/Cargo.lock;
  };

  # copy the frontend static resources to final build directory
  # Also modify tauri.conf.json so that it expects the resources at the new location
  postPatch = ''
    cp ${./src-tauri/Cargo.lock} Cargo.lock

    mkdir -p frontend-build
    cp -R ${frontend-build}/src frontend-build

    substituteInPlace tauri.conf.json --replace '"distDir": "../out/src",' '"distDir": "frontend-build/src",'
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
    description = "Register client app";
    homepage = "https://github/bezahlonline/register-tauri";
    license = licenses.mit;
    maintainers = with maintainers; [ ralpheichelberger ];
  };
}
