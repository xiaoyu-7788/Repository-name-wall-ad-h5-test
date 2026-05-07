# TEST_REPORT

## 1. 运行过的命令

```bash
npm install
npm run build
npm install -D @playwright/test
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:supabase
vercel --version
npm install
npm run build
npm run test:e2e
```

环境检查：

- 已读取 `.env.example`，确认包含：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_AMAP_KEY`
  - `VITE_AMAP_SECURITY_CODE`
  - `VITE_KIMI_CLASSIFY_ENDPOINT`
- 当前已检测到项目根目录存在 `.env`。
- 未读取、打印或写入任何真实 API Key。

## 2. 通过的测试项

`npm run test:e2e` 结果：8 passed。

说明：常规 E2E 通过 `VITE_FORCE_LOCAL_DEMO=true` 固定为本地演示模式，避免 `.env` 存在时被当前 Supabase 网络问题拖住。真实 Supabase 联调由 `npm run test:supabase` 单独执行。

- 测试 1：后台首页可打开
- 测试 2：本地演示数据可用
- 测试 3：后台筛选和勾选
- 测试 4：后台派单给李师傅
- 测试 5：李师傅移动端可读取任务
- 测试 6：移动端上传照片后自动完成
- 测试 7：上下点位切换
- 测试 8：Supabase 诊断

`npm run build` 结果：通过。

## 3. 失败的测试项

本地模式最终没有失败项。

真实 Supabase 联调未完成：

- `.env` 文件存在。
- `VITE_SUPABASE_URL` 存在。
- `VITE_SUPABASE_ANON_KEY` 存在。
- `VITE_SUPABASE_URL` 格式检查通过。
- `npm run test:supabase` 在首次 Supabase REST 网络请求处失败：当前机器无法访问 Supabase REST/Storage endpoint。
- 额外脱敏探测结果：PowerShell HTTP 和 Chromium browser fetch 也无法访问 Supabase REST endpoint。
- 因网络/TLS/代理层失败，未能继续执行表读写、Storage 上传、后台真实派单、移动端真实上传和数据库状态核验。
- 未打印真实 URL、anon key 或任何 `.env` 密钥。
- 测试数据写入发生在网络请求之后；本次失败发生在写入之前，未创建业务测试数据。

中间调试时出现过 Playwright strict mode 定位冲突，原因是测试选择器过宽，例如同一个点位编号同时出现在标题、K码和详情里。已收窄到具体区域或具体角色后通过。

## 4. 修复过的问题

- 增加 Playwright 自动化测试能力：
  - `npm run test:e2e`
  - `playwright.config.js`
  - `tests/e2e/app.spec.js`
- 增加测试自动生成临时图片 `tests/fixtures/test-wall.jpg` 的逻辑，用于上传流程。
- 后台补充稳定验收文案和控件标签：
  - 显示“全国墙体广告执行派单系统”
  - 师傅下拉框增加“师傅选择”
  - 派单按钮显示“发送已选点位到师傅移动端”
- Supabase 未配置时，诊断结果也会列出 `workers`、`wall_points`、`dispatch_tasks`、`point_photos` 和 `point-media`，并标记为未配置。
- 增加 `.gitignore`，避免提交 `.env`、测试报告输出、测试结果和依赖目录。
- 增加真实 Supabase 联调脚本：
  - `npm run test:supabase`
  - `scripts/supabase-real-test.mjs`
  - 该脚本只输出变量是否存在和步骤状态，不输出密钥。
- 常规 Playwright 配置使用独立端口 `5187`，并强制本地演示模式，避免复用已有 dev server。

## 5. 仍需人工配置的问题

- 当前 `.env` 已存在且必需变量存在，但当前机器无法访问 Supabase REST/Storage endpoint。
- 请检查本机网络、代理、TLS、公司防火墙、Supabase 项目 URL 是否可访问。
- 如需真实联调，请确认：
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_AMAP_KEY`
  - `VITE_AMAP_SECURITY_CODE`
  - `VITE_KIMI_CLASSIFY_ENDPOINT`，可选
- 运行 `supabase/schema.sql`，创建表、RLS 测试策略和 `point-media` bucket。
- `npm install` 报告 1 个 high severity vulnerability，需要后续用 `npm audit` 评估；本次没有擅自替换业务依赖，避免破坏现有功能。

## 6. 如何本地运行测试

```bash
npm install
npx playwright install chromium
npm run build
npm run test:e2e
```

真实 Supabase 联调命令：

```bash
npm run test:supabase
```

该命令会使用 `.env`，但不会打印密钥。测试数据使用 `test_` 前缀，成功运行后会自动清理。

