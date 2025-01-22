{ pkgs, lib, ... }:

let
  tex = (
    pkgs.texlive.combine {
      inherit (pkgs.texlive)
        scheme-basic
        dvisvgm
        dvipng # for preview and export as html
        wrapfig
        amsmath
        ulem
        hyperref
        capt-of
        ;
      #(setq org-latex-compiler "lualatex")
      #(setq org-preview-latex-default-process 'dvisvgm)
    }
  );
in
# https://daiderd.com/nix-darwin/manual/index.html
{
  home.username = "giacomo";
  home.homeDirectory = "/Users/giacomo";

  # home-manager version
  # used for backwards compatibility
  # please check release notes BEFORE changing:
  home.stateVersion = "24.11";

  # packages installed in user profile.
  home.packages = with pkgs; [
    # internals
    tex
    mas

    # temporary
    zulu17

    # desktop environment
    aerospace

    # terminals
    # ghostty

    # cli tools
    atuin
    bat
    btop
    eza
    fd
    fzf
    git
    kubectl
    kubectx
    lazydocker
    lazygit
    neofetch
    ripgrep
    starship
    stow
    tree
    watchman

    # editors
    neovim
    vim
    zed-editor

    # docker
    colima
    docker-client
    docker-compose

    # apps
    arc-browser
    discord
    raycast
    spotify
    # signal-desktop
    # vlc # not available on aarch64-apple-darwin

    # nerd fonts
    nerd-fonts.blex-mono
    nerd-fonts.jetbrains-mono
    nerd-fonts.zed-mono
  ];

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

    ".condarc".source = ../conda/.condarc;
    ".hushlogin".text = "";
    ".zshrc".source = ../zsh/.zshrc;
    ".zprofile".source = ../zsh/.zprofile;
  };

  # session variables
  # available only if using a home-manager shell
  home.sessionVariables = {
    EDITOR = "zed --wait";
    REACT_EDITOR = "zed --wait";
    XDG_CONFIG_HOME = "$HOME/.config";
    NIX_CONF_DIR = "$HOME/.config/nix";
    DIRENV_LOG_FORMAT = "";
    STARSHIP_CONFIG = "$HOME/.config/starship/config.toml";
    DOTFILES_DIR = "$HOME/dev/dotfiles";
    SHELLS_DIR = "$DOTFILES_DIR/shells";
  };

  # scripts ran after home-manager activation
  home.activation = {
    installXCode = lib.hm.dag.entryAfter [ "home.packages" ] ''
      # ${pkgs.mas}/bin/mas purchase 497799835 2> /dev/null
      ${pkgs.mas}/bin/mas install 497799835 2> /dev/null
    '';
  };
}
