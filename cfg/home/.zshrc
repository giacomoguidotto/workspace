# ignore config for non-interactive shells
[[ ${-} = ${-/i/} ]] && return

# launch nushell, if interactive shell, not already running, and not in VS Code
if [ -t 1 ] && command -v nu > /dev/null 2>&1 && [ -z "$VSCODE_INJECTION" ]; then
  exec nu
fi

# aliases
alias ..="cd .."
alias ...="cd ../.."
alias ....="cd ../../.."
alias .....="cd ../../../.."
alias ......="cd ../../../../.."
alias c="cursor"
alias cl="clear"
alias d="colima start"
alias ds="colima stop"
alias dlz="d && lzd"
alias de="direnv"
alias dv="devenv"
alias l="eza -la --icons --git --sort type"
alias lt="l --tree --level=2 --long"
alias la="tree"
alias lz="lazygit"
alias lzd="lazydocker"
alias lzq="lazysql"
alias rd="rm -rf"
alias spt="spotify_player"
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
if command -v atuin > /dev/null 2>&1; then
  eval "$(atuin init zsh)"
fi

# carapace - completions
if command -v carapace > /dev/null 2>&1; then
  zstyle ':completion:*' format $'\e[2;37mCompleting %d\e[m'
  source <(carapace _carapace)
fi

# direnv - directory-specific environments
if command -v direnv > /dev/null 2>&1; then
  eval "$(direnv hook zsh)"
fi

# fzf - fuzzy finder
if command -v fzf > /dev/null 2>&1; then
  source <(fzf --zsh)
fi

# starship - prompt
if command -v starship > /dev/null 2>&1; then
  eval "$(starship init zsh)"
fi

# zoxide - directory jumping
if command -v zoxide > /dev/null 2>&1; then
  eval "$(zoxide init zsh)"
fi

# vscode workaround for not loading direnv when opening a new terminal
if [ -n "$VSCODE_INJECTION" ] && [ -z "$VSCODE_TERMINAL_DIRENV_LOADED" ]; then
    cd ~ && cd - > /dev/null
    export VSCODE_TERMINAL_DIRENV_LOADED=1
fi

