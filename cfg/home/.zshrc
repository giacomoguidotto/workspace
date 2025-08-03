[[ ${-} = ${-/i/} ]] && return

# system management functions
up() {
    sudo determinate-nixd upgrade
    nix flake update --flake ~/.config/nix-darwin
    swc
}

# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias cl="clear"
alias d="colima start"
alias ds="colima stop"
alias dlz="d && lzd"
alias dv="devbox"
alias l="eza -la --icons --git"
alias lt="l --tree --level=2 --long"
alias la="tree"
alias lz="lazygit"
alias lzd="lazydocker"
alias lzq="lazysql"
alias tp="btop"
alias v="nvim"
alias x="exit"
alias y="yazi"
alias za="zellij a"
alias zz="zellij"

# navigation
_fselect() { fd "$@" 2>/dev/null | fzf --height 40% --reverse --preview 'tree -C {} | head -100' --query "${@: -1}"; }

cx() { cd "$@" && l; }
mkcd() { mkdir -p "$1" && cd "$1" }
ff() { aerospace list-windows --all | fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'}

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

