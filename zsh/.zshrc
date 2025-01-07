# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias cat="bat"
alias cl="clear"
alias d='open -a docker'
alias dlz="open -a docker && lazydocker"
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"
alias la="tree"
alias lz="lazygit"
alias swc="darwin-rebuild switch --flake ~/dev/dotfiles/nix-darwin#main"
alias tp="btop"
alias v="nvim"
alias x="exit"

# key bindings
bindkey jj vi-cmd-mode

# navigation
cx() { cd "$@" && l; }
mkcd() { mkdir -p "$1" && cd "$1" }
f() { echo "$(find . -type f -not -path '*/.*' | fzf)" | pbcopy }
fcd() { cd "$(find . -type d -not -path '*/.*' | fzf)" && l; }
ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

# fzf
source <(fzf --zsh)

# atuin
eval "$(atuin init zsh)"

# starship
eval "$(starship init zsh)"

# direnv
eval "$(direnv hook zsh)"
