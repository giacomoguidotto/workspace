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
alias swc="darwin-rebuild switch --flake ~/dev/dotfiles/nix-darwin#main"

# eza
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"

# tree
alias la=tree

# navigation
mkcd() { mkdir -p "$1" && cd "$1" }
cx() { cd "$@" && l; }
fcd() { cd "$(find . -type d -not -path '*/.*' | fzf)" && l; }
f() { echo "$(find . -type f -not -path '*/.*' | fzf)" | pbcopy }
ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

# fzf
source <(fzf --zsh)

# direnv
eval "$(direnv hook zsh)"

# android
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

# nvm - TO REMOVE
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
