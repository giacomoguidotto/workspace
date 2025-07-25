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
  isDarwin = builtins.match "-darwin" system != null;
in
{
  system.primaryUser = "giacomo";

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
      # "cursor"
      # "raycast"
      # "spotify"
      # "discord"
      # "signal-desktop"
    ];

  services = {
    tailscale.enable = true;
    # karabiner-elements.enable = false;
  };

  home-manager.backupFileExtension = "backup";
  home-manager.useGlobalPkgs = true;
  home-manager.useUserPackages = true;

  xdg.enable = true;

  # programs managed by home-manager
  programs = {
    home-manager.enable = true;

    # zsh.enable = true;
    # zsh.enableCompletion = true;

    direnv = {
      enable = true;
      config = {
        whitelist = {
          prefix = [ "~/dev" ];
        };
      };
      nix-direnv.enable = true;
    };
  };

  # inner home-manager module configuration
  # reference: https://nix-community.github.io/home-manager/options.xhtml
  home-manager.users.giacomo = {
    home = {
      username = user;
      homeDirectory = if isDarwin then "/Users/${user}" else "/home/${user}";

      stateVersion = lib.mkDefault "25.05";

      packages = with pkgs; [
        # nix internals
        nixd
        nil
        nixfmt-rfc-style

        # sdks
        nodejs-slim # needed for gh copilot
        texliveFull
        tex-fmt

        # desktop environment
        aerospace

        # terminals
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
        discord
        mas
        raycast
        spotify
        # signal-desktop # not available on aarch64-apple-darwin
        obsidian
        # vlc # not available on aarch64-apple-darwin

        # nerd fonts
        nerd-fonts.blex-mono
        nerd-fonts.jetbrains-mono
        nerd-fonts.zed-mono
      ];
    };

    # scripts ran after home-manager activation
    home.activation = {
      installXCode = lib.hm.dag.entryAfter [ "home.packages" ] ''
        ${pkgs.mas}/bin/mas install 497799835 2> /dev/null
      '';
      installWhatsApp = lib.hm.dag.entryAfter [ "home.packages" ] ''
        ${pkgs.mas}/bin/mas install 310633997 2> /dev/null
      '';
    };
  };
}
