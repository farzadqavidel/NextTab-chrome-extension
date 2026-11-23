#!/usr/bin/env bash
# Update NextTab Chrome extension in place (or install it fresh).
#
# Usage:
#   ./scripts/update-extension.sh [path-to-extension-folder]
#
# Without an argument, the script updates/clones the repo folder it lives in.
set -euo pipefail

REPO_URL="https://github.com/farzadqavidel/NextTab-chrome-extension.git"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="${1:-$REPO_ROOT}"

if [ -d "$TARGET/.git" ]; then
  echo "→ Updating existing clone at: $TARGET"
  git -C "$TARGET" pull --ff-only
else
  echo "→ Cloning into: $TARGET"
  git clone --depth 1 "$REPO_URL" "$TARGET"
fi

echo
echo "✅ Done. Reload the extension at chrome://extensions (click Reload)."
