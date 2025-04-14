{
  description = "Python development shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        pythonEnv = pkgs.python39.withPackages (
          ps: with ps; [
            setuptools
            wheel
          ]
        );
      in
      {
        devShells.default = pkgs.mkShell {
          name = "python";

          buildInputs = with pkgs; [
            pythonEnv
            poetry
            black
          ];
        };
      }
    );
}
