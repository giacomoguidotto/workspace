# brew - TO REMOVE
eval "$(/opt/homebrew/bin/brew shellenv)"

# toolbox - TO REMOVE
export PATH="$PATH:/Users/giacomo/Library/Application Support/JetBrains/Toolbox/scripts"

# android - TO REMOVE
export JAVA_HOME="/nix/store/xqpp39hasmly9g1d3i0f8zb54sxgwahq-zulu-ca-jdk-17.0.12/zulu-17.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools"
# export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

# maven - TO REMOVE
export PATH="$PATH:$HOME/.maven/bin"

# JBang (quarkus) - TO REMOVE
export PATH="$PATH:$HOME/.jbang/bin"
