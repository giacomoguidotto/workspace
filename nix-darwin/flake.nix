{
  description = "nix-darwin system flake";

  inputs = {
    # import nixpkgs flake with `unstable` channel
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    # import nix-darwin flake
    nix-darwin.url = "github:LnL7/nix-darwin";
    nix-darwin.inputs.nixpkgs.follows = "nixpkgs";

    # import home-manager flake
    home-manager.url = "github:nix-community/home-manager";
    home-manager.inputs.nixpkgs.follows = "nixpkgs";

    # ghostty flake
    ghostty.url = "github:ghostty-org/ghostty";
  };

  outputs =
    inputs@{
      self,
      nix-darwin,
      nixpkgs,
      home-manager,
      ghostty,
    }:
    let
      # https://daiderd.com/nix-darwin/manual/index.html
      configuration =
        { pkgs, ... }:
        {
          # the platform the configuration will be used on
          nixpkgs.hostPlatform = "aarch64-darwin";

          # home-manager external configuration
          users.users.giacomo.home = "/Users/giacomo";
          home-manager.backupFileExtension = "backup";

          # used for backwards compatibility
          # please read the changelog BEFORE changing:
          # $ darwin-rebuild changelog
          system.stateVersion = 5;

          # set git commit hash for darwin-version
          system.configurationRevision = self.rev or self.dirtyRev or null;

          # nix configuration
          services.nix-daemon.enable = true;
          nix.settings.experimental-features = "nix-command flakes";
          nix.useDaemon = true;

          # system configuration
          system.defaults = {
            dock.autohide = true;
            dock.magnification = false;
            dock.orientation = "bottom";
            dock.minimize-to-application = true;
            dock.show-recents = false;
            dock.tilesize = 36;
            dock.wvous-tl-corner = 1; # no action
            dock.wvous-tr-corner = 12; # notification center
            dock.wvous-bl-corner = 1; # no action
            dock.wvous-br-corner = 1; # no action
            finder.AppleShowAllExtensions = true;
            finder.AppleShowAllFiles = true;
            finder.CreateDesktop = false;
            finder.FXPreferredViewStyle = "Nlsv";
            finder.QuitMenuItem = true;
            finder.NewWindowTarget = "Home";
            hitoolbox.AppleFnUsageType = "Change Input Source";
            loginwindow.DisableConsoleAccess = false;
            NSGlobalDomain.ApplePressAndHoldEnabled = true;
            NSGlobalDomain.NSWindowShouldDragOnGesture = true;
          };

          # packages installed in system profile
          # to search by name: $ nix-env -qaP | grep vim
          environment.systemPackages = with pkgs; [
            # nix internals
            nixd
            nil
            nixfmt-rfc-style

            # desktop environment
            aerospace

            # terminals
            # ghostty.packages.aarch64-darwin.default

            # cli tools
            # stow
            # tree
            # git
            # fzf
            # eza
            # neofetch
            # lazygit
            # lazydocker
            # kubectl
            # kubectx

            # editors
            # neovim
            # zed-editor
            # vim

            # apps
            raycast
            docker
            tailscale
            spotify
            arc-browser
            discord
            signal-desktop
            # vlc # not available on aarch64-apple-darwin
          ];

          nixpkgs.config.allowUnfreePredicate =
            pkg:
            builtins.elem (pkgs.lib.getName pkg) [
              "warp-terminal"
              "raycast"
              "spotify"
              "discord"
              "arc-browser"
              "signal-desktop"
            ];

          # other programs
          services.tailscale.enable = true;

          # homebrew
          homebrew.enable = false;
        };
    in
    {
      # build darwin flake:
      # $ darwin-rebuild build --flake ./nix-darwin#main
      darwinConfigurations.main = nix-darwin.lib.darwinSystem {
        specialArgs = { inherit inputs; };
        system = "aarch64-darwin";
        modules = [
          configuration
          home-manager.darwinModules.home-manager
          {
            home-manager.useGlobalPkgs = true;
            home-manager.useUserPackages = true;
            home-manager.users.giacomo = import ./home.nix;
          }
        ];
      };
    };
}
