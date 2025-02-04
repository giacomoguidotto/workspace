{
  description = "Expo development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
    devshell.url = "github:numtide/devshell";
    flake-utils.url = "github:numtide/flake-utils";
    android.url = "github:tadfisher/android-nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      devshell,
      flake-utils,
      android,
    }:
    {
      overlay = final: prev: {
        inherit (self.packages.${final.system}) android-sdk android-studio;
      };
    }
    // flake-utils.lib.eachSystem [ "aarch64-darwin" "x86_64-darwin" "x86_64-linux" ] (
      system:
      let
        inherit (nixpkgs) lib;
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
          overlays = [
            devshell.overlays.default
            self.overlay
          ];
        };
      in
      {
        packages = {
          android-sdk = android.sdk.${system} (
            sdkPkgs:
            with sdkPkgs;
            [
              build-tools-34-0-0
              build-tools-35-0-1
              cmdline-tools-latest
              emulator
              platform-tools
              platforms-android-34
              platforms-android-35

              cmake-3-22-1
              cmake-3-31-4
              ndk-26-1-10909125
              ndk-28-0-12916984
              skiaparser-3
              sources-android-34
              sources-android-35
            ]
            ++ lib.optionals (system == "aarch64-darwin") [
              system-images-android-34-google-apis-arm64-v8a
              system-images-android-35-google-apis-arm64-v8a
              # system-images-android-35-google-apis-playstore-arm64-v8a
            ]
            ++ lib.optionals (system == "x86_64-darwin" || system == "x86_64-linux") [
              # system-images-android-35-google-apis-x86-64
              # system-images-android-35-google-apis-playstore-x86-64
            ]
          );
        };

        devShell = import ./devshell.nix { inherit pkgs; };
      }
    );
}
