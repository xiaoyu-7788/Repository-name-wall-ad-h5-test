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
node -e "require all api/*.js"
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

## 12. GitHub 推送与 Vercel CLI 检查

更新时间：2026-05-07。

执行过的命令：

```bash
git ls-files --error-unmatch .env
git remote add origin https://github.com/xiaoyu-7788/Repository-name-wall-ad-h5-test.git
git branch -M main
git push -u origin main
git -c http.proxy= -c https.proxy= push -u origin main
git status -sb --ignored
git branch -vv
vercel --version
```

结果：

- `.env` 未被 Git 跟踪。
- 已添加远程仓库 `origin`。
- 当前分支已切换为 `main`。
- 首次 `git push` 因本机 `127.0.0.1` 代理无法连接 GitHub 失败。
- 随后使用单次临时禁用 Git 代理的 push 命令完成推送，未修改全局 Git 配置。
- 本地 Git 状态显示 `main` 正在跟踪 `origin/main`。
- `vercel --version` 失败：当前机器未安装 Vercel CLI。

下一步人工动作：

```bash
npm i -g vercel
vercel login
```

登录完成后可继续执行：

```bash
vercel link
vercel build
```

如果 Vercel 项目尚未配置环境变量，请进入 Vercel 项目 `Settings -> Environment Variables` 添加：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AMAP_KEY`
- `VITE_AMAP_SECURITY_CODE`
- `VITE_KIMI_CLASSIFY_ENDPOINT`，可选

不要把真实变量值写入仓库或聊天。

## 13. Vercel CLI 登录阻塞复查

更新时间：2026-05-07。

执行过的命令：

```bash
vercel --version
npm list -g vercel --depth=0
npx --yes vercel --version
npx --yes vercel whoami
npm install
npm run build
npm run test:e2e
```

结果：

- `vercel --version`：失败，当前 PowerShell 找不到全局 `vercel` 命令。
- `npm list -g vercel --depth=0`：未发现全局安装的 `vercel`。
- `npx --yes vercel --version`：通过，临时 CLI 版本为 `53.2.0`。
- `npx --yes vercel whoami`：失败，当前会话没有 Vercel 登录凭据；CLI 进入登录流程后因非 ASCII 请求头报错。
- 已给 `package.json` 添加 ASCII 项目名 `wall-ad-h5-test` 和 `private: true`，避免工具链从目录或系统名称推断项目名。
- 修改后重新运行 `npm install`：通过。
- 修改后重新运行 `npm run build`：通过。
- 修改后重新运行 `npm run test:e2e`：通过，8 passed。

Vercel 部署状态：

- `vercel link`：未执行，原因是 CLI 未登录。
- Vercel 环境变量检查：未执行，原因是 CLI 未登录且项目未 link。
- `vercel build`：未执行，原因是 CLI 未登录且项目未 link。
- `vercel deploy`：未执行，原因是 CLI 未登录且项目未 link。
- Preview URL：无。
- Production URL：无。

需要人工处理：

1. 在普通 PowerShell 中执行：

```bash
npm i -g vercel
vercel login
vercel whoami
```

2. 如果 `vercel` 找不到命令，确认 `C:\Users\wangs\AppData\Roaming\npm` 已加入 PATH，或直接运行：

```bash
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd login
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd whoami
```

3. `vercel whoami` 能正常显示账号后，再继续自动部署。

## 14. Vercel 登录状态再次检查

更新时间：2026-05-07。

执行过的命令：

```bash
vercel whoami
C:\Users\wangs\AppData\Roaming\npm\vercel.cmd whoami
vercel --version
```

结果：

- 当前 PowerShell 可以找到 Vercel CLI。
- `vercel --version`：可用，版本为 `53.2.0`。
- `vercel whoami`：失败，提示没有现有凭据并尝试进入登录流程。
- `vercel.cmd whoami`：同样失败。
- 检测到 Vercel auth 文件存在，但大小只有 3 bytes，实际没有保存登录 token。
- `VERCEL_TOKEN` 环境变量不存在。
- 由于 CLI 未登录，未执行 `vercel link`、`vercel build`、`vercel deploy`、`vercel deploy --prod`。

当前阻塞：

- 这是 Vercel 账号登录/授权问题，需要人工在本机 CLI 中完成。
- 不要把 Vercel token 或任何真实环境变量发到聊天里。

## 15. Vercel API 代理模式改造

更新时间：2026-05-07。

修改文件：

- `.env.example`
- `README.md`
- `DEPLOY_CHECKLIST.md`
- `DEPLOY_RESULT.md`
- `TEST_REPORT.md`
- `vercel.json`
- `src/App.jsx`
- `src/supabaseClient.js`
- `tests/e2e/app.spec.js`

新增文件：

- `src/apiClient.js`
- `api/_shared.js`
- `api/diagnose.js`
- `api/seed-demo.js`
- `api/points.js`
- `api/workers.js`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/upload.js`
- `api/photos.js`

