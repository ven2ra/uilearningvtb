#!/usr/bin/env bash
# Переключение сервера на прототип: отключает старый сайт в nginx и публикует этот.
# Запуск (Ubuntu/Debian, под root):
#   curl -fsSL https://raw.githubusercontent.com/ven2ra/uilearningvtb/claude/youthful-volta-nvazpv/deploy/switch.sh | bash
# Чтобы заодно остановить старые процессы pm2 и Docker-контейнеры на портах 80/443:
#   curl -fsSL ... | STOP_OLD=1 bash
set -euo pipefail

BRANCH="claude/youthful-volta-nvazpv"
REPO_URL="https://github.com/ven2ra/uilearningvtb.git"
SRC_DIR="/opt/vtb-proto"
WEB_DIR="/var/www/vtb-proto"
BACKUP_DIR="/root/nginx-sites-backup-$(date +%Y%m%d-%H%M%S)"

say() { printf '\n\033[1;34m== %s\033[0m\n' "$*"; }

say "Что сейчас слушает порты 80 и 443"
ss -ltnp '( sport = :80 or sport = :443 )' || true
command -v pm2 >/dev/null && { echo "--- pm2:"; pm2 list || true; }
command -v docker >/dev/null && { echo "--- docker:"; docker ps --format '{{.Names}}\t{{.Ports}}' || true; }

if [ "${STOP_OLD:-0}" = "1" ]; then
  say "Останавливаю старые процессы (STOP_OLD=1)"
  if command -v pm2 >/dev/null; then pm2 stop all || true; pm2 save --force || true; fi
  if command -v docker >/dev/null; then
    for c in $(docker ps --format '{{.Names}} {{.Ports}}' | awk '/:80->|:443->/ {print $1}'); do
      echo "docker stop $c"; docker update --restart=no "$c" >/dev/null || true; docker stop "$c" || true
    done
  fi
fi

say "Устанавливаю зависимости (git, nginx, rsync, Node.js 22)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git nginx rsync curl ca-certificates >/dev/null
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y -qq nodejs >/dev/null
fi
node -v

say "Скачиваю и собираю прототип"
if [ -d "$SRC_DIR/.git" ]; then
  git -C "$SRC_DIR" fetch -q origin "$BRANCH"
  git -C "$SRC_DIR" checkout -q -B "$BRANCH" "origin/$BRANCH"
else
  git clone -q --branch "$BRANCH" "$REPO_URL" "$SRC_DIR"
fi
cd "$SRC_DIR"
npx --yes pnpm@10 install --frozen-lockfile
npx --yes pnpm@10 build
mkdir -p "$WEB_DIR"
rsync -a --delete dist/ "$WEB_DIR/"

say "Отключаю старые сайты nginx (копия: $BACKUP_DIR)"
mkdir -p "$BACKUP_DIR"
for f in /etc/nginx/sites-enabled/*; do
  [ -e "$f" ] || continue
  [ "$(basename "$f")" = "vtb-proto" ] && continue
  cp -aL "$f" "$BACKUP_DIR/" && rm -f "$f"
done

cat > /etc/nginx/sites-available/vtb-proto <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vtb-proto;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
NGINX
ln -sf /etc/nginx/sites-available/vtb-proto /etc/nginx/sites-enabled/vtb-proto

nginx -t
systemctl enable nginx >/dev/null 2>&1 || true
if ! systemctl restart nginx; then
  say "nginx не запустился — скорее всего порт 80 занят старым проектом:"
  ss -ltnp '( sport = :80 )' || true
  echo "Остановите этот процесс (или запустите скрипт с STOP_OLD=1) и выполните: systemctl restart nginx"
  exit 1
fi

say "Готово"
echo "Прототип: http://$(curl -fsS4 --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')/"
echo "Вернуть старые сайты nginx: cp -a $BACKUP_DIR/* /etc/nginx/sites-enabled/ && rm /etc/nginx/sites-enabled/vtb-proto && systemctl reload nginx"
