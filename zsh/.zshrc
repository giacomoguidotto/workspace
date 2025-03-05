[[ ${-} = ${-/i/} ]] && return

# zellij - terminal multiplexer
if [[ -z "$ZELLIJ" ]]; then
  if [[ "$ZELLIJ_AUTO_ATTACH" == "true" ]]; then
        zellij attach -c --index 0
    else
        zellij
    fi

    if [[ "$ZELLIJ_AUTO_EXIT" == "true" ]]; then
        exit
    fi
fi

# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias cat="bat"
alias cl="clear"
alias cd="z"
alias d='colima start'
alias dlz="d && lzd"
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"
alias la="tree"
alias lz="lazygit"
alias lzd="lazydocker"
alias swc="darwin-rebuild switch --flake ~/dev/dotfiles/nix-darwin#main"
alias tp="btop"
alias up="nix flake update --flake ~/dev/dotfiles/nix-darwin"
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

# tools

# atuin - shell history
eval "$(atuin init zsh)"

# carapace - completions
zstyle ':completion:*' format $'\e[2;37mCompleting %d\e[m'
source <(carapace _carapace)

# direnv - directory-specific environments
eval "$(direnv hook zsh)"

# fzf - fuzzy finder
source <(fzf --zsh)

# starship - prompt
eval "$(starship init zsh)"

# zoxide - directory jumping
eval "$(zoxide init zsh)"
