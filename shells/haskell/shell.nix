{
  pkgs ? import <nixpkgs> { },
}:
pkgs.mkShell {
  name = "haskell 9.4.8";

  packages = with pkgs; [
    haskell.compiler.ghc94
    haskellPackages.cabal-install
    haskellPackages.hls
    haskellPackages.hlint
  ];

  shellHook = ''
    zsh
  '';
}
