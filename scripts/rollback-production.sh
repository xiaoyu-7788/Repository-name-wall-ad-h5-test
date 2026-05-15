#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/www/wall-ad-system}"
RELEASES_DIR="${RELEASES_DIR:-$APP_ROOT/releases}"
CURRENT_LINK="${CURRENT_LINK:-$APP_ROOT/current}"
PM2_APP_NAME="${PM2_APP_NAME:-wall-ad-h5}"
SITE_URL="${SITE_URL:-https://wall.hc12345.com}"
HEALTH_URL="${HEALTH_URL:-$SITE_URL/api/health}"

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "缺少命令：$1"
    exit 1
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

need_command pm2
need_command curl

if [ ! -d "$RELEASES_DIR" ]; then
  echo "releases 目录不存在：$RELEASES_DIR"
  exit 1
fi

mapfile -t releases < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort)
if [ "${#releases[@]}" -lt 2 ]; then
  echo "可回滚版本不足，至少需要 2 个 release。"
  exit 1
fi

current_target=""
if [ -L "$CURRENT_LINK" ]; then
  current_target="$(readlink -f "$CURRENT_LINK")"
fi

previous_release=""
for ((index=${#releases[@]}-1; index>=0; index--)); do
  candidate="$(readlink -f "${releases[$index]}")"
  if [ "$candidate" != "$current_target" ]; then
    previous_release="${releases[$index]}"
    break
  fi
done

if [ -z "$previous_release" ]; then
  echo "没有找到可回滚的上一版本。"
  exit 1
fi

if [ -e "$CURRENT_LINK" ] && [ ! -L "$CURRENT_LINK" ]; then
  echo "拒绝覆盖：$CURRENT_LINK 已存在且不是软链接。"
  exit 1
fi

ln -sfn "$previous_release" "$CURRENT_LINK"

if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME" --update-env
else
  pm2 start "$CURRENT_LINK/ecosystem.config.cjs" --only "$PM2_APP_NAME"
fi
pm2 save

health_check

echo
echo "已回滚到：$previous_release"
echo "正式站点：$SITE_URL"
echo "PM2 状态："
pm2 status "$PM2_APP_NAME"
