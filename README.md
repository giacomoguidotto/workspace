# dotfiles

My dotfiles. Powered by Nix.

## Getting started

Install Nix ([docs](https://nix.dev/install-nix)):

```sh
curl -L https://nixos.org/nix/install | sh
```

Bootstrap nix-darwin: ([docs](https://github.com/LnL7/nix-darwin/?tab=readme-ov-file#step-2-installing-nix-darwin)):

```sh
nix run nix-darwin -- switch --flake ./nix-darwin#main
```

Nix home-manager dotfiles have some issue due to protection policies.
Some app need to access their configs in write mode.

As a workaround, use `stow` (you might need to remove already existing folders inside `~/.config`):

```sh
stow .
```
