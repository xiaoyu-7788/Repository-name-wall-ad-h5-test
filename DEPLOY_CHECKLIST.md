# DEPLOY_CHECKLIST

## Supabase

- [ ] Supabase 项目处于 active 状态，没有 paused。
- [ ] 已在 Supabase SQL Editor 运行 `supabase/schema.sql`。
- [ ] `workers` 表存在。
- [ ] `wall_points` 表存在。
- [ ] `dispatch_tasks` 表存在。
- [ ] `point_photos` 表存在。
- [ ] `point-media` Storage bucket 存在。
- [ ] 测试期 RLS 策略允许匿名读写 4 张业务表。
- [ ] 测试期 Storage policy 允许 `point-media` 匿名读写。

## Vercel

- [ ] GitHub 仓库没有提交 `.env`、`.env.local`、真实 API Key。
- [ ] Vercel Framework Preset 选择 Vite。
- [ ] Build Command 是 `npm run build`。
- [ ] Output Directory 是 `dist`。
- [ ] 已配置 `VITE_SUPABASE_URL`。
- [ ] 已配置 `VITE_SUPABASE_ANON_KEY`。
- [ ] 已配置 `VITE_AMAP_KEY`。
- [ ] 已配置 `VITE_AMAP_SECURITY_CODE`。
- [ ] 如启用 Kimi 后端分类，已配置 `VITE_KIMI_CLASSIFY_ENDPOINT`。
- [ ] `vercel.json` 已存在，并配置 SPA rewrite，避免 `/worker?worker=li` 刷新 404。

## 部署后 Supabase 诊断检查

- [ ] 打开 `https://你的域名.vercel.app/`。
- [ ] 后台页面显示“全国墙体广告执行派单系统”。
- [ ] 点击“Supabase诊断”。
- [ ] 点击“开始诊断”。
- [ ] 诊断显示已读取 `VITE_SUPABASE_URL`。
- [ ] 诊断显示已读取 `VITE_SUPABASE_ANON_KEY`。
- [ ] 诊断显示 Supabase URL 格式正确。
- [ ] 诊断显示 `workers` 可读写。
- [ ] 诊断显示 `wall_points` 可读写。
- [ ] 诊断显示 `dispatch_tasks` 可读写。
- [ ] 诊断显示 `point_photos` 可读写。
- [ ] 诊断显示 `point-media` bucket 可读取和上传。

## 手机端派单测试

- [ ] 后台点击“写入演示数据”。
- [ ] 后台选择“李师傅 / 粤A·工002”。
- [ ] 后台勾选至少 1 个点位。
- [ ] 后台点击“发送已选点位到师傅移动端”。
- [ ] 手机打开 `https://你的域名.vercel.app/worker?worker=li`。
- [ ] 手机端显示“李师傅 的任务”。
- [ ] 手机端显示任务进度，例如 `1 / N`。
- [ ] 手机端显示点位编号、地址、K码、项目。
- [ ] 手机端“高德查看”和“高德导航”可点击。
- [ ] 手机端可上传照片或视频。
- [ ] 上传后手机端显示成功提示。
- [ ] 回后台刷新后，对应点位状态变为“已完成”。
- [ ] 回后台确认照片/视频数量增加。

## 常见失败定位

- 未配置环境变量：检查 Vercel Settings → Environment Variables。
- URL 格式错误：确认 `VITE_SUPABASE_URL` 是 Supabase 项目 URL 或可访问自定义域名。
- 网络无法访问 Supabase：检查 Vercel 部署环境和 Supabase 项目是否 active。
- 表不存在：重新运行 `supabase/schema.sql`。
- RLS 权限问题：检查测试期表 policy 是否存在。
- bucket 不存在：确认 `point-media` bucket 已创建。
- Storage 上传失败：检查 `storage.objects` 测试 policy。
