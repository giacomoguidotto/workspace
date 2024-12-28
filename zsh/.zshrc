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
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"
alias la="tree"
alias cat="bat"

# key bindings
bindkey jj vi-cmd-mode

# navigation
mkcd() { mkdir -p "$1" && cd "$1" }
cx() { cd "$@" && l; }
fcd() { cd "$(find . -type d -not -path '*/.*' | fzf)" && l; }
f() { echo "$(find . -type f -not -path '*/.*' | fzf)" | pbcopy }
ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

# fzf
source <(fzf --zsh)

# atuin
eval "$(atuin init zsh)"

# starship
eval "$(starship init zsh)"

# direnv
eval "$(direnv hook zsh)"
