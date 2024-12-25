{
  description = "haskell dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      with pkgs;
      {
        devShell = mkShell {
          buildInputs = [
            # haskell.compiler.ghc94
            # haskellPackages.cabal-install
            # haskellPackages.hls
            # haskellPackages.hlint
          ];

          shellHook = ''
            zsh
          '';
        };
      }
    );
}