改造结果：

- 保留本地演示模式。
- 保留前端 Supabase 直连备用模式。
- 新增 `VITE_DATA_MODE=proxy` 代理模式，并作为线上推荐模式。
- 前端代理模式下优先请求本站 `/api/*`。
- Vercel Serverless Function 使用 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 访问 Supabase。
- `SUPABASE_SERVICE_ROLE_KEY` 没有写入前端代码、文档真实值或报告真实值。
- 后台 Supabase 诊断已拆成两组：前端直连 Supabase、Vercel API 代理。
- 如果前端直连失败但代理成功，页面会提示“浏览器无法直连 Supabase，但 Vercel 代理连接成功，系统可正常使用。”

新增 API：

- `GET /api/diagnose`：检查服务端环境变量、4 张表、`point-media` bucket。
- `POST /api/seed-demo`：写入或重置演示 workers 和 wall_points。
- `GET /api/points`：返回 points、tasks、photos、workers 状态。
- `POST /api/points`：新增或更新点位。
- `PATCH /api/points`：更新点位或批量改项目名。
- `GET /api/workers`：返回 workers 列表。
- `POST /api/dispatch`：写入 dispatch_tasks，并把点位状态更新为“施工中”。
- `GET /api/worker-tasks`：按 worker code/id 返回师傅任务。
- `POST /api/upload`：支持 base64 JSON 上传，写 Storage、point_photos，并把点位和派单状态更新为“已完成”。
- `PATCH /api/photos`：更新照片分类。

执行过的命令：

```bash
npm install
npm run build
npm run test:e2e
```

测试结果：

- `npm install`：通过；npm 仍提示 1 个 high severity audit 项，建议后续单独评估。
- `npm run build`：通过。
- `npm run test:e2e`：通过，9 passed。
- API 文件加载检查：通过，`api/_shared.js`、`api/diagnose.js`、`api/seed-demo.js`、`api/points.js`、`api/workers.js`、`api/dispatch.js`、`api/worker-tasks.js`、`api/upload.js`、`api/photos.js` 均可被 Node 正常加载。

新增测试覆盖：

- `/api/diagnose` 未配置服务端变量时不崩溃。
- 本地演示模式仍可派单、显示移动端任务、上传后自动完成。
- Supabase 诊断页面显示前端直连和 Vercel API 代理两组状态。

Vercel 需要新增或确认的变量：

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

`SUPABASE_SERVICE_ROLE_KEY` 在 Supabase Project Settings -> API 中查看，只允许填到 Vercel Environment Variables，只允许 Serverless API 读取。

## 16. 真实派单链路专项修复

更新时间：2026-05-07。

修改文件列表：

- `src/App.jsx`
- `src/apiClient.js`
- `src/styles.css`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/upload.js`
- `api/_shared.js`
- `supabase/schema.sql`
- `tests/e2e/app.spec.js`
- `README.md`
- `TEST_REPORT.md`
- `DEPLOY_RESULT.md`

修复内容：

- 已确认 `src/App.jsx` 不再包含 `setWorkerPointTasks`、`setActiveMobileWorkerId`、`setAppView("mobile")` 本地 Canvas 跳转派单逻辑。
- 后台“发送已选点位到师傅移动端”在 `VITE_DATA_MODE=proxy` 时会调用 `dispatchPointsApi(requestPayload)`，并请求 `POST /api/dispatch`。
- 前端派单 payload 统一为 `worker_id`、`worker_key`、`worker_name`、`worker_phone`、`point_ids`。
- 派单成功后刷新后台数据，显示“已成功发送 X 个点位给 XX师傅”，并保留“打开该师傅移动端”链接。
- 派单失败时页面显示“派单调试信息”，包含 `/api/dispatch`、payload、HTTP status、response、stage、message、details。
- `/api/dispatch` 已支持查找 worker、清理重复任务、写入 `dispatch_tasks.status = 施工中`、更新 `wall_points.status = 施工中`，失败时返回明确 `stage/message/details`。
- `/api/worker-tasks?worker=li` 已兼容 `id`、`code`、`worker_key`、`slug`、`phone`、姓名包含“李”、车牌包含“工002”等查询方式。

本轮执行过的命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- 新增测试覆盖 `/api/dispatch` 写入“施工中”任务、更新点位状态，以及前端源码不再包含 Canvas 本地跳转派单关键字。

线上排查建议：

- 如果 Vercel 重新部署后仍派单失败，请进入 Vercel 项目 `Functions -> Logs`，筛选 `/api/dispatch`。
- 对照后台“派单调试信息”中的 payload、HTTP status、stage、message、details 排查 Supabase 表字段、数据或权限问题。
- 本轮没有打印、提交或写入 `.env` 真实密钥。
