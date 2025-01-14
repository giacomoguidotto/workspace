{
  description = "web dev shell";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };

        mkNodeShell =
          nodePkg:
          pkgs.mkShell {
            name = "web-dev";

            buildInputs = with pkgs; [
              nodePkg
              yarn
              pnpm
              bun
              deno
            ];

            shellHook = ''
              # broken until nix flake doesn't support chaging default shell
              # source <(deno completions zsh)
              # source <(bun completions)
              # source <(pnpm completion zsh)
              echo "web dev shell, using:
              node $(node --version)
              yarn $(yarn --version)
              pnpm $(pnpm --version)
              bun $(bun --version)
              $(deno --version)"
            '';
          };
      in
      {
        devShells = {
          default = mkNodeShell pkgs.nodejs-slim_20;
          # run with nix develop .#node18
          node18 = mkNodeShell pkgs.nodejs-slim_18;
        };
      }
    );
}
