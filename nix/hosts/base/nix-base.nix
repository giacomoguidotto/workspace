{
  # host,
  ...
}:
{
  nix = {
    # nix config is handled by determinate-nix
    # TODO: move config to determinate-nix
    enable = false;
    
    #    settings = {
    #      warn-dirty = false;
    #
    #      experimental-features = [
    #        "nix-command"
    #        "flakes"
    #      ];
    #
    #      trusted-users = [
    #        "@wheel"
    #        "@admin"
    #      ];
    #    };
    #
    #    optimise = {
    #      automatic = true;
    #    };
    #
    #    gc = {
    #      automatic = true;
    #
    #      # keep last 3 generations
    #      options = "--delete-older-than +3";
    #    };
    #
    #    channel = {
    #      enable = false;
    #    };
  };

  nixpkgs = {
    # TODO: needed?
    # hostPlatform = host;
  };
}
