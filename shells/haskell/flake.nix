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
            cabal-install
            ghc
            haskell-language-server
          ];

          shellHook = ''
            echo "haskell dev shell, using:
            $(ghc --version)
            $(cabal --version)"
          '';
        };
      }
    );
}
