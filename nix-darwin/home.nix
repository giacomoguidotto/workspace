{ pkgs, ... }:

{
  home.username = "giacomo";
  home.homeDirectory = "/Users/giacomo";

  # home-manager version
  # used for backwards compatibility
  # please check release notes BEFORE changing:
  home.stateVersion = "24.11";

  # packages installed in user profile.
  home.packages = with pkgs; [

    # terminals
    # ghostty

    # cli tools
    stow
    tree
    git
    fzf
    eza
    atuin
    starship
    neofetch
    lazygit
    lazydocker
    kubectl
    kubectx

    # editors
    neovim
    zed-editor
    vim

    # nerd fonts
    nerd-fonts.jetbrains-mono
    nerd-fonts.zed-mono
    nerd-fonts.blex-mono
  ];

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
    ".zprofile".source = ../zsh/.zprofile;
  };

  # programs managed by home-manager
  programs = {
    home-manager.enable = true;

    zsh.enable = true;

    direnv = {
      enable = true;
      enableZshIntegration = true;
      nix-direnv.enable = true;
    };
  };

  # session variables
  # available only if using a home-manager shell
  home.sessionVariables = {
    EDITOR = "zed --wait";
    XDG_CONFIG_HOME = "$HOME/.config";
    NIX_CONF_DIR = "$HOME/.config/nix";
    # GOPATH = "$HOME/dev/go";
    DIRENV_LOG_FORMAT = "";
    STARSHIP_CONFIG = "$HOME/.config/starship/config.toml";
    DOTFILES_DIR = "$HOME/dev/dotfiles";
    SHELLS_DIR = "$DOTFILES_DIR/shells";
  };
}
