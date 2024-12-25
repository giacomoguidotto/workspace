{ ... }:

{
  home.username = "giacomo";
  home.homeDirectory = "/Users/giacomo";

  # home-manager version
  # used for backwards compatibility
  # please check release notes BEFORE changing:
  home.stateVersion = "24.11";

  # packages installed in user profile.
  # home.packages = with pkgs; [
  # vim

  # # It is sometimes useful to fine-tune packages, for example, by applying
  # # overrides. You can do that directly here, just don't forget the
  # # parentheses. Maybe you want to install Nerd Fonts with a limited number of
  # # fonts?
  # (nerdfonts.override { fonts = [ "FantasqueSansMono" ]; })

  # # You can also create simple shell scripts directly inside your
  # # configuration. For example, this adds a command 'my-hello' to your
  # # environment:
  # (writeShellScriptBin "my-hello" ''
  #   echo "Hello, ${config.home.username}!"
  # '')
  # ];

  # simlinks of files copied to the Nix store.
  # source path is relative to the flake root.
  home.file = {
    # ".config/aerospace" = {
    #   source = ../aerospace;
    #   recursive = true;
    # };
    # ".config/git" = {
    #   source = ../git;
    #   recursive = true;
    # };
    # ".config/lazydocker" = {
    #   source = ../lazydocker;
    #   recursive = true;
    # };
    # ".config/lazygit" = {
    #   source = ../lazygit;
    #   recursive = true;
    # };
    # ".config/neofetch" = {
    #   source = ../neofetch;
    #   recursive = true;
    # };
    # ".config/nix" = {
    #   source = ../nix;
    #   recursive = true;
    # };
    # ".config/nix-darwin" = {
    #   source = ../nix-darwin;
    #   recursive = true;
    # };
    # ".config/nvim" = {
    #   source = ../nvim;
    #   recursive = true;
    # };
    # ".config/zed" = {
    #   source = ../zed;
    #   recursive = true;
    # };

    ".warp" = {
      source = ../warp;
      recursive = true;
    };

    ".zshrc".source = ../zsh/.zshrc;
  };

  # session variables
  # available only if using a home-manager shell
  home.sessionVariables = {
    EDITOR = "zed --wait";
    XDG_CONFIG_HOME = "$HOME/.config";
    NIX_CONF_DIR = "$HOME/.config/nix";
    GOPATH = "$HOME/dev/go";
  };

  # programs managed by home-manager
  programs.zsh.enable = true;
  programs.home-manager.enable = true;
}
