#!/usr/bin/env bash
# Сборка и выкладка прототипа на сервер (статический сайт для nginx).
# Запуск на сервере:  sudo bash deploy/deploy.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/ven2ra/uilearningvtb.git}"
BRANCH="${BRANCH:-claude/youthful-volta-nvazpv}"
SRC_DIR="${SRC_DIR:-/opt/vtb-proto}"      # исходники
WEB_DIR="${WEB_DIR:-/var/www/vtb-proto}"  # то, что отдаёт nginx

command -v node >/dev/null || { echo "Нужен Node.js 20+ (например: curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs)"; exit 1; }

if [ -d "$SRC_DIR/.git" ]; then
  git -C "$SRC_DIR" fetch origin "$BRANCH"
  git -C "$SRC_DIR" checkout -B "$BRANCH" "origin/$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO_URL" "$SRC_DIR"
fi

cd "$SRC_DIR"
if command -v pnpm >/dev/null; then
  pnpm install --frozen-lockfile
  pnpm build
else
  npx --yes pnpm@10 install --frozen-lockfile
  npx --yes pnpm@10 build
fi

mkdir -p "$WEB_DIR"
rsync -a --delete dist/ "$WEB_DIR/"
echo "Готово: сборка лежит в $WEB_DIR"
