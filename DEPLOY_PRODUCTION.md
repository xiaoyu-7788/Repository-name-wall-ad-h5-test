# 公网正式部署指南

本文档用于把《全国墙体广告执行坐标系统》部署到公网 HTTPS 域名，供办公室后台和全国各地师傅移动端 H5 使用。

推荐方案是一台云服务器运行 Node/Express，由 Nginx 反向代理并配置 HTTPS。这样后台、师傅端、API 和上传文件都在同一个 origin 下，能避免跨域、localhost 链接、上传文件丢失和 Serverless 冷启动问题。

## 目标访问地址

- 后台：`https://你的域名/admin`
- 师傅端：`https://你的域名/worker/tk_XXXXXXXXXXXX`
- 健康检查：`https://你的域名/api/health`
- 诊断接口：`https://你的域名/api/debug-state`
- 上传文件：`https://你的域名/uploads/...`

## 服务器准备

建议环境：

- Ubuntu 22.04 LTS 或同类 Linux 云服务器
- Node.js 20+
- npm
- git
- nginx
- pm2
- certbot 或云厂商 HTTPS 证书

示例安装：

```bash
node -v
npm -v
npm install -g pm2
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

## 部署目录

示例目录：

```text
/opt/wall-ad-h5/
  dist/
  server/
    data/db.json
    uploads/
  .env.production
```

`server/data/db.json` 和 `server/uploads/` 是当前版本的核心持久化数据，必须纳入备份并避免发布时覆盖。

## 拉取与构建

```bash
cd /opt
git clone <你的仓库地址> wall-ad-h5
cd /opt/wall-ad-h5
npm install
npm run build
```

如果是更新已有服务，请先备份：

```bash
cp server/data/db.json server/data/db.json.$(date +%F-%H%M%S).bak
tar -czf uploads.$(date +%F-%H%M%S).tar.gz server/uploads
```

## 生产环境变量

在服务器项目根目录创建 `.env.production`，真实 Key 只放服务器或云平台环境变量，不提交仓库。

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://你的域名
VITE_AMAP_KEY=你的高德Web端JSAPIKey
VITE_AMAP_SECURITY_CODE=你的高德安全密钥
PUBLIC_APP_ORIGIN=https://你的域名
PORT=8787
```

关键说明：

- `VITE_API_BASE_URL` 公网同源部署请留空，前端会请求同域名 `/api/...`。
- `VITE_PUBLIC_APP_ORIGIN` 用于后台复制师傅链接，生产必须固定为 HTTPS 公网域名。
- `PUBLIC_APP_ORIGIN` 用于服务端 health 和链接诊断，建议与前端 origin 一致。
- 高德 Key 必须在高德控制台绑定正式域名 Referer。

修改 `VITE_` 变量后必须重新执行 `npm run build`。

## 启动 Node/Express

本地验证：

```bash
PORT=8787 npm run start
```

使用 pm2 常驻：

```bash
pm2 start server/index.js --name wall-ad-h5 --time
pm2 save
pm2 startup
```

查看日志：

```bash
pm2 logs wall-ad-h5
```

重启：

```bash
npm run build
pm2 restart wall-ad-h5
```

## Nginx 反向代理

创建 `/etc/nginx/sites-available/wall-ad-h5`：

```nginx
server {
    listen 80;
    server_name 你的域名;

    client_max_body_size 200m;

    location / {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/wall-ad-h5 /etc/nginx/sites-enabled/wall-ad-h5
sudo nginx -t
sudo systemctl reload nginx
```

`client_max_body_size` 需要覆盖现场视频和批量素材上传的实际大小。

## HTTPS

使用 certbot 示例：

```bash
sudo certbot --nginx -d 你的域名
sudo systemctl reload nginx
```

HTTPS 是正式使用的硬要求：

- 手机浏览器持续定位通常要求 HTTPS。
- 师傅 token 链接必须通过 HTTPS 发给外地师傅。
- 高德 Web JS API 的 Referer、域名和安全密钥需要与 HTTPS 域名匹配。

## 上传目录持久化

当前版本上传文件默认保存在：

```text
server/uploads/
```

生产服务器请确保：

- 发布新版本时不要删除 `server/uploads/`。
- Nginx 和 Node 运行用户对目录有读写权限。
- 服务器磁盘容量足够，尤其是视频和 ZIP 批量下载前的素材积累。
- 至少每日备份 `server/uploads/`。

权限示例：

```bash
mkdir -p server/uploads server/data
chmod -R 755 server/uploads server/data
```

## 数据备份

当前版本业务数据默认保存在：

```text
server/data/db.json
```

建议最低备份策略：

```bash
mkdir -p /opt/backups/wall-ad-h5
cp /opt/wall-ad-h5/server/data/db.json /opt/backups/wall-ad-h5/db.$(date +%F-%H%M%S).json
tar -czf /opt/backups/wall-ad-h5/uploads.$(date +%F-%H%M%S).tar.gz -C /opt/wall-ad-h5/server uploads
```

可加入 crontab：

```bash
0 3 * * * /bin/bash /opt/wall-ad-h5/scripts/backup.sh
```

如果团队规模扩大，建议迁移到 PostgreSQL/MySQL + 对象存储，并保留 token、派单、素材分类和项目级规则字段。

## 为什么不建议只依赖 Vercel Serverless

本系统可以构建为 Vite 前端，但当前正式使用更适合云服务器 Node/Express，而不是只放在 Vercel Serverless：

- 师傅上传的照片和视频需要稳定持久化，Serverless 本地文件系统通常不可持久保存。
- ZIP 批量下载和大文件上传更适合长连接/可控磁盘的 Node 服务。
- 师傅实时定位、小车 Marker 和 debug-state 需要稳定读写同一份状态数据。
- 国内公网访问、域名备案、Nginx 上传大小限制和 HTTPS 证书更适合在云服务器统一控制。
- Vercel 仍可作为纯静态前端/CDN 方案，但必须另配稳定后端、数据库和对象存储。

## 上线前检查清单

部署后依次检查：

- `https://你的域名/api/health` 返回 `ok: true`，且 public origin 是公网 HTTPS 域名。
- `https://你的域名/api/debug-state` 可返回 projects、workers、points、tasks、pointMedia。
- `/admin` 可打开后台，8 个一级导航均可访问。
- 后台项目切换、时间范围、全局搜索和快捷动作可用。
- 高德地图显示真实底图，点位 Marker 和小车 Marker 可见。
- 框选/圈选可在地图上拖动并选中区域点位。
- 新增师傅后复制链接不是 localhost，而是 `https://你的域名/worker/tk_...`。
- 停用师傅后 token 链接失效，重置链接后旧 token 失效。
- 派单后师傅端能读取任务。
- 师傅端固定身份，不显示姓名/手机号/车牌输入框。
- 手机端左右滑动可以切换上一点位/下一点位。
- 手机端 HTTPS 定位授权后，后台小车位置可更新。
- 上传现场照片、720 全景、水印照片、凯立德图片、墙租协议图片和视频后，后台素材可见。
- 项目级素材规则能正确影响齐套状态和点位状态。
- 素材管理当前筛选结果可以导出 manifest，也可以下载 ZIP。
- ZIP 内目录为 `项目名称/点位编号/素材分类/文件名`。

## 回滚建议

上线前保留上一版代码、`db.json` 和 `uploads` 备份。若新版本异常：

```bash
git checkout <上一版提交>
npm install
npm run build
cp <备份db.json> server/data/db.json
tar -xzf <备份uploads.tar.gz> -C server
pm2 restart wall-ad-h5
```

不要使用会误删上传目录或数据文件的发布脚本。
