# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias cl="clear"
alias x="exit"
alias lz="lazygit"
alias d='open -a docker'
alias dlz="open -a docker && lazydocker"
alias v="nvim"
alias dev="nix develop"

# eza
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"

# tree
alias la=tree

# fzf
source <(fzf --zsh)

# navigation
mkcd() { mkdir -p "$1" && cd "$1" }
cx() { cd "$@" && l; }
fcd() { cd "$(find . -type d -not -path '*/.*' | fzf)" && l; }
f() { echo "$(find . -type f -not -path '*/.*' | fzf)" | pbcopy }
ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

# nix
# workaround: override nix-shell and nix develop to run with $SHELL
# https://discourse.nixos.org/t/using-nix-develop-opens-bash-instead-of-zsh/25075
alias nix-shell='nix-shell --run $SHELL'
nix() {
  if [[ $1 == "develop" ]]; then
    shift
    command nix develop -c $SHELL "$@"
  else
    command nix "$@"
  fi
}

# android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

# fuck me
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# pnpm
if command -v pnpm &>/dev/null; then
  source <(pnpm completion zsh)
fi

# bun
if command -v bun &>/dev/null; then
  source <(bun completions)
fi

# deno
if command -v deno &>/dev/null; then
  source <(deno completions zsh)
fi
