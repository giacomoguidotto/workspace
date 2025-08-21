# ignore config for non-interactive shells
if not $nu.is-interactive {
  return
}

# system management functions
def up [] {
  sudo determinate-nixd upgrade
  nix flake update --flake ~/.config/nix-darwin
  swc
}

# aliases
alias ..      = cd ..
alias ...     = cd ../..
alias ....    = cd ../../..
alias .....   = cd ../../../..
alias ......  = cd ../../../../..

alias cl      = clear
alias d       = colima start
alias ds      = colima stop
alias dlz     = d | lzd
alias dv      = devbox
alias l       = eza -la --icons --git
alias lt      = l --tree --level=2 --long
alias la      = ^tree
alias lz      = lazygit
alias lzd     = lazydocker
alias lzq     = lazysql
alias tp      = btop
alias v       = nvim
alias x       = exit
alias y       = yazi
alias za      = zellij a
alias zz      = zellij

alias nu-open = open
alias open    = ^open

# navigation functions
def _fselect [...args] {
  let last = (if ($args | is-empty) { "" } else { $args | last })
  let q = if ($last == "") { [] } else { ["--query" $last] }

  ^fd ...$args
  | ^fzf --height "40%" --reverse --preview 'tree -C {} | head -100' ...$q
}

def cx [dir?: string] {
  if $dir != null { cd $dir }
  l
}

def mkcd [dir: string] {
  mkdir $dir
  cd $dir
}

def ff [] {
  ^aerospace list-windows --all
  | ^fzf --bind 'enter:execute(bash -c "aerospace focus --window-id {1}")+abort'
}

# tools
let autoload_dir = ($nu.data-dir | path join "vendor/autoload")
mkdir $autoload_dir

# atuin - shell history
atuin init nu | save -f ($autoload_dir | path join "atuin.nu")

# carapace - completions
$env.CARAPACE_BRIDGES = 'zsh,fish,bash,inshellisense' 
carapace _carapace nushell | save -f ($autoload_dir | path join "carapace.nu")

# starship - prompt
starship init nu | save -f ($autoload_dir | path join "starship.nu")

# zoxide - directory jumping
zoxide init nushell | save -f ($autoload_dir | path join "zoxide.nu")

# direnv - directory-specific environments
$env.config.hooks.pre_prompt = (
  $env.config.hooks.pre_prompt | append (source nu_scripts/nu-hooks/nu-hooks/direnv/config.nu)
)

# general settings
$env.config.show_banner = false
$env.config.edit_mode = "vi"
$env.config.buffer_editor = "v"

# vscode workaround for direnv
if (('VSCODE_INJECTION' in $env)
  and (not ('VSCODE_TERMINAL_DIRENV_LOADED' in $env))
  and ('.envrc' | path exists)
) {
  cd ..
  cd -
  $env.VSCODE_TERMINAL_DIRENV_LOADED = "1"
}