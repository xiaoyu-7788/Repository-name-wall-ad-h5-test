#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wall-ad-system}"
SOURCE_DIR="${SOURCE_DIR:-$APP_ROOT/wall_ad_h5_test}"
RELEASES_DIR="${RELEASES_DIR:-$APP_ROOT/releases}"
CURRENT_LINK="${CURRENT_LINK:-$APP_ROOT/current}"
SHARED_DIR="${SHARED_DIR:-$APP_ROOT/shared}"
PM2_APP_NAME="${PM2_APP_NAME:-wall-ad-h5}"
SITE_URL="${SITE_URL:-https://wall.hc12345.com}"
HEALTH_URL="${HEALTH_URL:-$SITE_URL/api/health}"
RELEASE_ID="${RELEASE_ID:-$(date +%Y%m%d_%H%M%S)}"
RELEASE_DIR="$RELEASES_DIR/$RELEASE_ID"

rollback_hint() {
  echo
  echo "发布未完成或健康检查失败。"
  echo "可执行回滚：APP_ROOT=\"$APP_ROOT\" npm run rollback:prod"
}

trap rollback_hint ERR

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令：$1"
    exit 1
  fi
}

copy_path() {
  local source="$1"
  local target="$2"
  if [ -e "$source" ]; then
    if command -v rsync >/dev/null 2>&1; then
      rsync -a --delete "$source" "$target"
    else
      rm -rf "$target/$(basename "$source")"
      cp -a "$source" "$target/"
    fi
  fi
}

health_check() {
  echo "执行健康检查：$SITE_URL"
  curl -fsSI "$SITE_URL" >/dev/null
  echo "执行健康检查：$HEALTH_URL"
  local body
  body="$(curl -fsS "$HEALTH_URL")"
  echo "$body" | grep -Eq '"ok"[[:space:]]*:[[:space:]]*true|ok[=:]true'
}

need_command npm
need_command node
need_command pm2
need_command curl

if [ ! -d "$SOURCE_DIR" ]; then
  echo "项目目录不存在：$SOURCE_DIR"
  echo "可通过 SOURCE_DIR=/path/to/project 覆盖。"
  exit 1
fi

cd "$SOURCE_DIR"

if [ -f ".env.production" ] && grep -Eiq '^[[:space:]]*VITE_ENABLE_DEV_LOGIN[[:space:]]*=[[:space:]]*true[[:space:]]*$' ".env.production"; then
  echo "拒绝发布：.env.production 中不能设置 VITE_ENABLE_DEV_LOGIN=true"
  exit 1
fi

echo "开始发布 $SITE_URL"
echo "源码目录：$SOURCE_DIR"
echo "Release：$RELEASE_DIR"

npm install
npm run build:prod

test -f "dist/index.html"
if grep -R "localhost:5173\|127.0.0.1:5173\|VITE_ENABLE_DEV_LOGIN=true" dist >/dev/null 2>&1; then
  echo "拒绝发布：dist 中发现开发地址或测试登录配置。"
  exit 1
fi

mkdir -p "$RELEASES_DIR" "$SHARED_DIR/server/data" "$SHARED_DIR/server/uploads"

if [ -d "server/data" ] && [ -z "$(find "$SHARED_DIR/server/data" -mindepth 1 -maxdepth 1 2>/dev/null)" ]; then
  cp -a server/data/. "$SHARED_DIR/server/data/" 2>/dev/null || true
fi

if [ -d "server/uploads" ] && [ -z "$(find "$SHARED_DIR/server/uploads" -mindepth 1 -maxdepth 1 2>/dev/null)" ]; then
  cp -a server/uploads/. "$SHARED_DIR/server/uploads/" 2>/dev/null || true
fi

mkdir -p "$RELEASE_DIR"
copy_path "dist" "$RELEASE_DIR/"
copy_path "deploy" "$RELEASE_DIR/"
copy_path "scripts" "$RELEASE_DIR/"

mkdir -p "$RELEASE_DIR/server"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude data --exclude uploads server/ "$RELEASE_DIR/server/"
else
  cp -a server/. "$RELEASE_DIR/server/"
  rm -rf "$RELEASE_DIR/server/data" "$RELEASE_DIR/server/uploads"
fi

copy_path "public" "$RELEASE_DIR/"
cp package.json "$RELEASE_DIR/package.json"
[ -f package-lock.json ] && cp package-lock.json "$RELEASE_DIR/package-lock.json"
[ -f ecosystem.config.cjs ] && cp ecosystem.config.cjs "$RELEASE_DIR/ecosystem.config.cjs"
[ -f .env.production ] && cp -p .env.production "$RELEASE_DIR/.env.production"

rm -rf "$RELEASE_DIR/server/data" "$RELEASE_DIR/server/uploads"
ln -sfn "$SHARED_DIR/server/data" "$RELEASE_DIR/server/data"
ln -sfn "$SHARED_DIR/server/uploads" "$RELEASE_DIR/server/uploads"

(
  cd "$RELEASE_DIR"
  npm install --omit=dev
)

if [ -e "$CURRENT_LINK" ] && [ ! -L "$CURRENT_LINK" ]; then
  echo "拒绝覆盖：$CURRENT_LINK 已存在且不是软链接。请先人工备份迁移。"
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start "$CURRENT_LINK/ecosystem.config.cjs" --only "$PM2_APP_NAME"
fi
pm2 save

health_check

echo
echo "发布成功。"
echo "正式站点：$SITE_URL"
echo "当前 release：$RELEASE_DIR"
echo "回滚命令：APP_ROOT=\"$APP_ROOT\" npm run rollback:prod"
echo "PM2 状态："
pm2 status "$PM2_APP_NAME"