本地测试默认使用 Vite dev server。Playwright 会自动启动：

```bash
npm run dev -- --host 127.0.0.1
```

如果 5173 端口已有服务，Playwright 会复用现有服务。

## 7. 如何部署到 Vercel 后测试真实手机端

1. 在 Vercel 项目环境变量中配置 Supabase 和高德变量。
2. 在 Supabase SQL Editor 运行 `supabase/schema.sql`。
3. 部署成功后打开后台：

```text
https://你的域名.vercel.app/
```

4. 进入“Supabase诊断”，点击“开始诊断”，确认环境变量、表读写、RLS 和 `point-media` Storage 检测通过。
5. 在后台点击“写入演示数据”或导入真实点位。
6. 选择点位和师傅，点击“发送已选点位到师傅移动端”。
7. 用真实手机打开师傅端：

```text
https://你的域名.vercel.app/worker?worker=zhang
https://你的域名.vercel.app/worker?worker=li
```

8. 手机端检查点位、地址、K码、项目、高德查看、高德导航。
9. 上传照片或视频。
10. 回到后台刷新，确认点位状态为“已完成”，照片/视频数量增加。

## 8. 真实 Supabase 联调说明

本轮已尝试真实 Supabase 联调，但阻塞在网络访问层。

执行结果：

