{
  description = "workspace";

  inputs = {
    # user packages repository
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    # support building for multiple architectures
    systems.url = "github:nix-systems/default";

    # darwin configuration
    nix-darwin.url = "github:LnL7/nix-darwin";
    nix-darwin.inputs.nixpkgs.follows = "nixpkgs";

    # home configuration
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    inputs@{ nixpkgs, ... }:
    let
      lib = nixpkgs.lib // import ./lib inputs;
    in
    {
      darwinConfigurations = {
        evolve = lib.makeSystem {
          host = "evolve";
          system = "aarch64-darwin";
          darwin = true;
        };
      };

      # nixosConfigurations = {
      #   anotherhost = lib.makeSystem {
      #     host = "anotherhost";
      #     system = "x86_64-linux";
      #     darwin = false;
      #   };
      # };
    };
}
