# 国内接口版部署说明

本项目当前主线是“国内后端接口适配版”：前端保持完整 H5 体验，数据层支持 `local`、`mock-server`、`production-api` 三种模式。

## A. 本地局域网测试方式

1. 电脑启动后端：

```bash
npm run dev:api
```

如需监听局域网：

```bash
node server/index.js --host=0.0.0.0
```

2. 电脑启动前端：

```bash
npm run dev -- --host 0.0.0.0
```

3. 查看电脑局域网 IP，例如：

```text
192.168.1.10
```

4. 前端 `.env.local` 示例：

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=http://192.168.1.10:8787
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
VITE_KIMI_CLASSIFY_ENDPOINT=
```

5. 手机访问：

```text
http://192.168.1.10:5173/worker/w1
http://192.168.1.10:5173/worker/w2
```

6. 测试流程：

- 电脑打开后台。
- 点击“写入演示数据”或“重置本地演示数据”。
- 选择张师傅或李师傅。
- 勾选点位并派单。
- 手机打开对应师傅链接。
- 上传现场照片或视频。
- 回后台刷新，确认点位状态变为“已完成”。

## B. 腾讯云 / 阿里云 / 国内服务器部署思路

- 前端是 Vite 静态站点，可部署到腾讯云 CloudBase 静态托管、阿里云 OSS 静态站点、Nginx、宝塔、任意 CDN。
- 后端是 Node.js Express API，可部署到腾讯云轻量服务器、阿里云 ECS、宝塔 Node 项目、函数计算或任意支持 Node.js 的国内平台。
- 当前 mock server 使用 `server/data/db.json` 保存数据，适合测试和小范围演示。
- 正式生产建议把 JSON 文件替换为 MySQL。
- 图片/视频正式生产建议从 `server/uploads` 迁移到阿里云 OSS、腾讯云 COS 或七牛云对象存储。
- 当前版本目标是先确保真实手机派单、上传、状态同步跑通。

## C. MySQL 表结构建议

### projects

- `id`
- `name`
- `brand`
- `description`
- `created_at`
- `updated_at`

### workers

- `id`
- `code`
- `name`
- `phone`
- `car_no`
- `status`
- `created_at`
- `updated_at`

### wall_points

- `id`
- `title`
- `address`
- `landlord_name`
- `landlord_phone`
- `k_code`
- `project_id`
- `project_name`
- `status`
- `lng`
- `lat`
- `completed_at`
- `created_at`
- `updated_at`

### dispatch_tasks

- `id`
- `worker_id`
- `point_id`
- `status`
- `assigned_at`
- `completed_at`
- `created_at`
- `updated_at`

### point_media

- `id`
- `point_id`
- `worker_id`
- `url`
- `file_name`
- `mime_type`
- `kind`
- `created_at`

### track_logs

- `id`
- `worker_id`
- `point_id`
- `lng`
- `lat`
- `accuracy`
- `recorded_at`
- `created_at`
