#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${1:-$(git -C "$ROOT" describe --tags --abbrev=0 2>/dev/null || echo "snapshot")}"
VERSION="${VERSION#v}"
OUT_DIR="$ROOT/dist"
ARCHIVE="umedia-television-v${VERSION}.zip"
STAGING="$OUT_DIR/.staging-v${VERSION}"

rm -rf "$STAGING"
mkdir -p "$STAGING" "$OUT_DIR"

copy() {
  cp -R "$1" "$STAGING/$(basename "$1")"
}

cd "$ROOT"
copy index.html
copy styles.css
copy script.js
copy form-config.js
copy README.md
for dir in about contact platform products solutions technology assets; do
  copy "$dir"
done

(
  cd "$STAGING"
  zip -rq "$OUT_DIR/$ARCHIVE" .
)

rm -rf "$STAGING"
echo "Created $OUT_DIR/$ARCHIVE ($(du -h "$OUT_DIR/$ARCHIVE" | cut -f1))"
