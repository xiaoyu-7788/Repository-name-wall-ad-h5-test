# DEPLOY_CHECKLIST

当前主线：国内接口版。旧 Supabase 清单已废弃，保留 `supabase/schema.sql` 仅作为历史参考。

## 前端

- [ ] `npm run build` 通过。
- [ ] `.env`、`.env.local` 没有提交到 Git。
- [ ] `.env.example` 只包含空变量名。
- [ ] `VITE_DATA_MODE` 已设置为 `local`、`mock-server` 或 `production-api`。
- [ ] `mock-server` / `production-api` 模式下已配置 `VITE_API_BASE_URL`。
- [ ] 高德地址匹配需要时已配置 `VITE_AMAP_KEY`。
- [ ] 高德安全密钥需要时已配置 `VITE_AMAP_SECURITY_CODE`。
- [ ] Kimi 图片分类需要时已配置国内后端代理地址 `VITE_KIMI_CLASSIFY_ENDPOINT`。

## Mock Server

- [ ] `npm run dev:api` 可启动。
- [ ] `node server/index.js --host 0.0.0.0` 可局域网监听。
- [ ] `npm run test:api` 通过。
- [ ] `server/data/db.json` 可读写。
- [ ] `server/uploads/` 可写入照片/视频。

## 手机端派单测试

- [ ] 电脑启动 API：`node server/index.js --host 0.0.0.0`。
- [ ] 电脑启动前端：`npm run dev -- --host 0.0.0.0`。
- [ ] 手机和电脑在同一个局域网。
- [ ] `.env.local` 中 `VITE_API_BASE_URL=http://电脑局域网IP:8787`。
- [ ] 后台点击“写入演示数据”。
- [ ] 后台选择 `张师傅 / 粤A·工001` 或 `李师傅 / 粤A·工002`。
- [ ] 后台勾选点位并派单。
- [ ] 手机打开 `/worker/w1` 或 `/worker/w2`。
- [ ] 手机端能看到派发点位。
- [ ] 手机端上传照片/视频。
- [ ] 后台刷新后点位状态变为“已完成”，媒体数量增加。

## 生产部署建议

- [ ] 前端作为静态站点部署。
- [ ] 后端作为 Node.js Express API 部署。
- [ ] 小范围测试可继续使用 JSON 文件。
- [ ] 正式生产建议迁移到 MySQL。
- [ ] 正式生产建议把上传文件迁移到 OSS/COS 对象存储。
