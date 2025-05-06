[[ ${-} = ${-/i/} ]] && return

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
alias z="zellij"
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
