#!/bin/bash
# ============================================================================
# Tribal Knowledge — Install Script
# ============================================================================
# Installs the Tribal Knowledge Chief into any project.
#
# Usage:
#   cd ~/Portfolio/dlfn-task
#   curl -fsSL https://raw.githubusercontent.com/flavioespinoza/tribal-knowledge/main/install.sh | bash
#
#   — or —
#
#   cd ~/Portfolio/dlfn-task
#   bash <(curl -fsSL https://raw.githubusercontent.com/flavioespinoza/tribal-knowledge/main/install.sh)
#
#   — or (if already cloned) —
#
#   cd ~/Portfolio/dlfn-task
#   bash /path/to/tribal-knowledge/install.sh
# ============================================================================

set -euo pipefail

REPO="git@github.com:flavioespinoza/tribal-knowledge.git"
BRANCH="main"
TARGET_DIR="tribal-knowledge"

# ---------------------------------------------------------------------------
# Detect project root (must be run from a project directory)
# ---------------------------------------------------------------------------
PROJECT_ROOT="$(pwd)"
PROJECT_NAME="$(basename "$PROJECT_ROOT")"

if [[ ! -f "$PROJECT_ROOT/package.json" && ! -d "$PROJECT_ROOT/.git" ]]; then
  echo "[install] ERROR: Run this from a project root (needs package.json or .git)."
  echo "          cd ~/Portfolio/your-project && bash install.sh"
  exit 1
fi

echo ""
echo "[install] Tribal Knowledge Chief"
echo "[install] Project:  $PROJECT_NAME"
echo "[install] Target:   $PROJECT_ROOT/$TARGET_DIR/"
echo ""

# ---------------------------------------------------------------------------
# Clone or update
# ---------------------------------------------------------------------------
if [[ -d "$PROJECT_ROOT/$TARGET_DIR/.git" ]]; then
  echo "[install] Found existing tribal-knowledge — pulling latest..."
  cd "$PROJECT_ROOT/$TARGET_DIR"
  git pull origin "$BRANCH"
else
  if [[ -d "$PROJECT_ROOT/$TARGET_DIR" ]]; then
    echo "[install] ERROR: $TARGET_DIR/ exists but is not a git repo."
    echo "          Remove it first: rm -rf $TARGET_DIR"
    exit 1
  fi
  echo "[install] Cloning tribal-knowledge into $TARGET_DIR/..."
  git clone "$REPO" "$PROJECT_ROOT/$TARGET_DIR"
fi

cd "$PROJECT_ROOT/$TARGET_DIR"

# ---------------------------------------------------------------------------
# Install deps + build
# ---------------------------------------------------------------------------
echo "[install] Installing dependencies..."
npm install

echo "[install] Building TypeScript..."
npm run build

# ---------------------------------------------------------------------------
# Create directory structure per keymaster spec
# ---------------------------------------------------------------------------
echo "[install] Setting up directory structure..."
mkdir -p images/done

# Master report
if [[ ! -f "README__tribal-knowledge.md" ]]; then
  cat > "README__tribal-knowledge.md" << 'MASTER_EOF'
# Tribal Knowledge — Master Report

> Auto-updated by the Tribal Knowledge Chief.

## Entries

_No entries yet. Drop a screenshot into `images/` to get started._
MASTER_EOF
  echo "[install] Created README__tribal-knowledge.md"
fi

# ---------------------------------------------------------------------------
# Verify env vars
# ---------------------------------------------------------------------------
echo ""
MISSING_ENV=0

if [[ -z "${GOOGLE_APPLICATION_CREDENTIALS:-}" ]]; then
  echo "[install] WARNING: GOOGLE_APPLICATION_CREDENTIALS is not set."
  echo "          Add to ~/.zkeys: export GOOGLE_APPLICATION_CREDENTIALS=\"\$HOME/.gcp/service-account.json\""
  MISSING_ENV=1
fi

if [[ -z "${GEMINI_API_KEY:-}" ]]; then
  echo "[install] WARNING: GEMINI_API_KEY is not set."
  echo "          Add to ~/.zkeys: export GEMINI_API_KEY=\"your-key\""
  MISSING_ENV=1
fi

if [[ $MISSING_ENV -eq 0 ]]; then
  echo "[install] Environment variables OK."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo "[install] Done! Tribal Knowledge Chief installed in:"
echo "          $PROJECT_ROOT/$TARGET_DIR/"
echo ""
echo "  Start the watcher:"
echo "    cd $TARGET_DIR && npm start"
echo ""
echo "  Or run as daemon:"
echo "    cd $TARGET_DIR && ./run.sh"
echo ""
echo "  Drop screenshots into:"
echo "    $TARGET_DIR/images/"
echo ""
