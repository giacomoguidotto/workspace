# attribute set for os underlying configuration
# includes: security, desktop, system apps, keyboard layout, trackpad settings, brew
# reference: https://nix-darwin.github.io/nix-darwin/manual/index.html
{ host, ... }:
{
  system = {
    # used for backwards compatibility
    # please read the changelog BEFORE changing:
    # $ darwin-rebuild changelog
    stateVersion = 6;

    defaults = {
      dock = {
        autohide = true;
        expose-group-apps = true;
        largesize = 16;
        magnification = false;
        mineffect = "genie";
        minimize-to-application = true;
        orientation = "bottom";
        persistent-apps = [ ];
        persistent-others = [ ];
        show-recents = false;
        tilesize = 36;
        wvous-tl-corner = 2; # mission control
        wvous-tr-corner = 12; # notification center
        wvous-bl-corner = 5; # start screensaver
        wvous-br-corner = 5; # start screensaver
      };

      finder = {
        AppleShowAllExtensions = true;
        AppleShowAllFiles = true;
        CreateDesktop = false;
        FXPreferredViewStyle = "Nlsv";
        QuitMenuItem = true;
        NewWindowTarget = "Home";
      };

      spaces.spans-displays = true;

      loginwindow.DisableConsoleAccess = false;

      NSGlobalDomain = {
        InitialKeyRepeat = 20;
        KeyRepeat = 2;
        ApplePressAndHoldEnabled = false;
        NSWindowShouldDragOnGesture = true;
        AppleInterfaceStyle = "Dark";
        _HIHideMenuBar = true;

        "com.apple.sound.beep.feedback" = 0;
        "com.apple.sound.beep.volume" = 0.0;
      };

      CustomUserPreferences = {
        "com.apple.HIToolbox" = {
          AppleEnabledInputSources = [
            {
              InputSourceKind = "Keyboard Layout";
              "KeyboardLayout ID" = 252;
              "KeyboardLayout Name" = "ABC";
            }
          ];
          AppleSelectedInputSources = [
            {
              InputSourceKind = "Keyboard Layout";
              "KeyboardLayout ID" = 252;
              "KeyboardLayout Name" = "ABC";
            }
          ];
          AppleFnUsageType = 1; # change input source
          AppleCurrentKeyboardLayoutInputSourceID = "com.apple.keylayout.ABC";
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

      SoftwareUpdate.AutomaticallyInstallMacOSUpdates = true;
    };
  };

  networking = {
    computerName = host;
    localHostName = host;
  };

  security.pam.services.sudo_local.touchIdAuth = true;

  homebrew.enable = false;
}