- `.env` 存在，`VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 存在。
- URL 格式检查通过。
- Supabase SDK 请求失败：网络失败。
- PowerShell HTTP 探测失败。
- Chromium fetch 探测失败。
- 未写入 `test_` 测试 worker、point、dispatch task、photo。
- 未上传 Storage 文件。

网络恢复后重新运行：

```bash
npm run test:supabase
```

脚本会自动执行：

- 检查 4 张表可读。
- 写入 `test_` worker 和 point。
- 检查 `point-media` bucket 可上传。
- 通过后台 UI 派单给测试 worker。
- 打开 `/worker?worker=test_xxx`。
- 上传测试图片。
- 检查 `dispatch_tasks`、`point_photos`、`wall_points.status = 已完成`、Storage 文件。
- 自动清理 `test_` 数据和测试 Storage 文件。

## 9. Vercel 部署准备

本轮已完成 Vercel 真实手机测试版部署前准备：

- `package.json` 已确认包含 `dev`、`build`、`test:e2e`、`test:supabase`。
- Vite 未配置自定义 `outDir`，生产构建输出目录为默认 `dist`。
- 已新增 `vercel.json`，配置 SPA rewrite，避免 `/worker?worker=li` 等前端路由刷新后 404。
- `.gitignore` 已确认忽略 `.env`、`.env.local`、`.env.*.local`、`node_modules/`、`dist/`、`playwright-report/`、`test-results/`。
- `.env.example` 只保留变量名和空值，没有真实 key。
- `README.md` 已新增《部署到 Vercel 真实手机测试》教程，包含 GitHub 私有仓库、Vercel New Project、Vite、Build Command、Output Directory、环境变量和真实手机端测试流程。
- 已新增 `DEPLOY_CHECKLIST.md`，覆盖 Supabase active 状态、4 张表、`point-media` bucket、RLS/Storage policy、Vercel 环境变量、后台诊断和手机端上传验收。
- 后台已保留明显的“Supabase诊断”入口，诊断覆盖环境变量、URL 格式、4 张表、`point-media` bucket，并区分未配置、URL 错误、网络失败、表不存在、RLS 权限和 bucket 不存在。

Vercel CLI 检查结果：

- 已执行 `vercel --version`。
- 当前机器未安装 Vercel CLI，所以没有执行 `vercel pull` 或 `vercel build`。
- 未按要求强行安装全局工具；README 已写明需要时手动执行 `npm i -g vercel`、`vercel login`、`vercel pull`、`vercel build`。

本轮部署前验证结果：

- `npm install`：通过；npm 仍提示 1 个 high severity audit 项，需要后续人工评估依赖升级风险。
- `npm run build`：通过。
- `npm run test:e2e`：通过，8 passed。

真实 Supabase 联调建议：

- 本机此前 `npm run test:supabase` 失败点在网络访问 Supabase REST/Storage endpoint，不是前端派单逻辑失败。
- 建议部署到 Vercel 公网 HTTPS 后，在 Vercel 环境变量中配置真实 Supabase 和高德变量，再通过后台“Supabase诊断”和真实手机 `/worker?worker=li` 上传流程继续验证。

## 10. Vercel 部署前最终检查

检查时间：2026-05-07。

部署前配置检查：通过。

- `vercel.json` 存在，并配置了 SPA rewrite：`/(.*)` -> `/`，可避免 `/worker?worker=li` 刷新后 404。
- `.gitignore` 已包含 `.env`、`.env.local`、`.env.*.local`、`node_modules/`、`dist/`、`playwright-report/`、`test-results/`。
- `.env.example` 只包含 5 个空值变量名，没有真实 key。
- `README.md` 已写清楚 GitHub 上传方法、Vercel New Project、Framework Vite、Build Command `npm run build`、Output Directory `dist`、Vercel 环境变量、部署后后台和师傅移动端访问地址。
- `DEPLOY_CHECKLIST.md` 已包含 Supabase 表、`point-media` bucket、RLS 测试策略、Vercel 环境变量、部署后 Supabase 诊断、手机端派单测试。

本轮运行命令：

```bash
npm install
npm run build
npm run test:e2e
```

运行结果：

- `npm install`：通过；npm 仍提示 1 个 high severity audit 项，建议后续单独评估依赖升级。
- `npm run build`：通过。
- `npm run test:e2e`：通过，8 passed。

需要人工完成的下一步：

1. 在 GitHub 创建私有仓库并上传当前项目代码，确认不要上传 `.env`。
2. 在 Vercel 导入该 GitHub 仓库，Framework 选择 Vite。
3. Vercel Build Command 填 `npm run build`，Output Directory 填 `dist`。
4. 在 Vercel Settings -> Environment Variables 添加真实的 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、`VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE`，如启用 Kimi 再添加 `VITE_KIMI_CLASSIFY_ENDPOINT`。
5. 部署后打开后台，点击“Supabase诊断”，确认环境变量、表、RLS 和 Storage 通过。
6. 用真实手机访问 `/worker?worker=li`，完成派单和上传照片/视频测试，确认后台点位状态变为“已完成”。

## 11. 自动推进到真实测试版结果

更新时间：2026-05-07。

修改文件列表：

- `.gitignore`
- `.env.example`
- `README.md`
- `DEPLOY_CHECKLIST.md`
- `TEST_REPORT.md`
- `vercel.json`

新增文件列表：

- `AGENTS.md`
- `DEPLOY_RESULT.md`

执行过的命令：

```bash
npm install
npm run build
npm run test:e2e
npm run test:supabase
git init
git check-ignore -v .env .env.local dist node_modules playwright-report test-results
git add .
git commit -m "chore: prepare h5 app for vercel deployment"
git remote -v
vercel --version
```

本地验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，8 passed。
- `npm run test:supabase`：失败；原因是当前机器无法访问 Supabase REST/Storage endpoint，属于本地网络、代理、TLS 或 Supabase endpoint 可访问性问题。脚本在写入 `test_` 数据前失败，未创建测试业务数据。

GitHub 状态：

- 本地 Git 仓库已初始化。
- 已提交 commit：`chore: prepare h5 app for vercel deployment`。
- `.env` 已确认被 `.gitignore` 忽略，没有进入提交。
- 当前没有远程 `origin`，因此未能 push 到 GitHub。

Vercel 状态：

- `vercel --version`：失败，当前机器未安装 Vercel CLI。
- `vercel build`：未执行，原因是 Vercel CLI 不存在。
- `vercel deploy`：未执行，原因是 Vercel CLI 不存在且项目未 link。
- Preview URL：无。
- Production URL：无。

仍需人工处理的问题：

- 在 GitHub 创建私有仓库，并把本地仓库 push 上去。
- 安装并登录 Vercel CLI，或在 Vercel 网页导入 GitHub 仓库。
- 在 Vercel 项目 Settings -> Environment Variables 中配置真实环境变量。不要把真实值发到聊天里，也不要写入仓库。
- 本地 Supabase 网络失败，建议部署到 Vercel 公网 HTTPS 后，通过后台 Supabase 诊断和真实手机上传流程继续验证。
- `npm install` 仍提示 1 个 high severity audit 项，建议后续单独评估依赖升级风险。

下一步操作：

1. GitHub 创建 Private repository，建议仓库名 `wall-ad-h5-test`。
2. 本地执行：

```bash
git remote add origin 你的GitHub仓库地址
git branch -M main
git push -u origin main
```

3. Vercel 网页点 `New Project`，导入该 GitHub 仓库。
4. Framework 选 `Vite`，Build Command 填 `npm run build`，Output Directory 填 `dist`。
5. 添加 Vercel 环境变量后部署。
6. 部署后访问后台和 `/worker?worker=li` 做真实手机测试。
