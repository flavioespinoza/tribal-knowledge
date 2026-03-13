#!/bin/bash
# Tribal Knowledge Chief — launchd wrapper
# Usage: ./run.sh /path/to/project/tribal-knowledge
source "$HOME/.zkeys" 2>/dev/null || true
export GEMINI_API_KEY

# NOTE: Do NOT export LANG or LC_ALL here.
# pbcopy with LANG=en_US.UTF-8 converts UTF-8 input to Mac Roman before
# storing to the clipboard, which mangles multi-byte characters (… becomes C9).
# pbcopy without LANG treats stdin as raw bytes — UTF-8 passes through correctly.

cd "$(dirname "$0")" || exit 1
exec node dist/watcher.js "$1"
