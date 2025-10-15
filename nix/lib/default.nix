# set of utility functions for the workspace
inputs@{ nixpkgs,  ... }:
{
  # create a system configuration
  # host: the host name (used to import the host module from ../hosts/)
  # system: the system architecture (e.g. aarch64-darwin)
  # darwin: whether the system is a darwin system
  # name: optional name of the system (defaults to host)
  makeSystem =
    args@{
      host,
      system,
      name ? host,
    }:
    let
      isDarwin = builtins.match ".*darwin.*" system != null;

      createSystem =
        if isDarwin then 
          inputs.nix-darwin.lib.darwinSystem 
        else 
          nixpkgs.lib.nixosSystem;

      hostModule = import ../hosts/${host}.nix;

      homeModule =
        if isDarwin then
          inputs.home-manager.darwinModules.home-manager
        else
          inputs.home-manager.nixosModules.home-manager;
    in
    createSystem {
      inherit system;

      specialArgs = { inherit inputs; } // args;

      modules = [
         # nix is handled by determinate-nix
        { nix.enable = false; }

        hostModule
        homeModule
      ];
    };
}
