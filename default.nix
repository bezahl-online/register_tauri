# default.nix

# build using 
# nix-build -E 'let pkgs = import <nixpkgs> { }; in pkgs.callPackage ./default.nix {buildRustPackage = pkgs.rustPlatform.buildRustPackage;}'

{ lib, buildGoModule, buildRustPackage, nixosTests, testers, installShellFiles }:
 let
  version = "1.0";
  owner = "bezahl-online";
  repo = "register";
  rev = "v${version}";
  sha256 = "";
in
buildRustPackage{
  # cargoLock = { lockFile = "/home/ralph/workspace/register-tauri/src-tauri/Cargo.lock"; };
  cargoSha256="";
  pname = "register";
  inherit version;

  src = ./.;
 
  vendorSha256 = "";

  buildPhase = ''
    runHook preBuild
    npm run tauri build
    runHook postBuild
  '';

  installPhase = ''
    mkdir -p $out/bin
    mv register $out/bin
  '';

  meta = with lib; {
    homepage = "https://github.com/bezahl-online/register-tauri";
    description = "register Tauri app code";
    license = licenses.mit;
    maintainers = with maintainers; [ /* list of maintainers here */ ];
  };
}

