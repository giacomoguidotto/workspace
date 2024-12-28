# brew - TO REMOVE
eval "$(/opt/homebrew/bin/brew shellenv)"

# toolbox - TO REMOVE
export PATH="$PATH:/Users/giacomo/Library/Application Support/JetBrains/Toolbox/scripts"

# android - TO REMOVE
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools"

# nvm - TO REMOVE
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# maven - TO REMOVE
export PATH="$HOME/.maven/bin:$PATH"

# JBang (quarkus) - TO REMOVE
export PATH="$HOME/.jbang/bin:$PATH"
