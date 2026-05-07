# DEPLOY_RESULT

更新时间：2026-05-07

## 当前部署状态

- GitHub：已连接远程私有仓库，并已推送 `main` 分支。
- Vercel：用户已完成网页部署；当前改造为 Vercel API 代理模式，待重新部署。
- Vercel 环境变量：需要新增服务端私密变量后重新部署。
- 预览环境：需重新部署代理版本。
- 生产环境：需重新部署代理版本。

## 本地已完成

- 已新增 `AGENTS.md` 项目长期规则。
- 已确认 `.env` 被 `.gitignore` 忽略，没有进入 Git 提交。
- 已提交本地 Git commit：`chore: prepare h5 app for vercel deployment`。
- 已添加远程仓库：`https://github.com/xiaoyu-7788/Repository-name-wall-ad-h5-test.git`。
- 已切换当前分支为 `main`。
- 已推送到 `origin/main`。
- 已给 `package.json` 补充 ASCII 项目名 `wall-ad-h5-test` 和 `private: true`，便于 Node/Vercel 工具识别项目。
- `npm install`：通过。
- `npm run build`：通过。
- `npm run test:e2e`：通过，8 passed。
- `npm run test:supabase`：失败，原因是当前机器网络无法访问 Supabase REST/Storage endpoint；未写入测试数据。
- 已新增 Vercel API 代理路由，浏览器可优先请求本站 `/api/*`，由 Vercel Serverless Function 访问 Supabase。
- 已保留本地演示模式和前端 Supabase 直连备用模式。
- `npm install`：通过。
- `npm run build`：通过。
- `npm run test:e2e`：通过，9 passed。

## 访问地址

代理版本需要重新部署后生效。

- 后台访问地址：`https://你的部署域名/`。
- 张师傅移动端地址：`https://你的部署域名/worker?worker=zhang`。
- 李师傅移动端地址：`https://你的部署域名/worker?worker=li`。

## Vercel API 代理模式

新增 API：

- `GET /api/diagnose`
- `POST /api/seed-demo`
- `GET|POST|PATCH /api/points`
- `GET /api/workers`
- `POST /api/dispatch`
- `GET /api/worker-tasks`
- `POST /api/upload`
- `PATCH /api/photos`

Vercel 需要配置：

前端公开变量：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_KEY`
- `VITE_AMAP_SECURITY_CODE`
- `VITE_DATA_MODE=proxy`
- `VITE_KIMI_CLASSIFY_ENDPOINT`，可选

服务端私密变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY` 只能填在 Vercel Environment Variables，不要写进前端代码、GitHub、README、报告或聊天。

## 卡住的位置

历史自动部署曾卡在 Vercel CLI 阶段：

- 执行 `vercel --version` 失败。
- 当前机器找不到 `vercel` 命令。
- `npx --yes vercel --version` 可运行，版本为 `53.2.0`。
- `npx --yes vercel whoami` 显示当前会话没有 Vercel 凭据，并且登录流程因非 ASCII 请求头报错。
- 再次检查 `vercel whoami` 和 `vercel.cmd whoami`，结果仍是没有现有凭据。
- 已发现 Vercel auth 文件存在于 `AppData\Roaming\com.vercel.cli\Data\auth.json`，但文件大小只有 3 bytes，内容为空对象，说明登录没有真正保存 token。
- 未发现 `VERCEL_TOKEN` 环境变量。
- 按安全要求，没有强行全局安装工具，也没有要求用户把 token 或真实环境变量发到聊天中。

GitHub 推送说明：

- 首次普通 `git push` 因本机 `127.0.0.1` 代理无法连接 GitHub 失败。
- 已使用临时禁用 Git 代理的单次命令完成推送，没有修改全局 Git 代理配置。
- 本地状态显示 `main` 已跟踪 `origin/main`。

## 用户继续操作

### 1. 安装并登录 Vercel CLI

如果希望继续让我自动部署，请先在终端运行：

```bash
npm i -g vercel
vercel login
```

登录完成后，确认下面命令在普通 PowerShell 里可以成功输出账号名：

```bash
vercel --version
vercel whoami
```

如果 `vercel` 仍提示找不到命令，请确认 `C:\Users\wangs\AppData\Roaming\npm` 已加入 PATH，或直接运行：

```bash
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd --version
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd whoami
```

确认成功后，回到本项目目录，再让我继续。

### 2. 在 Vercel 导入 GitHub 项目

也可以不用 CLI，直接在 Vercel 网页操作：

