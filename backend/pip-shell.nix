{pkgs ? import <nixpkgs> {}}:
(pkgs.buildFHSEnv {
  name = "pipzone";
  targetPkgs = pkgs: (with pkgs; [
    python312
    python312Packages.pip
    python312Packages.virtualenv
    postgresql.lib
  ]);
  runScript = "zsh";
})
.env
