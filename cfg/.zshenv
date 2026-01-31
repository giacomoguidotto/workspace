# .zshenv is sourced both in login and interactive shells
# session variables
export XDG_CONFIG_HOME="$HOME/.config"

export EDITOR="nvim"
export REACT_EDITOR="nvim"

# used to tell lazygit to use delta as pager (https://github.com/jesseduffield/lazygit/blob/master/docs/Custom_Pagers.md#using-git-config)
export GIT_PAGER="delta"

# remove the direnv log when cd
export DIRENV_LOG_FORMAT=""

# override the default starship config path
export STARSHIP_CONFIG="$HOME/.config/starship/config.toml"

# set the docker host to the colima socket
export DOCKER_HOST="unix://$HOME/.config/colima/docker.sock"

# executables from
export PATH="$HOME/.local/bin:$PATH"

# load session variables from home-manager
if [ -z "${TERMUX_VERSION-}" ]; then
  . "/etc/profiles/per-user/$USER/etc/profile.d/hm-session-vars.sh"
fi

# system management functions
# NOTE: should keep this file as small as possible but still need this function for bootstrapping
# TODO: find a better solution
swc() {
  if [ "${TERMUX_VERSION-}" ]; then
    echo "android termux env detected, installing dependencies..."
    pkg update -y
    pkg install -y zsh neovim fzf starship zoxide direnv eza bat lazygit git-delta ripgrep tokei watchexec yazi zellij
    return
  fi

  if ! command -v nix >/dev/null 2>&1; then
    echo "nix not found, skipping switch..."
  elif command -v darwin-rebuild >/dev/null 2>&1; then
    sudo darwin-rebuild switch --flake ~/.config/nix-darwin
  else
    echo "first time running, switching with nix..."
    sudo nix run nix-darwin/master#darwin-rebuild -- switch --flake ~/.config/nix-darwin
  fi
}

gc() {
  sudo nix-collect-garbage -d
}

up() {
    sudo determinate-nixd upgrade
    nix flake update --flake ~/.config/nix-darwin
    swc
    gc
}
