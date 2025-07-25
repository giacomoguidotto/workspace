# Workspace

[![Built with Nix](https://img.shields.io/badge/Built_With-Nix-5277C3.svg?logo=nixos&labelColor=73C3D5)](https://nixos.org)

Development environment configuration using [Nix](https://nixos.org). Multiples
systems are supported using a modular approach that enables separation between
system and user configuration.

It doesn't rely fully on nix. Its intended purpose here is just to configure the
system's settings and act as a declarative package manager. The configuration of
the different user applications uses the conventional text files that follows
the best practices and is more aligned with the community.

## Quick start

For macOS, installation of Nix is recommended but not required. The
[Determinate Nix](https://docs.determinate.systems/) distro is suggested.

Clone the repo and run:

```sh
./install
```

## Quick links

- [Nix Home Manager Manual](https://daiderd.com/nix-darwin/manual/index.html)
- [Nix Home Manager Search](https://home-manager-options.extranix.com/release=master)
- [Nix Darwin Manual](https://daiderd.com/nix-darwin/manual/index.html)

## Acknowledgments

Workspace is heavily inspired by:

- [omerxx/dotfiles](https://github.com/omerxx/dotfiles) for its extensive
  configuration of user applications
- [marcocondrache/nix-config](https://github.com/marcocondrache/nix-config) for
  its modular and scalable approach
