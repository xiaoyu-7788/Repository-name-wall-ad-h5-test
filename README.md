# 全国墙体广告执行派单系统 H5

当前主线是“国内后端接口适配版”：

- 电脑后台：高德地图执行台、项目管理、批量新增点位、标签筛选、点位编辑、派单。
- 现场中心：现场查看中心、项目照片库、720全景、全景视频、水印图片、Kimi 图片分类、工人定位轨迹。
- 师傅移动端：一页一个点位、查看地址和 K 码、打开高德查看/导航、上传照片/视频。
- 上传成功后：点位自动变为“已完成”，后台刷新即可同步看到状态和媒体数量。

## 数据模式

通过 `.env.local` 配置：

```env
VITE_DATA_MODE=local
VITE_API_BASE_URL=http://localhost:8787
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
VITE_KIMI_CLASSIFY_ENDPOINT=
```

支持三种模式：

- `local`：浏览器 localStorage 演示模式，无后端也能跑。
- `mock-server`：本项目内置 Express 国内接口，适合局域网真实手机测试。
- `production-api`：前端调用 `VITE_API_BASE_URL` 指向的真实国内后端，后端可部署到腾讯云、阿里云、宝塔 Node 服务等。

当前主线不再要求配置 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`。

## 本地运行

安装依赖：

```bash
npm install
```

只跑前端本地演示：

```bash
npm run dev
```

启动国内 Mock API：

```bash
npm run dev:api
```

前后端一起启动：

```bash
npm run dev:all
```

局域网测试建议使用：

```bash
node server/index.js --host 0.0.0.0
npm run dev -- --host 0.0.0.0
```

手机访问示例：

```text
http://电脑局域网IP:5173/worker/w1
http://电脑局域网IP:5173/worker/w2
```

对应 `.env.local`：

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=http://电脑局域网IP:8787
```

## 国内 Mock API

后端目录：

- `server/index.js`：Express REST API。
- `server/data/db.json`：测试数据文件。
- `server/uploads/`：照片/视频上传目录。

主要接口：

- `GET /api/health`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/workers`
- `POST /api/workers`
- `PUT /api/workers/:id`
- `GET /api/wall-points`
- `POST /api/wall-points`
- `PUT /api/wall-points/:id`
- `DELETE /api/wall-points/:id`
- `POST /api/dispatch`
- `GET /api/worker-tasks/:workerId`
- `POST /api/point-media/:pointId`
- `POST /api/complete-point/:pointId`
- `GET /api/track-logs`
- `POST /api/track-logs`
- `POST /api/import-demo`
- `POST /api/reset-demo`

统一返回：

```json
{ "ok": true, "data": {} }
```

或：

```json
{ "ok": false, "error": "错误原因" }
```

## 测试

```bash
npm run build
npm run test:api
npm run test:e2e
```

`test:api` 会自动验证：

- health 正常；
- 写入演示数据；
- 查询 workers；
- 查询 wall-points；
- 派单给 w1；
- `/api/worker-tasks/w1` 能读到任务；
- `complete-point` 能把点位改为“已完成”；
- 再查 wall-points 确认状态已完成。

## 真实测试流程

1. 后台打开首页或 `/admin`。
2. 点击“写入演示数据”。
3. 选择 `李师傅 / 粤A·工002`。
4. 勾选点位。
5. 点击“发送已选点位到师傅移动端”。
6. 手机打开 `/worker/w2` 或 `/worker?worker=w2`。
7. 点击高德导航。
8. 上传现场照片/视频。
9. 回后台刷新。
10. 确认点位状态变为“已完成”，媒体数量增加。

## 部署

请看 [DOMESTIC_API_DEPLOY.md](./DOMESTIC_API_DEPLOY.md)。

旧的 `supabase/schema.sql` 保留为历史参考，不再是当前默认运行方式。

## 本地局域网真机测试

本地真机测试需要同时启动两个服务。

窗口 1：启动国内 Mock API。

```bash
npm run dev:api
```

窗口 2：启动 Vite 前端，并允许局域网访问。

```bash
npm run dev -- --host 0.0.0.0
```

启动后，把 `.env.local` 配成局域网 API 地址：

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=http://电脑局域网IP:8787
```

访问地址：

```text
电脑后台：
http://电脑局域网IP:5173/admin

张师傅移动端：
http://电脑局域网IP:5173/worker/w1

李师傅移动端：
http://电脑局域网IP:5173/worker/w2

后端健康检查：
http://电脑局域网IP:8787/api/health
```

如果 `http://localhost:8787/api/health` 成功，但 `http://电脑局域网IP:8787/api/health` 失败，通常是 Windows 防火墙拦截。请用管理员 PowerShell 放行端口：

```powershell
netsh advfirewall firewall add rule name="WallAd API 8787" dir=in action=allow protocol=TCP localport=8787
netsh advfirewall firewall add rule name="WallAd Vite 5173" dir=in action=allow protocol=TCP localport=5173
```
