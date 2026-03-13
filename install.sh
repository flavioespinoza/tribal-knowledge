#!/bin/bash
# ============================================================================
# Tribal Knowledge — Install Script
# ============================================================================
# Creates the lean tribal-knowledge OUTPUT directory inside any project.
# Does NOT clone the engine — just the directory structure + README index.
#
# The engine stays at ~/Portfolio/tribal-knowledge/ and watches remotely.
#
# Usage:
#   cd ~/Portfolio/dlfn-task
#   bash ~/Portfolio/tribal-knowledge/install.sh
#
#   — or —
#
#   cd ~/Portfolio/dlfn-task
#   curl -fsSL https://raw.githubusercontent.com/flavioespinoza/tribal-knowledge/main/install.sh | bash
# ============================================================================

set -euo pipefail

TARGET_DIR="tribal-knowledge"
ENGINE_DIR="$HOME/Portfolio/tribal-knowledge"

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
echo "[install] Tribal Knowledge — Lean Setup"
echo "[install] Project:  $PROJECT_NAME"
echo "[install] Target:   $PROJECT_ROOT/$TARGET_DIR/"
echo ""

# ---------------------------------------------------------------------------
# Create directory structure (output only — no engine, no node_modules)
# ---------------------------------------------------------------------------
mkdir -p "$PROJECT_ROOT/$TARGET_DIR/images/done"

echo "[install] Created: $TARGET_DIR/"
echo "[install] Created: $TARGET_DIR/images/"
echo "[install] Created: $TARGET_DIR/images/done/"

# ---------------------------------------------------------------------------
# README index
# ---------------------------------------------------------------------------
if [[ ! -f "$PROJECT_ROOT/$TARGET_DIR/README__tribal-knowledge.md" ]]; then
  cat > "$PROJECT_ROOT/$TARGET_DIR/README__tribal-knowledge.md" << MASTER_EOF
# Tribal Knowledge — $PROJECT_NAME

Undocumented tips, Slack screenshots, and platform-specific knowledge that isn't in any official doc.

## How This Works

1. Flavio drops a screenshot into \`tribal-knowledge/images/\` (any name, any format)
2. The watcher renames the image: \`tribal__screenshot--{YYYY-MM-DD}__{timestamp}.png\`
3. The watcher creates a matching \`.md\` file with a **VERBATIM** transcription
4. Processed image moves to \`images/done/\`
5. The \`.md\` file stays in \`tribal-knowledge/\` root
6. This README index gets updated with the new entry

## Naming Convention

\`\`\`txt
tribal__screenshot--{YYYY-MM-DD}__{timestamp}.png    # Original image (moves to images/done/)
tribal__screenshot--{YYYY-MM-DD}__{timestamp}.md     # Verbatim transcription (stays in root)
\`\`\`

## Directory Structure

\`\`\`txt
tribal-knowledge/
├── README__tribal-knowledge.md              ← this file (index)
├── tribal__screenshot--2026-03-11__1773265603682.md
├── images/
│   └── done/
│       └── tribal__screenshot--2026-03-11__1773265603682.png
\`\`\`

## Index

_No entries yet. Drop a screenshot into \`images/\` to get started._
MASTER_EOF
  echo "[install] Created: README__tribal-knowledge.md"
fi

# ---------------------------------------------------------------------------
# Verify env vars
# ---------------------------------------------------------------------------
echo ""
MISSING_ENV=0

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
echo "[install] Done! Tribal Knowledge output directory ready:"
echo "          $PROJECT_ROOT/$TARGET_DIR/"
echo ""
echo "  Start the watcher (from the engine repo):"
echo "    cd $ENGINE_DIR && npm start -- $PROJECT_ROOT/$TARGET_DIR"
echo ""
echo "  Drop screenshots into:"
echo "    $PROJECT_ROOT/$TARGET_DIR/images/"
echo ""
