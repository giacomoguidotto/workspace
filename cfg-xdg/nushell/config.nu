$env.config.show_banner = false
$env.config.buffer_editor = "nvim"
$env.config.edit_mode = 'vi'

$env.PROMPT_INDICATOR_VI_NORMAL = "❮ "
$env.PROMPT_INDICATOR_VI_INSERT = "❯ "

# aliases
alias .. = cd ..
alias ... = cd ../..
alias .... = cd ../../..
alias ..... = cd ../../../..
alias ...... = cd ../../../../..
alias cat = bat
alias cl = clear
alias d = colima start
alias dlz = d | lzd
alias l = eza -l --icons --git -a
alias lt = eza --tree --level=2 --long --icons --git
alias la = tree
alias lz = lazygit
alias lzd = lazydocker
alias swc = darwin-rebuild switch --flake ~/dev/dotfiles/nix-darwin#main
alias tp = btop
alias up = nix flake update --flake ~/dev/dotfiles/nix-darwin
alias v = nvim
alias x = exit

# navigation
def cx [path: string] { cd $path; l }
def mkcd [dir: string] { mkdir $dir; cd $dir }

# tools
mkdir ($nu.data-dir | path join "vendor/autoload")

# atuin - shell history
atuin init nu | save -f ($nu.data-dir | path join "vendor/autoload/atuin.nu")

# carapace - completions
carapace _carapace nushell | save -f ($nu.data-dir | path join "vendor/autoload/carapace.nu")

# direnv - directory-specific environments
$env.config.hooks.env_change.PWD = (
  $env.config.hooks.env_change.PWD?
  | default []
  | append { ||
    if (which direnv | is-empty) {
        return
    }
    direnv export json | from json | default {} | load-env
  }
)

# starship - prompt
starship init nu | save -f ($nu.data-dir | path join "vendor/autoload/starship.nu")

# zoxide - directory jumping
zoxide init nushell | save -f ($nu.data-dir | path join "vendor/autoload/zoxide.nu")
