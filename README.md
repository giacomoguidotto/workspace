# Workspace

[![Built with Nix](https://img.shields.io/badge/Built_With-Nix-5277C3.svg?logo=nixos&labelColor=73C3D5)](https://nixos.org)

Development environment configuration using [Nix](https://nixos.org). Multiples
systems are supported using a modular approach that enables separation between
system and user configuration.

It doesn't rely fully on nix. Its intended purpose here is just to configure the
system's settings and act as a declarative package manager. The configuration of
the different user applications uses the conventional text files that follows
the best practices and is more aligned with the community.

## 🚀 Quick start

### 🍏 macOS

For macOS, installation of Nix is recommended but not required. The
[Determinate Nix](https://determinate.systems/nix-installer/) distro is suggested.

Clone the repo and run:

```sh
./install
```

### 📱 Android

For Android, using Termux, the following steps are required:

```sh
pkg install -y zsh python
chsh -s zsh
```

Close and reopen the terminal.

Then, clone the repo and run:

```sh
./install
```

## 🔧 Troubleshooting

Collection of issues faced during the installation process. Hopefully useful for
others :)

### cannot create directory [...]: Operation not permitted

In case of errors like the following:

```
error: Cannot build '/nix/store/8icjqwqrw122n9h3bliv1d3sbaxvphkx-cursor-1.2.2.drv'.
       Reason: builder failed with exit code 1.
       Output paths:
         /nix/store/mdwh1hkzgqib6kj3xkjzaf3rhd2gh2wm-cursor-1.2.2
       Last 8 log lines:
       > Running phase: unpackPhase
       > unpacking source archive /nix/store/r64az1s96fa6s50z3fn2bjz34xxqacy6-Cursor-darwin-arm64.dmg
       > source root is Cursor.app
       > Running phase: patchPhase
       > Running phase: updateAutotoolsGnuConfigScriptsPhase
       > Running phase: glibPreInstallPhase
       > Running phase: installPhase
       > mkdir: cannot create directory '/nix/store/mdwh1hkzgqib6kj3xkjzaf3rhd2gh2wm-cursor-1.2.2/Applications/Cursor.app': Operation not permitted
```

follow the instructions in [this issue](https://github.com/nix-darwin/nix-darwin/issues/1315#issuecomment-2821371305)

### updating the submodules

Just run:

```sh
git submodule update --remote
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
