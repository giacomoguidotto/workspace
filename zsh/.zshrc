# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias cat="bat"
alias cl="clear"
alias d='colima start'
alias dlz="d && lzd"
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"
alias la="tree"
alias lz="lazygit"
alias lzd="lazydocker"
alias swc="darwin-rebuild switch --flake ~/dev/dotfiles/nix-darwin#main"
alias tp="btop"
alias up="nix flake update --flake ~/dev/dotfiles/nix-darwin#main"
alias v="nvim"
alias x="exit"

# navigation
_fselect() { fd "$@" 2>/dev/null | fzf --height 40% --reverse --preview 'tree -C {} | head -100' --query "${@: -1}"; }

cx() { cd "$@" && l; }
mkcd() { mkdir -p "$1" && cd "$1" }
fcp() { selected=$(_fselect -tf -td "${1:-.}"); [[ -n "$selected" ]] && printf '%s' "$selected" | pbcopy && echo "copied to clipboard: $selected"; }
fcd() { selected=$(_fselect -td "${1:-.}"); [[ -n "$selected" ]] && cd "$selected"; }
fcx() { fcd "$@" && l; }
# ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

# key bindings
bindkey jj vi-cmd-mode

# fzf
source <(fzf --zsh)

# atuin
eval "$(atuin init zsh)"

# starship
eval "$(starship init zsh)"

# direnv
eval "$(direnv hook zsh)"
