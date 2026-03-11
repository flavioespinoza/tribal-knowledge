#!/bin/bash
# Tribal Knowledge Chief — launchd wrapper
# Sources env vars and runs the watcher with absolute paths.
source "$HOME/.zkeys" 2>/dev/null || true
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.gcp/service-account.json"
export GEMINI_API_KEY

cd "$(dirname "$0")" || exit 1
exec node dist/watcher.js
