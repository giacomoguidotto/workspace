# system configuration for "evolve", darwin arm64 machine
# reference: https://nix-darwin.github.io/nix-darwin/manual/index.html
{ ... }:
{
  imports = [
    ./base/darwin-base.nix
    ../homes/giacomo.nix
  ];

  system.primaryUser = "giacomo";
}
