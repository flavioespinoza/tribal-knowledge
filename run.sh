#!/bin/bash
# Tribal Knowledge Chief — launchd wrapper
# Usage: ./run.sh /path/to/project/tribal-knowledge
source "$HOME/.zkeys" 2>/dev/null || true
export GEMINI_API_KEY

cd "$(dirname "$0")" || exit 1
exec node dist/watcher.js "$1"
