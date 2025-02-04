{ pkgs }:

# https://github.com/numtide/devshell
pkgs.devshell.mkShell {
  name = "expo";
  motd = "";
  env = [
    {
      name = "ANDROID_HOME";
      value = "${pkgs.android-sdk}/share/android-sdk";
    }
    {
      name = "ANDROID_SDK_ROOT";
      value = "${pkgs.android-sdk}/share/android-sdk";
    }
    {
      name = "JAVA_HOME";
      value = pkgs.jdk.home;
    }
  ];
  packages = with pkgs; [
    # expo pkgs
    nodejs_22
    pnpm_9
    deno
    nodePackages.eas-cli

    # ios pkgs
    cocoapods

    # android pkgs
    android-sdk
    gradle
    jdk
  ];
}
