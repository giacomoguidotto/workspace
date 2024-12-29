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
            dock = {
              autohide = true;
              magnification = false;
              orientation = "bottom";
              minimize-to-application = true;
              show-recents = false;
              tilesize = 36;
              wvous-tl-corner = 1; # no action
              wvous-tr-corner = 12; # notification center
              wvous-bl-corner = 1; # no action
              wvous-br-corner = 1; # no action
            };

            finder = {
              AppleShowAllExtensions = true;
              AppleShowAllFiles = true;
              CreateDesktop = false;
              FXPreferredViewStyle = "Nlsv";
              QuitMenuItem = true;
              NewWindowTarget = "Home";
            };

            loginwindow.DisableConsoleAccess = false;

            NSGlobalDomain = {
              InitialKeyRepeat = 20;
              KeyRepeat = 2;
              ApplePressAndHoldEnabled = true;
              NSWindowShouldDragOnGesture = true;
            };

            CustomUserPreferences = {
              "com.apple.HIToolbox" = {

                AppleEnabledInputSources = [
                  {
                    InputSourceKind = "Keyboard Layout";
                    "KeyboardLayout ID" = 223;
                    "KeyboardLayout Name" = "Italian - Pro";
                  }
                  {
                    InputSourceKind = "Keyboard Layout";
                    "KeyboardLayout ID" = 250;
                    "KeyboardLayout Name" = "British-PC";
                  }
                ];

                AppleSelectedInputSources = [
                  {
                    InputSourceKind = "Keyboard Layout";
                    "KeyboardLayout ID" = 250;
                    "KeyboardLayout Name" = "British-PC";
                  }
                ];

                AppleFnUsageType = 1; # change input source
                AppleCurrentKeyboardLayoutInputSourceID = "com.apple.keylayout.British-PC";
                AppleDictationAutoEnable = 1;
              };
              "com.apple.AppleMultitouchTrackpad" = {
                ActuateDetents = 1;
                Clicking = 1;
                DragLock = 0;
                Dragging = 0;
                FirstClickThreshold = 1;
                ForceSuppressed = 0;
                HIDScrollZoomModifierMask = 0;
                SecondClickThreshold = 1;
                TrackpadCornerSecondaryClick = 0;
                TrackpadFiveFingerPinchGesture = 2;
                TrackpadFourFingerHorizSwipeGesture = 2;
                TrackpadFourFingerPinchGesture = 2;
                TrackpadFourFingerVertSwipeGesture = 2;
                TrackpadHandResting = 1;
                TrackpadHorizScroll = 1;
                TrackpadMomentumScroll = 1;
                TrackpadPinch = 1;
                TrackpadRightClick = 1;
                TrackpadRotate = 1;
                TrackpadScroll = 1;
                TrackpadThreeFingerDrag = 0;
                TrackpadThreeFingerHorizSwipeGesture = 2; # switch between full-screen apps
                TrackpadThreeFingerTapGesture = 0;
                TrackpadThreeFingerVertSwipeGesture = 2; # mission control
                TrackpadTwoFingerDoubleTapGesture = 1;
                TrackpadTwoFingerFromRightEdgeSwipeGesture = 3;
                USBMouseStopsTrackpad = 0;
              };
            };
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
