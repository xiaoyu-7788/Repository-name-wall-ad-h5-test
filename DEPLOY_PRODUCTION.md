# wall.hc12345.com 生产发布指南

本文档用于 Ubuntu 24.04 + Nginx + PM2 + Node 的正式发布和回滚。

正式域名：

```text
https://wall.hc12345.com
```

## 生产约定

- 生产域名：`https://wall.hc12345.com`
- PM2 进程名：`wall-ad-h5`
- Node 端口：`8787`
- 源码目录：`/www/wall-ad-system/wall_ad_h5_test`
- Release 目录：`/www/wall-ad-system/releases`
- 当前版本软链接：`/www/wall-ad-system/current`
- 共享数据目录：`/www/wall-ad-system/shared/server/data`
- 共享上传目录：`/www/wall-ad-system/shared/server/uploads`
- Nginx 前端根目录：`/www/wall-ad-system/current/dist`

前端生产 API 请求必须走同域相对路径 `/api/...`。不要把 `localhost:5173`、`127.0.0.1:5173` 或临时测试地址写进生产配置。

## 一键发布

在服务器执行：

```bash
cd /www/wall-ad-system/wall_ad_h5_test
npm run deploy:prod
```

脚本会自动执行：

1. `npm install`
2. `npm run build:prod`
3. 检查 `dist/index.html`
4. 拒绝发布包含 `localhost:5173`、`127.0.0.1:5173`、`VITE_ENABLE_DEV_LOGIN=true` 的构建产物
5. 创建 `/www/wall-ad-system/releases/YYYYMMDD_HHMMSS`
6. 复制 `dist`、`server`、`deploy`、`scripts`、`public`、`package.json`、`package-lock.json`、`ecosystem.config.cjs`、`.env.production`
7. 将 release 内的 `server/data` 和 `server/uploads` 指向 shared 目录
8. 在 release 内安装生产依赖
9. 更新 `/www/wall-ad-system/current` 软链接
10. `pm2 restart wall-ad-h5 --update-env`
11. `pm2 save`
12. 检查 `https://wall.hc12345.com` 和 `https://wall.hc12345.com/api/health`

发布成功后脚本会输出正式站点地址、当前 release 路径、回滚命令和 PM2 状态。

## 一键回滚

在服务器执行：

```bash
cd /www/wall-ad-system/wall_ad_h5_test
npm run rollback:prod
```

脚本会自动找到 `releases` 目录下除当前版本外最新的上一版，切换 `current` 软链接，重启 `wall-ad-h5`，保存 PM2，并执行健康检查。

## 快捷命令

```bash
npm run build:prod
npm run deploy:prod
npm run rollback:prod
npm run pm2:restart
npm run test:prod
```

## .env.production

`.env.production` 只放在服务器，不提交仓库。关键配置示例：

```env
NODE_ENV=production
PORT=8787
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://wall.hc12345.com
PUBLIC_APP_ORIGIN=https://wall.hc12345.com
APP_ORIGIN=https://wall.hc12345.com
CORS_ORIGIN=https://wall.hc12345.com
SESSION_SECRET=请填写32位以上随机字符串
JWT_SECRET=请填写32位以上随机字符串
ADMIN_USERNAME=请填写初始管理员用户名
ADMIN_PHONE=请填写初始管理员手机号
ADMIN_PASSWORD=请填写初始管理员密码
VITE_ENABLE_DEV_LOGIN=false
```

注意：

- `VITE_API_BASE_URL` 生产环境保持为空，前端会使用 `/api/...`。
- `VITE_ENABLE_DEV_LOGIN` 生产必须为 `false` 或不配置。
- `ADMIN_PASSWORD` 不要写进 README、测试报告或仓库。
- 首次启动时，如果业务数据里没有 `super_admin`，后端会读取 `ADMIN_USERNAME`、`ADMIN_PHONE`、`ADMIN_PASSWORD` 自动创建，并用 bcrypt 保存密码 hash。

## Nginx

最终 HTTPS 配置文件：

```text
deploy/nginx/wall.hc12345.com.conf
```

启用方式：

```bash
sudo cp /www/wall-ad-system/current/deploy/nginx/wall.hc12345.com.conf /etc/nginx/sites-available/wall-ad-system
sudo ln -sf /etc/nginx/sites-available/wall-ad-system /etc/nginx/sites-enabled/wall-ad-system
sudo nginx -t
sudo systemctl reload nginx
```

当前配置要点：

- `server_name wall.hc12345.com`
- `root /www/wall-ad-system/current/dist`
- `/api/` 反代到本机 `8787` 端口
- `/uploads/` 指向 `/www/wall-ad-system/shared/server/uploads/`
- `/admin`、`/worker/tk_...` 等前端路由刷新回退到 `index.html`

## PM2

PM2 配置文件：

```text
ecosystem.config.cjs
```

进程名固定为：

```text
wall-ad-h5
```

PM2 从 `/www/wall-ad-system/current` 启动：

```bash
pm2 start /www/wall-ad-system/current/ecosystem.config.cjs --only wall-ad-h5
pm2 save
pm2 status wall-ad-h5
```

不要把进程改名为其他名称，否则发布脚本和回滚脚本会找不到服务。

## 上线后验收

服务器执行：

```bash
cd /www/wall-ad-system/wall_ad_h5_test
npm run test:prod
curl -I https://wall.hc12345.com
curl https://wall.hc12345.com/api/health
pm2 status wall-ad-h5
```

浏览器人工检查：

1. 打开 `https://wall.hc12345.com`
2. 未登录时进入登录页
3. 使用正式账号登录后进入新版后台
4. 打开运营总览、地图调度、点位管理、师傅管理、派单中心、项目管理、素材管理、系统状态
5. 素材管理应为新版卡片网格，不应出现旧版表格素材管理
6. 素材管理应支持单击选中、Ctrl/Cmd 多选、Shift 连续多选、鼠标框选、双击预览、视频可见、下载已选 ZIP
7. 师傅端 `https://wall.hc12345.com/worker/tk_...` 不应被后台登录拦截
8. `/api/health` 返回正常，且链接 origin 为 `https://wall.hc12345.com`

## 常见问题

### 1. 发布脚本拒绝发布 VITE_ENABLE_DEV_LOGIN=true

编辑服务器 `.env.production`：

```bash
VITE_ENABLE_DEV_LOGIN=false
```

然后重新执行：

```bash
npm run deploy:prod
```

### 2. Nginx 刷新 `/admin/media` 404

确认 Nginx 使用了：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

并确认 `root` 指向：

```text
/www/wall-ad-system/current/dist
```

### 3. 上传文件 404

确认 Nginx `/uploads/` alias 指向：

```text
/www/wall-ad-system/shared/server/uploads/
```

确认目录权限允许 Nginx 读取。

### 4. PM2 不是 online

执行：

```bash
pm2 logs wall-ad-h5 --lines 100
pm2 restart wall-ad-h5 --update-env
pm2 status wall-ad-h5
```

### 5. 新版上线异常

立即回滚：

```bash
cd /www/wall-ad-system/wall_ad_h5_test
npm run rollback:prod
```

回滚后再检查：

```bash
curl -I https://wall.hc12345.com
curl https://wall.hc12345.com/api/health
pm2 status wall-ad-h5
```

## 后续新版本快速上线

以后确认新版后，只需要在服务器执行：

```bash
cd /www/wall-ad-system/wall_ad_h5_test
git pull
npm run deploy:prod
```

如需回滚：

```bash
npm run rollback:prod
```
