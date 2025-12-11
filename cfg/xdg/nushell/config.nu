# ignore config for non-interactive shells
if not $nu.is-interactive {
  return
}

# general settings
$env.config.show_banner = false
$env.config.edit_mode = "vi"
$env.config.buffer_editor = "v"

# system management functions
def swc [] {
  if (which nix | is-empty) {
    echo "nix not found, skipping switch..."
  } else if (which darwin-rebuild | is-not-empty) {
    sudo darwin-rebuild switch --flake ~/.config/nix-darwin
  } else {
    echo "first time running, switching with nix..."
    sudo nix run "nix-darwin/master#darwin-rebuild" -- switch --flake ~/.config/nix-darwin
  }
}

def gc [] {
  sudo nix-collect-garbage -d
}

def up [] {
  sudo determinate-nixd upgrade
  nix flake update --flake ~/.config/nix-darwin
  swc
  gc
}

# aliases
alias ..      = cd ..
alias ...     = cd ...
alias ....    = cd ....
alias .....   = cd .....
alias ......  = cd ......

alias c       = cursor
alias cl      = clear
alias d       = colima start
alias ds      = colima stop
alias dlz     = d | lzd
alias de      = direnv
alias dv      = devenv
alias l       = eza -la --icons --git --sort type
alias lt      = l --tree --level=2 --long
alias la      = ^tree
alias lz      = lazygit
alias lzd     = lazydocker
alias lzq     = lazysql
alias rd      = rm -rf
alias spt     = spotify_player
alias tp      = btop
alias ts      = tailscale
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

def md [dir: string] {
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

# 1password - password manager
$env.OP_PLUGIN_ALIASES_SOURCED = '1'
alias gh = op plugin run -- gh

# $env.config.keybindings ++= [{
#     name: complete_hint
#     modifier: control
#     keycode: char_f
#     mode: [emacs, vi_insert, vi_normal]
#     event: { send: historyhintcomplete }
# }, {
#   name: atuin_in_vi_normal
#   modifier: none
#   keycode: char_k
#   mode: [vi_normal]
#   event: {
#     send: executehostcommand
#     cmd: "with-env { ATUIN_LOG: error, ATUIN_QUERY: (commandline) } { commandline edit (run-external atuin search "--interactive"  e>| str trim) }"
#   }
# }]

