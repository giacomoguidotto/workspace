# user configuration
# includes:
# - home path
# - system programs (nix-darwin)
# - system daemon (nix-darwin)
# - user packages (home-manager)
# - post-activation scripts (home-manager)
# reference: https://nix-darwin.github.io/nix-darwin/manual/index.html
{
  lib,
  pkgs,
  system,
  ...
}:
let
  user = "giacomo";
  isDarwin = builtins.match ".*darwin.*" system != null;
in
{
  users.users.giacomo = {
    name = user;
    home = if isDarwin then "/Users/${user}" else "/home/${user}";

    # openssh.authorizedKeys.keys = lib.splitString "\n" (
    #   builtins.readFile ./ssh.pub
    # );
  };

  nixpkgs.config.allowUnfreePredicate =
    pkg:
    builtins.elem (lib.getName pkg) [
      "cursor"
      "discord"
      "raycast"
      "spotify"
    ];

  services = {
    tailscale.enable = true;
    # karabiner-elements.enable = false;
  };

  home-manager.backupFileExtension = "backup";
  home-manager.useGlobalPkgs = true;
  home-manager.useUserPackages = true;

  # programs managed by home-manager
  programs = {
    # zsh.enable = true;
    # zsh.enableCompletion = true;

    direnv = {
      enable = true;
      settings = {
        whitelist = {
          prefix = [ "~/dev" ];
        };
      };
      nix-direnv.enable = true;
    };
  };

  # inner home-manager module configuration
  # reference: https://nix-community.github.io/home-manager/options.xhtml
  home-manager.users.giacomo =
    { lib, ... }:
    let
      hmlib = lib;
    in
    {
      xdg.enable = true;

      home = {
        username = user;
        homeDirectory = if isDarwin then "/Users/${user}" else "/home/${user}";

        stateVersion = hmlib.mkDefault "25.05";

        packages = with pkgs; [
          # nix internals
          nixd
          nil
          nixfmt-rfc-style

          # desktop environment
          aerospace

          # terminals
          # not available on aarch64-apple-darwin
          # ghostty

          # shells
          nushell

          # cli tools
          azure-cli
          atuin
          bat
          btop
          carapace
          delta
          devbox
          eza
          fd
          fzf
          git
          jankyborders
          kubectl
          kubectx
          k9s
          lazydocker
          lazygit
          lazysql
          neofetch
          nmap
          ripgrep
          starship
          stow
          tree
          xh
          watchman
          ollama
          yazi
          zoxide
          zellij

          # editors
          neovim
          code-cursor

          # docker
          colima
          docker-client
          docker-compose

          # apps
          brave
          discord
          mas
          raycast
          spotify

          # not available on aarch64-apple-darwin
          # signal-desktop
          # vlc

          # nerd fonts
          nerd-fonts.blex-mono
          nerd-fonts.jetbrains-mono
          nerd-fonts.zed-mono
        ];

        # simlinks of files copied to the Nix store.
        # source path is relative to the flake root.
        file = { };

        # session variables
        # available only if using a home-manager shell
        sessionVariables = { };

        # scripts ran after home-manager activation
        activation = {
          install-xcode = hmlib.hm.dag.entryAfter [ "home.packages" ] ''
            ${pkgs.mas}/bin/mas install 497799835 2> /dev/null
          '';
          install-whatsapp = hmlib.hm.dag.entryAfter [ "home.packages" ] ''
            ${pkgs.mas}/bin/mas install 310633997 2> /dev/null
          '';
        };
      };
    };
}
