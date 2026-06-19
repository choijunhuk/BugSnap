#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/kw/apps/BugSnap}"
WEB_DIR="${WEB_DIR:-/var/www/coms/BugSnap}"
BRANCH="${BRANCH:-main}"

cd "$APP_DIR"

git fetch origin "$BRANCH"
current_revision="$(git rev-parse HEAD 2>/dev/null || true)"
target_revision="$(git rev-parse "origin/$BRANCH")"

if [ "$current_revision" != "$target_revision" ]; then
  git reset --hard "origin/$BRANCH"
fi

npm ci
npm test
npm run lint
npm audit --omit=dev
npm run build

mkdir -p "$WEB_DIR"
rsync -a --delete out/ "$WEB_DIR/"
find "$WEB_DIR" -type d -exec chmod 775 {} +
find "$WEB_DIR" -type f -exec chmod 664 {} +

echo "BugSnap deployed at $target_revision to $WEB_DIR"
