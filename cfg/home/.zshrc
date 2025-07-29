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
alias d='colima start'
alias dlz="d && lzd"
alias l="eza -l --icons --git -a"
alias lt="eza --tree --level=2 --long --icons --git"
alias la="tree"
alias lz="lazygit"
alias lzd="lazydocker"
alias lzq="lazysql"
alias tp="btop"
alias v="nvim"
alias x="exit"
alias y="yazi"
alias zz="zellij"
alias za="zellij a"

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

# vscode workaround for not loading direnv when opening a new terminal
if [[ -n "$VSCODE_INJECTION" && -z "$VSCODE_TERMINAL_DIRENV_LOADED" && -f .envrc ]]; then
    cd .. && cd - > /dev/null
    export VSCODE_TERMINAL_DIRENV_LOADED=1
fi

# Nix
if [ -e '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh' ]; then
	. '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh'
fi
# End Nix