1. 打开 Vercel Dashboard。
2. 点 `Add New...` 或 `New Project`。
3. 选择刚才的 GitHub 私有仓库。
4. Framework Preset 选择 `Vite`。
5. Build Command 填 `npm run build`。
6. Output Directory 填 `dist`。
7. 在 `Environment Variables` 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_AMAP_KEY`
   - `VITE_AMAP_SECURITY_CODE`
   - `VITE_KIMI_CLASSIFY_ENDPOINT`，可选
8. 点 `Deploy`。

## 部署后测试步骤

1. 打开后台：`https://你的部署域名/`。
2. 点击 `Supabase诊断`。
3. 点击 `开始诊断`，确认环境变量、4 张表、RLS、Storage 都通过。
4. 点击 `写入演示数据`。
5. 选择 `李师傅 / 粤A·工002`。
6. 勾选点位。
7. 点击 `发送已选点位到师傅移动端`。
8. 手机打开：`https://你的部署域名/worker?worker=li`。
9. 点击 `高德导航`。
10. 上传一张现场照片。
11. 回后台刷新。
12. 确认点位状态变为 `已完成`，照片/视频数量增加。

## 真实派单链路修复结果

更新时间：2026-05-07。

当前状态：

- 已修复后台派单按钮：`VITE_DATA_MODE=proxy` 时会调用 `POST /api/dispatch`，不再跳转到 Canvas 本地 mobile 模拟页。
- `/api/dispatch` 已返回详细 `stage`、`message`、`details`，并把 `dispatch_tasks.status` 与 `wall_points.status` 写为“施工中”。
- `/api/worker-tasks?worker=li` 已兼容 `id`、`code`、`worker_key`、`slug`、`phone`、姓名和车牌尾号查询，手机端可读取真实派单任务。
- 后台派单模块下方已有“派单调试信息”，线上失败时可直接截图给开发定位。
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。

上线动作：

- 本次代码推送到 GitHub 后，需要在 Vercel 对当前项目执行 Redeploy，生产环境才会使用新的 `/api/dispatch` 和前端按钮逻辑。
- 如果 Redeploy 后仍失败，请进入 Vercel `Functions -> Logs`，筛选 `/api/dispatch`，查看 `stage/message/details`。
- 不需要把任何真实密钥发到聊天里；只需要确认 Vercel Environment Variables 已配置 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`。

## dispatch workers 查询兜底修复

更新时间：2026-05-07。

当前状态：

- `/api/dispatch` 已和 `/api/diagnose` 使用同一套 `_shared.getSupabaseAdmin()` 服务端 Supabase 客户端。
- `find_worker` 查询失败时，如果 payload 有 `worker_id`，会继续用该 `worker_id` 写入 `dispatch_tasks`，不会直接中断派单。
- 新增 `/api/debug-dispatch`，用于线上查看服务端变量是否存在、Supabase host、`workers`、`dispatch_tasks`、`wall_points` 是否可读及字段列表。
- `npm run build`：通过。
- `npm run test:e2e`：通过，12 passed。
- `npm run test:supabase`：本机网络失败，未打印真实 key。

Redeploy 后建议访问：

```text
https://你的部署域名/api/debug-dispatch
```

确认 debug 通过后，再回后台执行派单测试。

## API 路由排除 SPA rewrite

更新时间：2026-05-07。

当前状态：

- `vercel.json` 已改为 `/((?!api/.*).*) -> /index.html`，所有 `/api/*` 会保留给 Vercel Serverless Functions。
- 已新增 `/api/debug-network`，用于确认服务端环境变量存在性和 Supabase REST 网络可达性，不返回任何真实 key。
- `/api/debug-dispatch`、`/api/dispatch`、`/api/worker-tasks` 不会再被 SPA rewrite 接管。
- `/worker?worker=li` 仍会回到 `/index.html`，继续打开前端移动端。
- `npm run build`：通过。
- `npm run test:e2e`：通过，14 passed。

Redeploy 后请优先检查：

```text
https://你的部署域名/api/debug-network
https://你的部署域名/api/debug-dispatch
https://你的部署域名/worker?worker=li
```

## 国内接口版结果

更新时间：2026-05-07。

当前状态：

- 主线已改为国内接口版，不再要求 Supabase 环境变量。
- 前端支持 `local`、`mock-server`、`production-api` 三种数据模式。
- 已新增 Express Mock Server：`server/index.js`。
- 数据文件：`server/data/db.json`。
- 上传目录：`server/uploads/`。
- 部署文档：`DOMESTIC_API_DEPLOY.md`。
- `npm run build`：通过。
- `npm run test:api`：通过。
- `npm run test:e2e`：通过，10 passed。

本地局域网测试：

```bash
node server/index.js --host 0.0.0.0
npm run dev -- --host 0.0.0.0
```

`.env.local`：

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=http://电脑局域网IP:8787
```

手机端：

```text
http://电脑局域网IP:5173/worker/w1
http://电脑局域网IP:5173/worker/w2
```
