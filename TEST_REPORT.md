## 39. Vercel API health 线上 404 二次修复

更新时间：2026-05-12。

本次只处理线上 `https://repository-name-wall-ad-h5-test.vercel.app/api/health` 返回 `404 NOT_FOUND` 的 Vercel 路由识别问题。

修复内容：
- 确认 `api/health.js` 位于项目根目录，与 `src/`、`package.json` 同级。
- 将 `api/health.js` 改为 Vercel 官方兼容的 `export default function handler(req, res)` 写法，返回 `ok`、`message` 和当前时间。
- 将 `vercel.json` 从负向正则 `rewrites` 改为 `routes`：先把 `/api/(.*)` 交给 `/api/$1`，再 `handle: filesystem`，最后才将前端页面 fallback 到 `/index.html`。
- 这样可以避免 `/api/*` 被 SPA fallback 或不稳定正则规则影响。

验证命令：
```bash
npm run build
```

验证结果：
- `npm run build` 通过。
- 构建仍有 chunk 体积 warning，不影响部署。

线上部署后复查地址：
```text
https://repository-name-wall-ad-h5-test.vercel.app/api/health
```

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

线上 `/admin/points` 实测结果：

- 初始进入页面时：
  - `pointTableWrap = 1`
  - `modal-card = 0`
  - `drawer-panel = 0`
  - 说明默认是全宽列表，没有右侧旧 Drawer。
- 点击首行 `查看详情` 后：
  - `modal-card = 1`
  - `drawer-panel = 0`
  - `pointTableWrap = 1`
  - 说明详情已改为居中 Modal，底层列表宽度没有变化。
- 关闭详情后：
  - `modal-card = 0`
  - `drawer-panel = 0`
  - `pointTableWrap = 1`
  - 说明关闭后仍回到完整全宽列表，没有残留右侧半屏结构。
- 同时确认：
  - 操作列仍是 `查看详情 / 编辑 / 更多`
  - 地址第二行仍显示 `K码：...`
  - 线上不存在旧版 `Point Management`
  - `/api/wall-points` 返回 `ok: true`，`dataCount: 3`

## 45. `/admin/points` 完整新版点位管理中心替换

更新时间：2026-05-12。

本次继续修复 `/admin/points`，目标是把半新版页面替换为完整新版点位管理中心，并修正地址 / K码显示错误。

实际入口确认：

- `/admin/points` 真实路由仍在 `src/App.jsx`，实际渲染组件仍然只有 `src/pages/PointsPage.jsx`。
- `src/components/points/PointFilters.jsx` 当前未再被 `/admin/points` 引用。
- 当前点位页只组合使用 `PointsPage` + `PointsTable` + `PointDetailDrawer`，不存在第二个 `PointManagement` 页面与之并行渲染。

本次新增或调整：

- 在 `src/lib/domain.js` 中统一新增点位展示字段映射：
  - `getPointKCode()`
  - `getProjectName(point, projects)`
  - `getPointDisplayModel()`
- `PointsPage` 恢复完整新版筛选工具栏：
  - 搜索点位编号 / 地址 / 项目 / 师傅
  - 项目筛选
  - 状态筛选
  - 异常筛选
  - 师傅筛选
  - 标签筛选
  - 时间筛选
  - 批量打标签
  - 批量移除标签
  - 导入模板
- `PointsTable` 调整为最终表头：
  - 选择框
  - 点位编号
  - 项目 / 标签
  - 地址 / K码
  - 师傅 / 队伍
  - 状态
  - 素材情况
  - 最近更新
  - 操作
- 地址列下方统一显示 `K码：xxx`，不再重复显示点位编号。
- `PointDetailDrawer` 改为使用统一字段映射，抽屉里的 K码 不再从点位编号兜底。
- `api/wall-points.js` 修复旧兜底逻辑：保存点位时，`k_code` 为空不再自动写入 `title`。
- `legacyModals.jsx` 中批量导入预处理同步修复，避免批量导入时把点位编号写成 K码。

本次修改文件：

- `src/pages/PointsPage.jsx`
- `src/components/points/PointsTable.jsx`
- `src/components/points/PointDetailDrawer.jsx`
- `src/components/shared/legacyModals.jsx`
- `src/lib/domain.js`
- `src/styles.css`
- `api/wall-points.js`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

自检结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- E2E 已新增断言：
  - 表格表头显示 `地址 / K码`
  - 现有演示点位显示 `K码：K-GZ-BY-001`
  - 新增一个未填写 K码 的点位后，表格显示 `未登记地址` 和 `K码：未登记`
- 线上 `https://repository-name-wall-ad-h5-test.vercel.app/admin/points` 已人工复核：
  - 顶部显示 `管理后台 / Point Center` 和 `点位管理`
  - 筛选栏显示搜索点位编号 / 地址 / 项目 / 师傅、全部师傅、全部时间
  - 表头显示 `地址 / K码`
  - 页面已不再显示 `执行台账中心` 或旧版 `Point Management`
  - 详情抽屉中 `K码` 字段显示为 `未登记`，未再重复点位编号

## 46. `/admin/points` 操作列与表格宽度收口

更新时间：2026-05-12。

本次只继续修复 `/admin/points` 的点位列表操作区和表格宽度，不改 API、Supabase 数据读写和字段名。

修改文件：

- `src/components/points/PointsTable.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

旧按钮组替换位置：

- 旧的行内按钮组原来在 `src/components/points/PointsTable.jsx` 的 `rowActions` 内直接渲染：
  - 查看
  - 编辑
  - 现场查看
  - 派单
  - 素材
  - 验收
  - 删除
- 现已替换为新版结构：
  - 主按钮：`查看详情`
  - 次按钮：`编辑`
  - 菜单按钮：`更多`
- `更多` 菜单中保留：
  - `现场查看`
  - `派单`
  - `素材`
  - `验收`
  - `删除`
- `删除` 仅保留在菜单内，并继续使用危险样式。

本次样式收口：

- `pointTableWrap` 改为全宽显示。
- `pointTable` 改为 `width: 100%`，不再维持旧按钮组撑开的宽度。
- `更多` 菜单改为绝对定位下拉，不再把表格行撑高。
- 列表常态保持全宽；详情仍通过 Drawer 打开，不会把表格常态挤成半屏。

验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。

线上 `/admin/points` 实际验证项：

- 行内操作区只显示：`查看详情`、`编辑`、`更多`
- `更多` 菜单中才显示：`现场查看`、`派单`、`素材`、`验收`、`删除`
- 地址列第二行继续显示 `K码：...`
- 页面保持全宽表格显示
- `/api/wall-points` 继续返回真实数据

线上实际复核结果：

- 生产地址：`https://repository-name-wall-ad-h5-test.vercel.app/admin/points`
- 常态页面可见：
  - `查看详情` 3 个
  - `编辑` 3 个
  - `更多` 3 个
  - `删除` 0 个
- 打开首行 `更多` 菜单后可见：
  - `现场查看` 1 个
  - `派单` 1 个
  - `素材` 1 个
  - `验收` 1 个
  - `删除` 1 个
- 打开 `更多` 菜单时页面常态无右侧常驻抽屉，`drawer-panel` 数量为 `0`，列表保持全宽。
- `Invoke-WebRequest https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points` 返回：
  - `ok: true`
  - `dataCount: 3`
  - 说明仍在读取真实线上数据。

## 47. `/admin/points` 详情打开方式改为居中 Modal

更新时间：2026-05-12。

本次只继续修复 `/admin/points` 的详情打开方式和布局，不改 API，不改 Supabase，不改 `/api/wall-points` 的真实数据逻辑。

删除/替换的旧 Drawer：

- 被替换的旧详情容器：`src/components/points/PointDetailDrawer.jsx`
- 旧实现依赖：`src/components/shared/Drawer.jsx`
- 旧布局特征：
  - `drawer-layer`
  - `drawer-scrim`
  - `drawer-panel`
  - 固定右侧抽屉宽度
  - 打开详情时出现右侧面板和整页遮罩

本次处理方式：

- `PointDetailDrawer.jsx` 不再使用 `Drawer`，改为使用居中的 `Modal`。
- `/admin/points` 打开详情后只弹出中心 `modal-card`，不会把列表改成左右两栏。
- 列表底层 `pointTableWrap` 在详情打开和关闭前后都保持可见和全宽。
- 本次没有删除全局 `drawer-panel` CSS，因为仓库其它模块仍在复用；但 `/admin/points` 这条真实路径已经完全不再使用这套 Drawer。

会导致半屏的旧 CSS 与现状：

- 旧 Drawer 相关 CSS 位于 `src/styles.css`：
  - `.drawer-layer`
  - `.drawer-scrim`
  - `.drawer-panel`
- 这些样式本身会形成固定右侧抽屉。
- 当前 points 页已不再命中这组类名；E2E 已新增断言，打开点位详情时 `.drawer-panel` 数量必须为 `0`。

验证命令：

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

## 17. dispatch workers 查询兜底修复

更新时间：2026-05-07。

修改文件：

- `api/_shared.js`
- `api/dispatch.js`
- `api/worker-tasks.js`
- `api/debug-dispatch.js`
- `src/App.jsx`
- `tests/e2e/app.spec.js`
- `README.md`
- `TEST_REPORT.md`
- `DEPLOY_RESULT.md`

修复内容：

- `/api/dispatch` 已改为和 `/api/diagnose` 一样复用 `_shared.getSupabaseAdmin()` 初始化 Supabase 服务端客户端。
- `/api/dispatch` 不使用 `VITE_SUPABASE_URL` 或 `VITE_SUPABASE_ANON_KEY`，只读取服务端 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY`。
- `find_worker` 阶段改为 `workers.select("*").limit(1000)`，避免因字段或排序差异导致查询失败。
- 如果 `workers` 查询失败但 payload 中有 `worker_id`，后端会用 payload 的 `worker_id` 继续派单，并在成功响应中返回 `worker_lookup_warning`。
- `dispatch_tasks` 写入支持多级降级：优先写 `id/worker_id/point_id/status/assigned_at/created_at`，字段不兼容时降级为最小字段。
- `wall_points` 状态更新支持 `updated_at` 不存在时自动降级，只更新 `status = 施工中`。
- 新增 `GET /api/debug-dispatch`，返回非敏感服务端环境状态、Supabase host、三张关键表的读取状态和字段名列表。
- 前端派单失败调试信息增加 `error_name` 和 `error_message`。

执行过的命令：

```bash
npm run build
npm run test:e2e
npm run test:supabase
```

结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，12 passed。
- `npm run test:supabase`：失败；原因仍是当前本机网络无法访问 Supabase REST/Storage endpoint。脚本仅显示变量存在/隐藏状态，没有打印真实 key。

线上验证建议：

- 推送并在 Vercel Redeploy 后，先访问 `/api/debug-dispatch`。
- 再在后台派单，若仍失败，查看后台“派单调试信息”和 Vercel `Functions -> Logs` 中 `/api/dispatch` 的 `stage/message/error_name/error_message/details`。

## 18. Vercel API 路由排除 SPA rewrite

更新时间：2026-05-07。

修改内容：

- `vercel.json` 已改为只把非 `/api/*` 的路径重写到 `/index.html`。
- 新增 `api/debug-network.js`，访问 `/api/debug-network` 时返回 JSON，不进入前端后台页面。
- 新增 E2E 防回归测试，确认 `vercel.json` 不会把 `/api` 路由交给 SPA。
- 新增 E2E handler 测试，确认 `/api/debug-network` 返回 JSON 结构。

最终 `vercel.json`：

```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

执行过的命令：

```bash
npm run build
npm run test:e2e
```

结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，14 passed。

## 19. 国内接口版改造

更新时间：2026-05-07。

当前主线已从 Supabase / Vercel API 代理切换为国内后端接口适配版。

新增文件：

- `server/index.js`
- `server/test-api.js`
- `server/data/db.json`
- `server/uploads/.gitkeep`
- `DOMESTIC_API_DEPLOY.md`

主要修改：

- `src/apiClient.js` 重写为统一数据访问层，支持 `local`、`mock-server`、`production-api`。
- `src/supabaseClient.js` 改为兼容环境变量出口，不再创建 Supabase client。
- `src/App.jsx` 默认显示“接口诊断”和国内 API 数据模式，不再提示用户配置 Supabase。
- `package.json` 新增 `dev:api`、`dev:all`、`test:api`。
- `.env.example` 改为国内接口变量：`VITE_DATA_MODE`、`VITE_API_BASE_URL`、高德变量、Kimi 后端代理变量。
- `README.md` 改为国内接口版说明。
- `tests/e2e/app.spec.js` 更新为国内接口诊断与本地演示流程。

Mock Server 接口覆盖：

- projects
- workers
- wall-points
- dispatch
- worker-tasks
- point-media
- complete-point
- track-logs
- import-demo / reset-demo

执行过的命令：

```bash
npm install express cors multer concurrently
npm uninstall @supabase/supabase-js
npm run build
npm run test:api
npm run test:e2e
```

结果：

- `npm run build`：通过。
- `npm run test:api`：通过。
- `npm run test:e2e`：通过，10 passed。

说明：

- 旧 `supabase/schema.sql` 和历史 Vercel API 文件仍保留作为参考，但当前前端主线不再调用 Supabase。
- `api/_shared.js` 已改为可选 Supabase SDK，不安装 Supabase SDK 时不会影响国内接口版构建和运行。

## 20. 师傅端手机收不到派单任务链路修复

更新时间：2026-05-08。

本次只聚焦师傅端 `/worker/:workerId` 读取派单任务链路，没有重做 UI，没有删除高德查看/高德导航入口。

根因：
- `WorkerPage` 之前在组件内直接拼 URL 并 `fetch` `/api/worker-tasks`，没有统一走 `src/apiClient.js`。
- `VITE_API_BASE_URL=http://localhost:8787` 这类配置在手机局域网访问时容易让手机请求自己的 `localhost`，导致后端明明有 `count=3`，页面却读不到任务。
- worker 页拿到接口数据后没有把 `taskPoints/count/实际请求 URL` 做成清晰调试状态，现场排查时容易误判为后端派单失败。

修改文件：
- `src/apiClient.js`
- `src/App.jsx`
- `TEST_REPORT.md`

关键修复：
- `getApiBaseUrl()` 统一为运行时判断：
  - `localhost` / `127.0.0.1` 前端访问时，请求 `http://localhost:8787`。
  - `192.168.*` / `10.*` / `172.16-31.*` 局域网访问时，请求同 hostname 的 `8787`。
  - 公网同域且未配置 `VITE_API_BASE_URL` 时，走相对 `/api`。
- 新增 `getApiRequestUrl(path)`，所有接口请求由 `apiClient` 统一生成 URL。
- 新增 `getWorker(workerId)`，并规范 `getWorkerTasks(workerId)` 返回 `taskPoints/count`。
- `WorkerPage` 已移除组件内直接 `fetch`，进入页面后调用 `getWorker(workerId)` 和 `getWorkerTasks(workerId)`。
- worker 页面渲染任务时使用 `payload.taskPoints`，不再用本地演示点位覆盖真实接口返回。
- worker 页面保留 3 秒轮询 `GET /api/worker-tasks?workerId=当前 workerId`。
- worker 页面调试区显示：当前 workerId、API_BASE_URL、实际请求 URL、最近请求时间、返回 count、`taskPoints.length`、错误信息。

本次执行命令：
```bash
npm run build
npm run test:e2e
```

执行结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，10 passed。

接口验证：
- `http://localhost:8787/api/health`：通过，返回国内 Mock Server 正常。
- `http://192.168.110.187:8787/api/health`：通过，返回国内 Mock Server 正常。
- `http://localhost:8787/api/worker-tasks?workerId=w1`：通过，返回 `count: 3`，`taskPoints.length: 3`。
- `http://192.168.110.187:8787/api/worker-tasks?workerId=w1`：通过，返回 `count: 3`，`taskPoints.length: 3`。

页面验证：
- 打开 `http://127.0.0.1:5174/worker/w1`：页面显示“已读取 3 个派单点位”，任务进度为 `1 / 3`，实际请求为 `http://localhost:8787/api/worker-tasks?workerId=w1`。
- 打开 `http://192.168.110.187:5174/worker/w1`：页面显示“已读取 3 个派单点位”，任务进度为 `1 / 3`，实际请求为 `http://192.168.110.187:8787/api/worker-tasks?workerId=w1`。
- 页面仍保留“高德查看”“高德导航”按钮。

电脑端测试步骤：
```bash
npm run dev:api
npm run dev -- --host 0.0.0.0 --port 5174
```

然后打开：
```text
http://localhost:5174/worker/w1
```

确认调试区显示：
```text
已读取 3 个派单点位
返回 count 3
taskPoints.length 3
实际请求 URL http://localhost:8787/api/worker-tasks?workerId=w1
```

手机端测试步骤：
1. 手机和电脑连接同一个 WiFi。
2. 电脑保持 `npm run dev:api` 和 Vite 前端同时运行。
3. 手机浏览器打开：
```text
http://192.168.110.187:5174/worker/w1
```
4. 确认调试区显示：
```text
实际请求 URL http://192.168.110.187:8787/api/worker-tasks?workerId=w1
已读取 3 个派单点位
返回 count 3
taskPoints.length 3
```

仍需人工处理：
- 本次未修改 `.env` / `.env.local`，也未提交任何真实密钥。
- 如果电脑后台派单仍未写入真实后端，请确认本地不是 `VITE_FORCE_LOCAL_DEMO=true` 测试模式；局域网真实联调建议使用 `VITE_DATA_MODE=mock-server` 或不设置强制本地演示变量。
- 真机上传照片后状态变更、高德导航在手机高德 App 中唤起，仍建议用真实手机再走一遍现场流程确认。

## 21. 师傅移动端任务页 UI 与交互优化

更新时间：2026-05-08。

本次只优化师傅移动端 `/worker/:workerId` 页面 UI 和交互；未修改后端接口，未修改 `server/index.js` 派单逻辑，未修改 `API_BASE_URL` 推断逻辑。

已确认前置状态：
- 手机端读取任务已经成功。
- `/worker/w1` 当前可读取 `count=3`，`taskPoints.length=3`。
- 局域网访问时实际请求仍为 `http://192.168.110.187:8787/api/worker-tasks?workerId=w1`。

修改文件：
- `src/App.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

本次 UI 修复：
- 调试信息已改为折叠面板，默认只显示一行状态：`已连接后台｜已读取 3 个派单点位｜无错误`。
- 默认调试详情不占用大屏幕；点击“展开调试信息”后才显示 workerId、API_BASE_URL、实际请求 URL、最近读取时间、count、`taskPoints.length` 和读取错误。
- “上一点位 / 下一点位”按钮已从 fixed 底部悬浮改为页面内容流中的按钮区，不再遮挡“确认队伍身份”按钮。
- 移动端页面顺序调整为：标题、状态条、队伍身份确认、任务进度、当前点位卡片、高德查看/导航、上传照片/上传视频、上一点位/下一点位。
- `workerId=w1` 有对应师傅信息时，姓名、手机号、车牌自动填入；仍需师傅点击“确认队伍身份”，点击后按钮显示“已确认身份”，输入框锁定。
- 任务卡片补充显示点位编号、地址、K码、房东、施工队长。
- 上传入口拆分为“上传照片”和“上传视频”两个明确按钮。
- 保留“高德查看”“高德导航”，并继续使用当前任务点位的 `lng/lat` 生成链接。

本次执行命令：
```bash
npm run build
npm run test:e2e
```

执行结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，10 passed。

页面复查结果：
- 打开 `http://192.168.110.187:5174/worker/w1`：默认状态条显示 `已连接后台｜已读取 3 个派单点位｜无错误`。
- 默认 `.mobile-debug-details` 未展开。
- 初始任务进度为 `1 / 3`，当前点位为 `GZ-BY-001`。
- 点击“下一点位”后，进度变为 `2 / 3`，当前点位变为 `FS-NH-002`。
- 第二个任务的高德导航链接包含 `113.14588,23.04712`，确认使用当前任务点位坐标。

仍需人工处理：
- 真机上建议再确认一次点击“高德导航”是否能唤起手机高德 App。
- 真机上传照片/视频后，建议回后台确认点位状态和媒体数量同步更新。

## 16. 后台高德地图执行台修复验收

更新时间：2026-05-08。

本次修改目标：
- 后台“高德地图执行台”优先加载真实高德 JS API v2。
- 高德加载失败时显示明确诊断，并显示备用地图兜底，不再只看到空白区域。
- 后台和师傅移动端的“高德查看 / 高德导航”继续使用当前点位 `lng / lat`。
- 不修改后端派单、上传、状态回写接口逻辑。

修改文件：
- `src/lib/amapLoader.js`：新增统一高德 SDK 加载器，从 `VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE` 读取配置，加载前设置 `window._AMapSecurityConfig`，动态加载高德 JS API v2，并返回 `AMap` 实例。诊断中的脚本地址已对 Key 脱敏。
- `src/App.jsx`：后台地图执行台接入真实 `AMap.Map`，渲染点位 Marker，支持 Marker 点击选中、右侧点位点击后地图居中、多选点位 `fitView`、窗口变化 `resize`、错误诊断和备用地图兜底；后台点位详情与现场查看弹窗补充“高德查看 / 高德导航”。
- `src/styles.css`：补充真实高德地图容器高度、备用地图、Marker、地图诊断、企业后台侧边导航、微动效和 loading shimmer 样式。
- `.env.example`：保留 `VITE_API_BASE_URL`、`VITE_DATA_MODE=mock-server`、`VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE` 示例。
- `README.md`：补充高德地图配置、白名单 / Referer、本地调试和排错说明。
- `tests/e2e/app.spec.js`：收紧“高德地图执行台”断言范围，避免侧边导航和模块标题重名造成 Playwright strict mode 冲突。

验证命令：
```bash
npm run build
npm run test:e2e
```

当前自动化结果：
- `npm run build`：通过。
- 第一次 `npm run test:e2e`：9 passed / 1 failed。失败原因是测试使用 `getByText("高德地图执行台")`，当前页面同时存在侧边导航链接和地图模块标题，触发 Playwright strict mode；已收敛断言范围，不是业务功能失败。
- 后续重新执行 `npm run test:e2e`：通过，10 passed。
- 浏览器渲染冒烟：启动 Vite 到 `http://127.0.0.1:5199/admin`，`#map-console` 可见，`.amap-shell` 高度约 `582px`，地图区域不是 0 高度；未打印任何真实高德 Key。

地图验证说明：
- 当前自动化环境不打印、不读取真实高德 Key，因此无法在报告里证明真实底图一定来自某个真实 Key。
- 代码路径已完成：Key 和 Security Code 存在时调用 `loadAmapSdk()`，创建 `new AMap.Map(...)`，加入 `AMap.TileLayer()`，并按点位 `lng / lat` 创建 Marker。
- Key 或 Security Code 缺失、SDK 加载失败时，后台地图区域会显示错误原因、环境诊断和备用地图，避免空白。
- 配置真实高德变量后，人工打开 `/admin` 的“高德地图执行台”即可验证真实底图、Marker、列表联动和 `fitView`。

人工验收清单：
- 后台打开 `http://localhost:5173/admin` 或 `http://电脑局域网IP:5173/admin`。
- “高德地图执行台”显示真实高德底图。
- 当前点位显示为 Marker。
- 点击 Marker 后，右侧点位详情切换到该点位。
- 点击右侧点位卡片后，地图居中到对应 Marker。
- 勾选多个点位后，地图自动 `fitView`。
- 删除或填错高德配置时，显示备用地图和错误诊断。
- 后台点位详情、现场查看弹窗、手机端任务页的“高德查看 / 高德导航”均可打开高德地图或高德网页。
- 手机端派单读取、上传照片、状态回写链路未被本次地图修改破坏。

## 17. 工人小车 Marker 与实时定位预留

更新时间：2026-05-08。

本次修改目标：
- 后台高德地图同时显示墙体点位 Marker 和工人/师傅小车 Marker。
- 点位 Marker 从横向胶囊改为圆形数字气泡，并按状态区分颜色。
- 小车 Marker 使用 worker 的 `lng / lat`，显示师傅姓名、车牌、速度或停车分钟数。
- 手机端预留真实定位上传：`navigator.geolocation.watchPosition` -> `POST /api/worker-location`。
- mock-server 实现 `/api/worker-location`，写回 worker 最新坐标并追加定位日志。

修改文件：
- `src/App.jsx`：地图执行台增加车辆 Marker 图层，workers 更新时只更新车辆 Marker 位置，不重建整张地图；增加“全部在线工人 / 当前项目工人”切换；点位 Marker 改为圆形数字样式；师傅端增加“开启实时定位 / 停止实时定位”。
- `src/apiClient.js`：新增 `saveWorkerLocation()`，本地模式和 mock-server 模式都可写入 worker 坐标。
- `server/index.js`：新增 `POST /api/worker-location`，`GET /api/workers` 返回带最新坐标的 workers。
- `src/styles.css`：新增圆形点位 Marker、小车 Marker、定位卡片和地图工具栏样式。
- `README.md`：补充师傅实时定位说明。
- `TEST_REPORT.md`：记录本次验收结果。
- `server/data/db.json`：本地接口冒烟测试写入了 w1 最新定位数据；该文件本来就是本地持久化测试数据。

验证命令：
```bash
npm run build
npm run test:e2e
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，10 passed。
- mock-server 定位接口冒烟：临时启动 Express，`POST /api/worker-location` 成功，随后 `GET /api/workers` 能看到 `w1.lng=113.33`、`w1.lat=23.19`、`moving=true`、`speed=18`。

人工验收清单：
- 打开 `http://localhost:5173/admin`，进入“高德地图执行台”。
- 配置高德 Key 后，应同时看到圆形点位 Marker 和小车 Marker。
- 小车 Marker 文案类似：`张师傅 28km/h` 或 `张师傅 停5分`。
- 点击右侧点位卡片，地图居中到对应圆形点位。
- 点击地图圆形点位，右侧点位详情切换；双击点位进入编辑/上传。
- 手机打开 `/worker/w1`，点击“开启实时定位”，授权定位后后台 `/api/workers` 应更新该师傅 `lng / lat`。
- 真实公网部署必须使用 HTTPS，否则手机浏览器可能限制持续定位。

## 18. 公网小团队正式使用版改造

更新时间：2026-05-08。

本次修改目标：
- 前端生产环境默认使用同源 `/api`，公网部署不再依赖局域网 IP 推断。
- Express 后端同时提供 API、`dist` 静态文件和 SPA 路由回退，支持刷新 `/admin`、`/worker/zhang`。
- 新增正式“师傅管理”：新增、编辑、软停用、恢复、复制公网链接。
- 派单下拉只显示 `enabled=true` 的师傅。
- 师傅移动端支持 `/worker/:idOrSlug`，可通过 id、slug、workerKey、手机号匹配。
- 停用师傅访问移动端时显示“该师傅账号已停用，请联系管理员。”。

修改文件：
- `src/apiClient.js`：重写 `getApiBaseUrl()`；开发环境无配置时默认 `http://localhost:8787`，生产环境无配置时使用同源 `/api`；新增 `deleteWorker()`、`setWorkerEnabled()`，`getWorker()` 改为按单个 worker API 查询。
- `server/index.js`：新增 `GET /api/workers/:workerIdOrSlug`、`DELETE /api/workers/:id`、`PATCH /api/workers/:id/enable`；增强 POST/PUT 去重和字段规范；生产环境托管 `dist` 并回退非 `/api` 路由到 `index.html`。
- `src/App.jsx`：后台“师傅管理”升级为 CRUD 管理模块；派单下拉过滤停用账号；师傅端显示手机号、车辆、队伍类型和停用提示。
- `src/styles.css`：新增师傅管理列表、状态标签、表单、停用提示样式。
- `package.json`：新增 `start`、`serve:prod`。
- `.env.example`：按公网部署顺序保留 `VITE_DATA_MODE=mock-server`、`VITE_API_BASE_URL=`、高德变量。
- `README.md`：补充公网同源部署、师傅管理、同源 API、高德域名白名单说明。
- `DEPLOY_PRODUCTION.md`：新增国内云服务器、pm2、Nginx、HTTPS、验收地址完整部署说明。
- `tests/e2e/app.spec.js`：新增师傅管理 E2E，覆盖新增、编辑、复制链接、slug 打开、派单和停用；补充生产 API base 不再做局域网推断的源码断言。
- `server/data/db.json`：通过结构化写回升级 workers 字段，保留老数据并补齐 `workerKey`、`teamType`、`enabled`、`online`、`updatedAt` 等兼容字段。

验证命令：
```bash
npm run build
npm run test:e2e
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- Express 生产冒烟：随机端口启动 `createApp()`，验证 `/api/health`、`POST /api/workers`、`GET /api/workers/prodtest`、`PUT /api/workers/:id`、`DELETE /api/workers/:id`、`PATCH /api/workers/:id/enable`、`/admin` SPA 回退，全部通过。冒烟结束后已恢复原始 `server/data/db.json`。

仍需人工处理：
- 公网服务器上配置真实 `.env.production`，不要把高德 Key 或安全密钥提交到仓库。
- 高德 Web JS Key 需要在高德控制台绑定正式公网域名。
- 正式师傅定位必须使用 HTTPS。
- 上线前建议备份 `server/data/db.json` 和 `server/uploads/`，后续可迁移到数据库与对象存储。

## 22. 师傅端后台固定身份改造

更新时间：2026-05-09。

本次修改目标：
- 师傅端 `/worker/:idOrSlug` 不再让师傅填写姓名、手机号、车牌号。
- 师傅打开专属链接后按 id -> slug -> workerKey 自动匹配后台 worker，并用 worker.id 读取自己的派单任务。
- 找不到 worker 时显示“未找到该师傅，请联系后台重新生成链接。”，不会默认进入张师傅，也不会出现身份填写区。
- 车牌号新增、编辑、保存、显示、派单下拉、师傅端展示统一转大写。
- 生产构建默认使用 `mock-server`，避免 `localhost:8787` 生产测试时误退回 localStorage。

修改文件：
- `src/apiClient.js`：新增 `normalizeCarNo()`，统一 worker slug/workerKey 生成与查找逻辑；生产环境默认数据模式改为 `mock-server`；派单和任务读取统一使用真实 worker.id。
- `server/index.js`：新增同样的车牌规范化、slug 生成、worker 查找逻辑；`/api/worker-tasks` 找不到师傅时返回清晰错误；上传媒体保存为 `/uploads/...` 相对路径，不再把本地 `localhost` 或局域网 IP 写进 `server/data/db.json`；保留 Express + dist + db.json 主线。
- `src/App.jsx`：移除师傅端“队伍身份确认”卡片和姓名/手机号/车牌输入；顶部改为固定展示“某师傅的任务”、手机号、车牌号、今日任务和当前进度；后台师傅表单输入车牌时自动大写；照片库支持把 `/uploads/...` 相对路径按当前 API base 展开。
- `src/styles.css`：新增固定师傅身份摘要样式。
- `tests/e2e/app.spec.js`：新增/更新黄师傅场景，覆盖新增、自动 slug、车牌大写、复制链接、按 slug 打开、派单刷新不丢、停用后不出现在派单下拉。
- `README.md`：补充后台固定师傅身份、车牌大写和生产默认 mock-server 说明。
- `server/data/db.json`：生产冒烟通过后台新增了黄师傅 `w3 / huang`，并写入给黄师傅的派单任务和上传回写结果。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run start`：通过，Express 监听 `0.0.0.0:8787`，`/api/health` 返回 `mode=mock-server`。
- 生产浏览器冒烟通过：打开 `http://localhost:8787/admin`，新增黄师傅，车牌 `粤a·t003` 自动显示/保存为 `粤A·T003`。
- `/api/workers/huang`：通过，返回黄师傅 `id=w3`。
- 后台派单给黄师傅后，`/api/worker-tasks?workerId=w3` 返回 `count=3`。
- 打开并刷新 `http://localhost:8787/worker/huang`：显示“黄师傅的任务”、手机号、车牌号和任务进度，不显示“队伍身份确认”。
- 师傅端上传照片后，点位 `p1` 状态回写为“已完成”。
- 上传媒体 URL 复查：最新 `pointMedia.url` 保存为 `/uploads/...` 相对路径，没有写入 `localhost` 或局域网 IP。
- SPA 回退复查：`/admin`、`/worker/w1` 可直接打开；`/api/debug-state` 仍返回 JSON，没有被前端 fallback 抢走。

仍需人工处理：
- 真机定位、拍照和高德 App 唤起建议在 HTTPS 公网域名上再走一遍。
- 正式上线前继续备份 `server/data/db.json` 和 `server/uploads/`。

## 23. 师傅端链接复制 origin 修复

更新时间：2026-05-09。

本次修改目标：
- 后台“复制链接”“打开师傅端”“打开该师傅移动端”和顶部师傅移动端入口统一使用当前后台访问域名。
- 通过局域网地址打开后台时，复制出的刘师傅链接应为 `http://192.168.110.187:8787/worker/liu`。
- 通过公网域名打开后台时，复制出的链接自动变为 `https://公网域名/worker/slug`。
- 通过 `localhost` 或 `127.0.0.1` 打开后台时，在师傅管理区域显示黄色提示，提醒手机不能使用 localhost 链接。

修改文件：
- `src/App.jsx`：新增 `getShareOrigin()` 和 `buildWorkerUrl(worker)`，所有师傅链接统一从 `window.location.origin` 生成；师傅管理区域新增 localhost 黄色提示。
- `server/index.js`：`/api/health` 增加 `lanIps` 和 `lanAdminUrls`，并优先返回 `192.168/10/172.16-31` 私有网段地址，避免 Windows 虚拟网卡地址排在前面。
- `src/styles.css`：新增 `.share-link-warning` 黄色提示样式。
- `tests/e2e/app.spec.js`：补充 localhost/127 打开后台时显示链接警告的断言。
- `README.md`：补充“先用局域网 IP 或公网域名打开后台，再复制师傅链接”的说明。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run start`：通过，Express 监听 `0.0.0.0:8787`，`/api/health` 返回 `lanAdminUrls=["http://192.168.110.187:8787/admin"]`。
- 打开 `http://localhost:8787/admin`：师傅管理顶部显示黄色提示，并提示改用 `http://192.168.110.187:8787/admin`。
- 打开 `http://192.168.110.187:8787/admin`：不显示 localhost 提示。
- 局域网后台中刘师傅卡片显示并复制 `http://192.168.110.187:8787/worker/liu`。
- “打开师傅端”链接 href 为 `http://192.168.110.187:8787/worker/liu`。
- 打开 `http://192.168.110.187:8787/worker/liu`：进入“刘师傅的任务”，不显示“队伍身份确认”。

说明：
- 本次未写死 `localhost`、`127.0.0.1` 或 `192.168.110.187` 到业务链接生成逻辑；测试报告里的地址只是本机验证结果。
- 高德地图、派单、上传照片、师傅固定身份和车牌大写功能未被本次链接修复破坏。

## 24. 师傅端链接复制按钮二次修复

更新时间：2026-05-09。

本次修复原因：
- 局域网 HTTP 后台中，`navigator.clipboard` 可能不可用或被浏览器限制。
- 旧逻辑使用 `navigator.clipboard?.writeText(url)`，当 Clipboard API 不存在时不会报错，但也不会真的写入剪贴板，导致剪贴板可能仍停留在旧的 `/admin` 地址。

本次修改：
- `src/App.jsx` 新增 `getWorkerSlug(worker)`，严格按 `worker.slug || worker.worker_key || worker.workerKey || worker.id` 取 slug。
- `buildWorkerUrl(worker)` 固定返回 `window.location.origin + "/worker/" + getWorkerSlug(worker)`。
- “复制链接”点击时只复制 `buildWorkerUrl(worker)`，并在 HTTP 局域网下使用同步 `copy` 事件 fallback 写入剪贴板。
- “打开师傅端”、顶部师傅快捷入口、派单后的“打开该师傅移动端”均改为 `window.open(buildWorkerUrl(worker), "_blank")`。
- 不再用当前页面地址、`/admin`、`window.location.href`、`location.pathname` 拼师傅链接。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run start`：通过。
- 打开 `http://192.168.110.187:8787/admin`：不显示 localhost 警告。
- 点击刘师傅“复制链接”：页面确认复制目标为 `http://192.168.110.187:8787/worker/liu`。
- 点击黄师傅“复制链接”：页面确认复制目标为 `http://192.168.110.187:8787/worker/huang`。
- 点击刘师傅“打开师傅端”：新窗口 URL 为 `http://192.168.110.187:8787/worker/liu`，进入“刘师傅的任务”。
- 点击黄师傅“打开师傅端”：新窗口 URL 为 `http://192.168.110.187:8787/worker/huang`，进入“黄师傅的任务”。

说明：
- 自动化环境在 HTTP 局域网 origin 下无法读取系统剪贴板内容，但页面复制成功提示和按钮目标 URL 均已验证为 `/worker/{slug}`，不是 `/admin`。
- 真实浏览器点击时会优先使用 Clipboard API；HTTP 局域网被限制时会走同步 `copy` 事件 fallback。

## 25. 师傅端安全访问码链接改造

更新时间：2026-05-09。

本次修改目标：
- 师傅正式链接不再使用 `/worker/liu`、`/worker/huang` 这类简单 slug，统一使用后台自动生成的 `accessToken`。
- 正式复制链接格式为 `当前域名/worker/tk_XXXXXXXXXXXX`，复制和打开都继续使用当前 `window.location.origin`，不会复制成 `/admin`。
- 旧 id/slug 链接保留兼容，但师傅端会提示“当前使用的是旧链接，请联系管理员更换为新的安全链接。”。
- 后台支持“重置链接”，重置后旧 token 失效；停用后链接显示“该师傅链接已停用，请联系管理员。”。

修改文件：
- `server/index.js`：新增 `accessToken` 生成、旧数据启动迁移、按 token 优先匹配 worker、`PATCH /api/workers/:id/access-token`、删除师傅时清理派单任务。
- `src/apiClient.js`：本地模式同步新增安全访问码生成、重复校验、token 优先查找、重置链接 API。
- `src/App.jsx`：后台所有复制/打开师傅端链接统一走 `buildWorkerUrl(worker)`；师傅端按 token 固定身份；无效、停用、旧链接分别显示清晰提示；移动端调试信息不展示完整 token。
- `tests/e2e/app.spec.js`：覆盖新增师傅生成 token、token 链接打开、旧链接提示、复制链接、重置链接、停用和删除。
- `README.md`、`DEPLOY_PRODUCTION.md`、`TEST_REPORT.md`：更新安全链接、localhost 和公网部署说明。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

自动化验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run start`：通过，Express 监听 `0.0.0.0:8787`，`/api/health` 返回 `mode=mock-server` 和局域网后台地址。

生产版浏览器冒烟：
- 打开 `http://localhost:8787/admin`：师傅管理顶部显示 localhost 黄色提示。
- 打开 `http://192.168.110.187:8787/admin`：不显示 localhost 提示。
- 局域网后台中刘师傅、黄师傅卡片链接均为 `http://192.168.110.187:8787/worker/tk_************` 形式，不再出现 `/worker/liu`、`/worker/huang` 或 `/admin`。
- 点击刘师傅“复制链接”：页面复制状态显示 `http://192.168.110.187:8787/worker/tk_************`，不是 `/admin`。
- 点击刘师傅“打开师傅端”：新窗口 URL 为 `http://192.168.110.187:8787/worker/tk_************`，与卡片安全链接一致。
- 打开刘师傅 token 链接：进入“刘师傅的任务”，不显示“队伍身份确认”，页面正文不展示完整 token。
- 打开不存在的 `tk_` 链接：显示“链接无效或已过期，请联系管理员重新发送师傅链接。”，不会默认进入张师傅。
- 打开旧链接 `/worker/liu`：仍能进入刘师傅任务页，同时显示“当前使用的是旧链接，请联系管理员更换为新的安全链接。”。
- 临时测试师傅重置链接：旧 token 查询返回 404，新 token 可查询到对应师傅，车牌 `粤b·t008` 保存为 `粤B·T008`。
- 临时测试师傅停用后打开 token 链接：显示“该师傅链接已停用，请联系管理员。”；测试完成后已删除临时师傅。

说明：
- 当前正式复制链接必须使用局域网 IP 或公网域名打开后台后再复制；`localhost` 只适合电脑本机测试，不能发给手机。
- 高德地图、圆形点位 Marker、小车 Marker、派单、手机上传照片/视频、上传后自动完成、车牌大写均由本轮 E2E 和生产冒烟覆盖主路径；真实手机定位与高德 App 唤起建议在 HTTPS 公网域名上再走一遍人工验收。

## 26. 师傅在线状态和链接权限分离

更新时间：2026-05-09。

本次修改目标：
- `enabled` 只表示师傅 token 链接是否可用，由后台“启用师傅 / 停用师傅”控制。
- `online` 只表示师傅当前是否在线，由师傅端 heartbeat 和 `lastSeenAt` 超时判断。
- 后台师傅卡片拆分展示“在线/离线”和“链接启用/链接停用”，并显示“最后在线”时间或“从未上线”。
- 操作按钮拆成两行：复制链接 / 打开师傅端 / 重置链接；编辑 / 停用师傅或启用师傅 / 删除师傅。

修改文件：
- `server/index.js`：新增 `POST /api/workers/:id/heartbeat`、`POST /api/workers/:id/offline` 和 `PATCH /api/workers/:id`；`GET /api/workers` 返回按 45 秒心跳计算后的 `online`；停用时同步标记离线和 `lastOfflineAt`。
- `src/apiClient.js`：本地模式同步实现 heartbeat、offline、45 秒在线计算和启用/停用分离。
- `src/App.jsx`：师傅端打开有效 token 后立即 heartbeat，并每 15 秒续心跳；页面隐藏、关闭或卸载时尝试 offline；后台每 10 秒刷新 workers。
- `src/styles.css`：新增在线圆点、链接状态标签、停用/启用/重置/删除按钮样式。
- `tests/e2e/app.spec.js`：更新师傅管理测试，覆盖 heartbeat 写入、链接停用、启用后保持离线、删除师傅。
- `README.md`、`DEPLOY_PRODUCTION.md`、`TEST_REPORT.md`：补充在线状态和链接权限说明。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

当前自动化结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run start`：通过，Express 监听 `0.0.0.0:8787`。

生产冒烟结果：
- `GET /api/workers`：返回所有师傅，包含 `enabled`、按 45 秒心跳计算后的 `online`、`lastSeenAt`、`lastOnlineAt`、`lastOfflineAt` 和复杂 `accessToken`。
- 未打开师傅端时，局域网后台 `http://192.168.110.187:8787/admin` 中刘师傅卡片显示“离线 + 链接启用”，并继续显示 `/worker/tk_************` 复杂链接。
- 调用 `POST /api/workers/:id/heartbeat` 后，刘师傅变为 `online=true`，并写入 `lastSeenAt`、`lastOnlineAt`。
- 打开刘师傅复杂 token 师傅端页面后，后端在数秒内收到 heartbeat，`online=true`。
- 关闭师傅端后，浏览器不保证离线请求一定送达；等待 47 秒后，`GET /api/workers` 按 `lastSeenAt` 超时把刘师傅计算为 `online=false`，后台卡片恢复“离线 + 链接启用”。
- 临时测试师傅停用后：`enabled=false`、`online=false`、`lastOfflineAt` 有值；禁用 token 页面显示“该师傅链接已停用，请联系管理员。”，不显示上传入口或身份填写区。
- 临时测试师傅重新启用后：`enabled=true` 但 `online=false`，直到再次 heartbeat 才会上线。
- 临时测试师傅重置链接后：旧 token 返回 404，新 token 可用；测试完成后已删除临时师傅。

## 27. 企业级后台信息架构重构

更新时间：2026-05-10。

本次修改目标：
- 将后台从单页功能堆叠升级为企业级 SaaS 管理后台。
- 新增固定侧边栏、顶部 Header、页面级模块切换。
- 首页改为 Dashboard 总览，不再承载全部操作。
- 地图调度、点位管理、师傅管理、派单中心、现场素材、系统状态拆成独立页面。
- 重点将师傅管理改为表格 + 详情面板 + 分页 + 搜索筛选，在线/离线与链接启用/停用分开展示。

主要修改文件：
- `src/App.jsx`：收缩为路由、全局状态、页面切换和弹窗协调。
- `src/hooks/useH5Data.js`：抽出原后台数据加载、保存、派单、上传、师傅启停和 token 重置逻辑。
- `src/lib/domain.js`：抽出状态、点位、师傅、素材、导航、统计和格式化工具。
- `src/components/layout/*`：新增 `AdminLayout`、`Sidebar`、`Header`。
- `src/pages/*`：新增 Dashboard、MapConsole、Points、Workers、Dispatch、Media、SystemHealth 页面。
- `src/components/shared/*`：新增 Drawer、Modal、Toast、ConfirmDialog、EmptyState、StatusBadge 等共享组件。
- `src/components/map/*`、`points/*`、`workers/*`、`dispatch/*`、`media/*`：拆出各业务页组件。
- `src/styles.css`：新增企业后台视觉系统、表格、抽屉、调度台、响应式和动效样式。
- `tests/e2e/app.spec.js`：按新信息架构重写回归测试。

验证命令：
```bash
npm run build
npm run test:e2e
npm run start
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，10 passed。
- `npm run start`：通过，Express 监听 `0.0.0.0:8787`，本机地址 `http://localhost:8787`，局域网地址 `http://192.168.110.187:8787`。
- 浏览器生产冒烟：打开 `http://127.0.0.1:8787/admin`，Dashboard 和 7 个一级导航可见。
- 浏览器生产冒烟：侧栏切换点位管理、师傅管理、地图调度、派单中心、现场素材、系统状态均显示对应关键内容。

已覆盖回归功能：
- 页面与导航：Dashboard / 地图调度 / 点位管理 / 师傅管理 / 派单中心 / 现场素材 / 系统状态切换无报错。
- 点位管理：表格显示、搜索、筛选、分页、新增点位弹窗、批量导入弹窗、详情 Drawer。
- 师傅管理：新增、车牌自动大写、搜索、启用筛选、详情面板、复杂 token 链接、复制链接、打开师傅端、编辑、重置链接、停用、启用、删除。
- 派单中心：点位池筛选、批量勾选、选择师傅、一键派单、本地任务写入、师傅端收到任务。
- 地图调度：地图容器、点位图层、小车图层、右侧 Tabs、点位详情面板。
- 手机端：复杂 token / 旧 slug 链接识别、固定师傅身份、任务翻页、上传照片、上传后自动完成。
- 现场素材：上传后进入素材中心，素材卡片可见。
- 系统状态：API 状态、地图/Kimi/数据模式、项目管理、稳定性自检、诊断面板、导出 JSON。

未执行项：
- 未运行 `npm run test:supabase`：当前 `package.json` 没有该脚本，本轮也未修改 Supabase 表、Storage 或真实上传服务配置。
- 高德真实底图依赖本地 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`；未配置时已验证备用地图和诊断提示可用。

## 28. 正式产品化阶段 1：统一业务底座

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 1，不进入 UI 重构、地图增强、部署改造等后续阶段。
- 统一点位状态链路：`待派单 → 已派单 → 待施工 → 施工中 → 已上传素材 → 待验收 → 已完成 / 需复查`。
- 统一素材分类：`现场照片 / 720 全景 / 水印照片 / 凯立德图片 / 墙租协议图片 / 视频`。
- 建立异常规则和项目级素材规则字段，并保证旧状态、旧素材分类、旧项目数据可自动兼容。
- 保持 `dispatch`、`worker-tasks`、`point-media`、`complete-point`、`worker-location`、`health`、`debug-state` 链路可用。

修改文件：
- `src/lib/domain.js`：新增统一状态、统一素材分类、素材齐套规则、项目默认素材规则、点位异常规则和兼容归一函数。
- `src/apiClient.js`：本地演示模式同步归一旧数据，派单写入 `已派单`，上传素材分类归一，项目补齐 `materialRules/material_rules`。
- `server/index.js`：Express API 同步归一旧数据，项目补齐素材规则，派单写入 `已派单`，上传 `kind` 兼容旧分类。
- `server/test-api.js`：补充阶段 1 API 回归，覆盖状态归一、旧素材分类兼容、项目素材规则、定位、debug-state 和关键接口。
- `tests/e2e/app.spec.js`：补充阶段 1 E2E，覆盖统一状态、素材分类选项和项目素材规则字段；同步派单状态断言为 `已派单`。
- `src/components/shared/legacyModals.jsx`：移除水印图片最多 2 张的旧限制，上传入口使用统一素材分类。
- `src/components/shared/StatusBadge.jsx`、`src/pages/MediaPage.jsx`、`src/components/media/MediaCard.jsx`、`src/pages/PointsPage.jsx`：同步新状态/新素材分类口径。

兼容策略：
- 旧状态如 `未派单`、`已分配`、`执行中`、`已上传`、`待审核`、`完成`、`异常` 会归一到新状态链。
- 旧素材分类如 `水印图片`、`720全景`、`全景视频`、文件名中的 `凯立德/墙租/协议/视频` 会归一到新素材分类。
- 旧项目如果没有素材规则，会按项目名生成默认规则：加多宝项目默认 `现场照片 + 水印照片 + 墙租协议图片`，阿康项目默认 `现场照片 + 720 全景 + 凯立德图片`，能量项目默认 `现场照片 + 视频`，其他项目默认 `现场照片`。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- API 回归确认：`/api/health`、`/api/import-demo`、`/api/workers`、`/api/wall-points`、`/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/worker-location`、`/api/debug-state`、`/api/complete-point/:pointId` 均可用。

影响说明：
- 派单后的点位和任务状态从旧口径 `施工中` 调整为统一链路中的 `已派单`。
- 上传后自动完成逻辑仍保持，`complete-point` 仍将点位和任务更新为 `已完成`。
- 本阶段未改 UI 信息架构、未新增项目管理一级页、未做地图框选/圈选、未改公网部署方案。

## 29. 正式产品化阶段 2：公网正式使用基础

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 2，不进入师傅 CRUD 深化、后台 UI 重构、地图框选/圈选、素材中心增强等后续阶段。
- 强化生产环境同源 `/api` 使用方式，避免公网部署继续依赖 `localhost` 或局域网 API 地址。
- 解决后台复制师傅链接时仍可能生成 `localhost` / `127.0.0.1` 的问题。
- 明确公网 HTTPS 域名下师傅链接生成规则、生产环境变量、部署流程和上线检查重点。
- 保持阶段 1 的统一状态、统一素材分类、项目级素材规则不被破坏。
- 继续验证 `health`、`debug-state`、`dispatch`、`worker-tasks`、`point-media`、`complete-point`、`worker-location` 等旧链路可用。

修改文件：
- `src/lib/domain.js`：`getShareOrigin()` 改为优先读取 `VITE_PUBLIC_APP_ORIGIN`，其次读取 `/api/health` 解析出的局域网 origin，再使用当前公网/局域网 origin；本地兜底时不再生成 localhost 师傅链接，而是使用局域网 IP 模板提示。
- `src/App.jsx`：后台在 localhost 打开且未配置公网 origin 时，自动调用 `data.healthCheck()`，读取 `lanAdminUrls[0]` 并写入 `window.__WALL_AD_SHARE_ORIGIN__`，供复制师傅链接使用。
- `src/hooks/useH5Data.js`：暴露 `healthCheck` 给后台工作区使用，避免页面直接散落 API 请求。
- `src/pages/WorkersPage.jsx`：更新 localhost 提示文案，区分“已配置公网域名”“已自动使用局域网地址”“需要配置公网 origin 或局域网地址”三种情况。
- `server/index.js`：`/api/health` 增加 `requestOrigin`、`publicAppOriginConfigured`、`recommendedAdminUrl`、`recommendedWorkerUrlPattern`、`storageMode` 等生产诊断字段，并支持 `PUBLIC_APP_ORIGIN` / `VITE_PUBLIC_APP_ORIGIN`。
- `server/test-api.js`：补充 health 断言，确认测试环境未配置公网 origin 时仍返回 `lanAdminUrls`。
- `tests/e2e/app.spec.js`：补充复制师傅链接不能包含 `localhost` / `127.0.0.1` 的断言，并把 `VITE_PUBLIC_APP_ORIGIN` 静态检查放在负责链接生成的 `src/lib/domain.js`。
- `.env.example`：补充 `VITE_PUBLIC_APP_ORIGIN`、`PUBLIC_APP_ORIGIN`、`PORT`，并默认使用 `mock-server` + 同源 API 配置口径。
- `README.md`：更新同源 API、公网师傅链接、三种环境链接生成、高德和生产使用说明。
- `DEPLOY_PRODUCTION.md`：补充公网 HTTPS 部署步骤、生产变量、Nginx 反代、health 验收地址、公网链接生成规则和小团队上线流程。
- `TEST_REPORT.md`：记录本阶段修改、验证和旧链路保留情况。

公网链接生成逻辑：
- 已配置 `VITE_PUBLIC_APP_ORIGIN=https://你的域名`：后台复制链接始终生成 `https://你的域名/worker/tk_XXXXXXXXXXXX`，即使管理员临时从 localhost 打开后台。
- 未配置 `VITE_PUBLIC_APP_ORIGIN`，但后台通过公网 HTTPS 域名打开：使用当前浏览器 origin，生成 `https://当前域名/worker/tk_XXXXXXXXXXXX`。
- 未配置公网 origin，后台通过局域网 IP 打开：使用当前局域网 origin，生成 `http://电脑局域网IP:端口/worker/tk_XXXXXXXXXXXX`。
- 后台通过 `localhost` / `127.0.0.1` 打开：优先调用 `/api/health`，使用后端返回的第一条 `lanAdminUrls` 生成局域网师傅链接。
- 本地 API 暂不可用时：生成 `http://电脑局域网IP:端口/worker/tk_XXXXXXXXXXXX` 模板提示，避免复制出 localhost；该模板必须替换成真实 IP 后才能用于手机测试。

生产环境变量：
```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://你的域名
VITE_AMAP_KEY=高德Web端Key
VITE_AMAP_SECURITY_CODE=高德安全密钥
VITE_KIMI_CLASSIFY_ENDPOINT=
PUBLIC_APP_ORIGIN=https://你的域名
PORT=8787
```

三种环境链接示例：
- 本地开发：`localhost` 打开后台时，若 `/api/health` 可用，复制为 `http://真实局域网IP:8787/worker/tk_XXXXXXXXXXXX`；若 API 暂不可用，显示 `http://电脑局域网IP:端口/worker/tk_XXXXXXXXXXXX` 模板提示。
- 局域网测试：用 `http://192.168.x.x:8787/admin` 打开后台，复制为 `http://192.168.x.x:8787/worker/tk_XXXXXXXXXXXX`。
- 公网生产：配置 `VITE_PUBLIC_APP_ORIGIN=https://你的域名` 后，复制为 `https://你的域名/worker/tk_XXXXXXXXXXXX`。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- E2E 已确认师傅管理复制链接包含 `/worker/tk_...`，且不包含 `localhost` 和 `127.0.0.1`。
- API 回归已确认 `/api/health` 正常，且 `lanAdminUrls` 可用于本地/局域网诊断。
- API 回归已确认 `/api/dispatch` 派单后 `/api/worker-tasks/w1` 可读到任务。
- API 回归已确认 `/api/point-media/:pointId` 兼容旧素材分类并归一为水印照片。
- API 回归已确认 `/api/worker-location` 定位上报仍可用。
- API 回归已确认 `/api/debug-state` 仍返回关键数据。
- API 回归已确认 `/api/complete-point` 能把点位改为 `已完成`，随后查询 `/api/wall-points` 可看到状态回写。

影响说明：
- 本阶段未改后台 UI 信息架构，未新增师傅 CRUD 能力，未改地图调度交互，未进入阶段 3。
- 阶段 1 的统一状态链、统一素材分类、项目级素材规则继续保留，并由 E2E/API 回归覆盖。
- 原有 dispatch、worker-tasks、point-media、complete-point、worker-location、health、debug-state 链路均已确认可保留。
- 真实公网可用仍依赖部署时配置 HTTPS 域名、Nginx/证书、`VITE_PUBLIC_APP_ORIGIN` 和高德域名白名单；本地自动化不能替代真实公网手机验收。

## 30. 正式产品化阶段 3：师傅与移动端

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 3，不进入后台 UI 大改、地图调度增强、派单中心重构或素材中心批量能力等后续阶段。
- 补强师傅管理 CRUD、复杂 token 安全链路、启用/停用、重置链接、复制链接和打开师傅端能力的自动化验证。
- 完善在线/离线判断口径：同时基于最近 heartbeat 和最近定位上报时间。
- 完善后台最近定位展示，避免把普通编辑时间误认为定位时间。
- 完善师傅端固定身份、任务单点浏览、上一点位/下一点位、左右滑动切换和六类上传入口。
- 保持阶段 1 的统一状态、素材分类、项目级素材规则不被破坏。
- 保持阶段 2 的公网链接生成逻辑不被破坏。
- 保持 `dispatch`、`worker-tasks`、`point-media`、`complete-point`、`worker-location`、`health`、`debug-state` 链路可用。

修改文件：
- `src/apiClient.js`：本地模式 worker 归一化新增 `lastLocationAt/last_location_at`；在线判断同时看 `lastSeenAt` 和 `lastLocationAt`；本地定位上报写入最近定位时间。
- `server/index.js`：后端 worker 归一化新增 `lastLocationAt/last_location_at`；在线判断同时看心跳和定位；`/api/worker-location` 写入最近定位时间。
- `src/lib/domain.js`：新增 `workerLastLocationText()`，统一后台最近定位时间展示。
- `src/components/workers/WorkersTable.jsx`：师傅列表“最近定位时间”改为读取最近定位字段。
- `src/components/workers/WorkerDetailPanel.jsx`：基本信息和定位 Tab 增加/改用真实最近定位时间。
- `src/components/shared/legacyModals.jsx`：师傅端点位卡新增左右滑动切换；上传区清晰展示六类素材分类；保留图片类素材多文件上传且不限制数量。
- `src/styles.css`：补充移动端上传分类标签和提示样式。
- `tests/e2e/app.spec.js`：补充阶段 3 E2E，覆盖固定身份无输入框、六类上传分类、左右滑动切换、token 链接和车牌大写主流程。
- `server/test-api.js`：补充阶段 3 API 回归，覆盖新增/编辑/删除师傅、车牌大写、复杂 token、重置旧 token 失效、停用 token 后任务/定位失效、定位上报触发在线和最近定位。
- `TEST_REPORT.md`：记录本阶段修改和验证结果。

师傅管理真实能力：
- 后台可新增师傅，自动生成 `tk_` 开头的复杂不可猜测 token。
- 后台可编辑师傅，车牌中的英文字母自动转大写。
- 后台可删除师傅，并清理该师傅相关派单任务。
- 后台可启用/停用师傅，停用后 token 不再能进入有效任务链路，也不能继续上报定位。
- 后台可重置链接，旧 token 立即失效，新 token 可继续使用。
- 后台可复制链接，继续沿用阶段 2 的公网 origin 生成逻辑，不复制 localhost。
- 后台可打开师傅端，正式路径仍为 `/worker/tk_XXXXXXXXXXXX`。
- 旧 id/slug 链接继续兼容，但师傅端会提示更换为新的安全链接；正式使用以 token 为主。

在线/离线判断：
- `enabled=false` 时始终视为离线。
- 45 秒内有 `lastSeenAt/last_seen_at` 心跳，视为在线。
- 45 秒内有 `lastLocationAt/last_location_at` 定位上报，也视为在线。
- `lastOfflineAt/last_offline_at` 晚于最近心跳或定位时，视为离线。
- 启用师傅只恢复链接权限，不直接置为在线；需要师傅重新打开链接发心跳或定位后才上线。

师傅端流程：
- 师傅打开专属 `/worker/tk_XXXXXXXXXXXX` 后，系统自动识别后台身份。
- 页面固定展示姓名、手机号、车牌、任务数和当前进度。
- 不再显示姓名、手机号、车牌输入框，也不允许师傅自行切换身份。
- 每次只展示一个点位任务，可通过“上一点位 / 下一点位”按钮切换。
- 已实现左右滑动切换：左滑进入下一点位，右滑回到上一点位。
- 上传分类包含：`现场照片 / 720 全景 / 水印照片 / 凯立德图片 / 墙租协议图片 / 视频`。
- 图片上传入口支持多文件选择，不限制数量；视频仍按当前视频上传入口处理。
- 打开有效链接后会发送 heartbeat；开启实时定位后定位上报会写入后台最近坐标和最近定位时间。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- E2E 已确认师傅端固定身份，不存在姓名/手机号/车辆编号输入框。
- E2E 已确认六类上传分类在师傅端可见，并提示图片类素材不限制数量。
- E2E 已确认上一点位/下一点位按钮可用，左右滑动可切换点位。
- E2E 已确认新增师傅车牌大写、token 链接打开、旧 slug 兼容提示、重置旧 token 失效、停用 token 失效、删除师傅流程可用。
- API 已确认新增师傅生成复杂 token 且车牌大写。
- API 已确认编辑师傅后车牌继续大写。
- API 已确认重置链接后旧 token 访问返回 404。
- API 已确认定位上报可更新在线状态和最近定位时间。
- API 已确认停用师傅后 token 任务链路不返回有效任务，定位上报返回 403。
- API 已确认启用后等待 heartbeat/定位才会在线，删除后 token 失效。
- API 回归继续确认 `/api/health`、`/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/worker-location`、`/api/debug-state`、`/api/complete-point/:pointId` 均可用。

影响说明：
- 本阶段未改后台一级信息架构，未进入地图调度框选/圈选，未进入派单中心推荐师傅，未进入素材中心批量下载增强。
- 阶段 1 统一状态链、统一素材分类、项目级素材规则仍由 E2E/API 覆盖。
- 阶段 2 公网链接 origin 逻辑未改变，复制链接仍不应出现 localhost。

## 31. 阶段 3 补齐项：师傅端左右滑动切换点位

更新时间：2026-05-10。

本次修改目标：
- 只补齐师傅端左右滑动切换点位，不进入阶段 4。
- 保持“一页一个点位”。
- 保留“上一点位 / 下一点位”按钮。
- 手机端左滑进入下一点位，右滑返回上一点位。
- 防止误触：短距离滑动、偏竖向滚动、上传/导航/按钮/表单区域滑动不触发切换。
- 不改上传、定位、任务读取、token、公网链接等逻辑。

修改文件：
- `src/components/shared/legacyModals.jsx`：加固师傅端点位卡触摸逻辑，新增 `handleTouchMove`、交互元素保护、72px 滑动阈值、横向主导判断；左滑下一点位，右滑上一点位。
- `src/styles.css`：为 `.mobile-point-card` 增加 `touch-action: pan-y` 和滑动提示样式，保留纵向滚动体验。
- `tests/e2e/app.spec.js`：补充短距离滑动不触发、左滑下一点位、右滑上一点位的回归断言。
- `TEST_REPORT.md`：记录本补齐项验证结果。

实现说明：
- 触摸起点记录在点位卡 `touchstart`。
- 只有横向位移达到 72px，且横向位移至少为纵向位移的 1.35 倍时，才触发切换。
- `a/button/input/select/textarea/label/.mobile-upload` 等交互区域不会触发滑动切点，避免上传或导航误触。
- `touch-action: pan-y` 允许页面继续纵向滚动；横向意图明显时阻止默认滚动并切换点位。
- 当前是第一个点位时右滑不会越界；当前是最后一个点位时左滑不会越界。

触屏手机验证方式：
1. 后台派单给某位师傅，例如李师傅。
2. 手机打开该师傅 `/worker/tk_...` 专属链接。
3. 确认页面显示 `1 / 3` 和第一个点位。
4. 在点位卡空白区域向左滑动超过约 72px，应切到 `2 / 3`。
5. 在点位卡空白区域向右滑动超过约 72px，应回到 `1 / 3`。
6. 轻微短滑、上下滚动、点击上传按钮、点击高德导航，不应触发点位切换。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- 回归确认：上传、定位、任务读取、dispatch、worker-tasks、point-media、complete-point、worker-location、health、debug-state 均未被本次滑动补丁破坏。

## 32. 正式产品化阶段 4：后台信息架构与企业级重构

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 4，不进入阶段 5 的点位/派单/素材深度联动扩展，也不改服务端接口链路。
- 后台一级导航整理为：运营总览、地图调度、点位管理、师傅管理、派单中心、项目管理、素材管理、系统状态。
- 将项目管理提升为独立一级页面，并从系统状态附属区域移出。
- 增加全局项目切换、时间范围切换、全局搜索入口和高频快捷动作。
- 将运营总览升级为经营驾驶舱，突出 KPI、今日优先事项、近 7 天趋势、项目推进、队伍状态、素材风险和异常优先级。
- 将点位管理补强为企业级筛选表格，保留批量操作入口。
- 将素材管理补强为分类筛选、齐套状态筛选、批量下载/导出入口和项目素材规则摘要。
- 保持阶段 1/2/3 的统一业务底座、公网链接、师傅 CRUD/token、固定身份、左右滑动、上传和派单链路不被破坏。

修改文件：
- `src/lib/domain.js`：调整后台一级导航名称和项目管理入口，新增通用时间范围判断 helper。
- `src/App.jsx`：接入全局时间范围、全局搜索、高频快捷动作和项目管理一级路由。
- `src/components/layout/AdminLayout.jsx`：向顶部 Header 传递全局上下文和快捷动作。
- `src/components/layout/Header.jsx`：新增时间范围、全局搜索、快捷动作区，并修正快捷动作的可访问名称。
- `src/pages/DashboardPage.jsx`：升级经营驾驶舱，新增今日优先事项、近 7 天趋势、素材风险摘要和异常优先级入口。
- `src/components/dashboard/TodoPanel.jsx`：支持不同面板标题，用于今日优先事项、异常优先级和工作入口。
- `src/pages/ProjectsPage.jsx`：新增独立项目管理页，支持新增/编辑/隐藏/归档、月份筛选、项目切换和项目级素材规则配置。
- `src/pages/PointsPage.jsx`：接入全局搜索/时间范围，新增异常、师傅、标签、时间筛选和批量查看/导出/跳地图入口。
- `src/components/points/PointFilters.jsx`：补强项目、状态、异常、师傅、标签、时间和关键词筛选。
- `src/components/points/PointsTable.jsx`：补充凯立德、墙租协议和异常状态列，异常口径复用阶段 1 规则。
- `src/pages/MediaPage.jsx`：新增素材规则说明、齐套/待补全/无素材摘要，并接入全局搜索/时间范围。
- `src/components/media/MediaFilters.jsx`：补强分类、项目、点位、师傅、时间、齐套状态和关键词筛选。
- `src/pages/SystemHealthPage.jsx`：移除附属项目管理，只保留系统诊断、Kimi 配置和稳定性自检。
- `src/styles.css`：补充企业级后台布局、Header 快捷动作、驾驶舱趋势、项目管理、素材规则和异常标签样式。
- `tests/e2e/app.spec.js`：更新为 8 个一级业务页面，并覆盖独立项目管理和素材管理新命名。
- `TEST_REPORT.md`：记录阶段 4 修改和验证结果。

后台一级导航最终结构：
- 运营总览
- 地图调度
- 点位管理
- 师傅管理
- 派单中心
- 项目管理
- 素材管理
- 系统状态

关键实现说明：
- 师傅管理继续使用企业级表格、搜索、筛选、分页和详情侧栏，避免师傅增多后页面无限拉长。
- 点位管理新增异常筛选、师傅筛选、时间筛选，并在表格中显示五类图片素材数量和异常状态。
- 素材管理没有混入师傅端执行页；素材网格只展示真实上传素材，规则摘要负责展示齐套/待补全/无素材状态。
- 全局项目切换继续驱动地图、点位、派单、素材等页面；全局时间范围当前接入点位和素材筛选，运营总览展示近 7 天趋势。
- 全局搜索作为顶部统一入口，可同步到点位、师傅和素材页面。
- 高频快捷动作包含新增点位、批量导入、快速派单、新增师傅、批量下载素材，并跳转到对应真实功能入口。
- 异常和素材风险入口复用 `getPointAnomalies()`、项目级素材规则和统一素材分类，不新增第二套状态口径。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- E2E 已确认后台 8 个一级页面可切换。
- E2E 已确认点位管理表格、搜索、筛选、新增、批量导入和详情抽屉可用。
- E2E 已确认独立项目管理页可访问，并可见项目素材规则配置。
- E2E 已确认素材管理新入口可访问，六类素材分类仍存在。
- E2E 已继续确认师傅管理 CRUD、token 链接、车牌大写、停用/启用、重置链接、删除师傅、师傅端固定身份和左右滑动不受影响。
- E2E 已继续确认地图调度点位 marker、小车 marker 和右侧 Tabs 不受影响。
- E2E 已继续确认移动端上传后后台素材管理可见。
- API 回归继续确认 `/api/health`、`/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/worker-location`、`/api/debug-state`、`/api/complete-point/:pointId` 均可用。

影响说明：
- 本阶段未改服务端接口实现，未改师傅端上传/定位/任务读取主链路。
- 阶段 1 的统一状态链、素材分类、项目级素材规则继续保留。
- 阶段 2 的公网链接 origin 逻辑继续保留。
- 阶段 3 的师傅 CRUD、复杂 token、安全链路、在线离线、固定身份和左右滑动继续保留。
- 地图调度的框选/圈选/轨迹回放等更深能力未在本阶段展开，应保留到后续阶段处理。

## 33. 正式产品化阶段 5：地图调度增强

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 5，不进入阶段 6。
- 继续保留真实高德地图加载链路，不替换成假地图。
- 保持点位 Marker 圆形视觉风格。
- 小车 Marker 区分行驶中、停车中、离线。
- 地图调度从展示页增强为可操作页面，支持地图点选、框选、圈选、批量选点、区域汇总和地图派单。
- 支持按项目、状态、异常筛选。
- 保持点位列表与地图点击详情双向联动。
- 增加调度视图、验收视图、轨迹回放基础。
- 保持 `worker-location` 最近位置读取和旧 API 链路不被破坏。

修改文件：
- `src/lib/domain.js`：新增 `workerMotionState()`、`workerMotionLabel()`，统一小车行驶中/停车中/离线判断和展示文案。
- `src/pages/MapConsolePage.jsx`：新增异常筛选、视图模式、选择模式、区域选择状态、区域汇总计算和地图点选/区域选择回写。
- `src/components/map/MapToolbar.jsx`：新增异常筛选、调度/验收/轨迹三视图切换、浏览/点选/框选/圈选四种地图交互模式。
- `src/components/map/AmapView.jsx`：保留真实高德地图；增强小车 Marker 状态样式；新增框选/圈选覆盖层；点选模式下点击圆形点位可加入批量选择；区域选择结果回写到现有 `selectedIds`。
- `src/components/map/MapSidebar.jsx`：新增区域汇总 Tab、轨迹回放基础 Tab；点位详情补充房东、已派师傅、素材情况、异常情况；小车详情补充手机号、车牌、在线状态、当前任务、最近上报时间和今日轨迹。
- `src/styles.css`：新增地图区域选择层、区域汇总、小车行驶/停车/离线视觉、轨迹列表和地图侧栏 Tabs 样式。
- `tests/e2e/app.spec.js`：补充地图阶段 5 回归，覆盖三视图入口、框选/圈选入口、点位详情素材/异常、区域汇总和轨迹回放基础。
- `TEST_REPORT.md`：记录阶段 5 修改和验证结果。

高德地图稳定性：
- 继续使用 `loadAmapSdk()` 读取 `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`。
- 高德 SDK 正常时使用真实 `AMap.Map`、`AMap.Marker`、`ToolBar`、`Scale`。
- Key 缺失或 SDK 加载失败时保留诊断卡片和备用地图兜底，避免地图区域空白；这只是兜底显示，不替代真实高德主链路。
- 地图初始化后继续使用 `ResizeObserver` 和窗口 resize 触发 `map.resize()`，保证后台布局变化时地图不塌陷。

地图调度实现说明：
- 圆形点位 Marker：继续使用 `.amap-point-marker` + `.amap-point-bubble`，按统一点位状态映射颜色，选中和批量勾选有高亮。
- 小车 Marker：读取 worker 最近 `lng/lat`；在线且移动为行驶中，在线未移动为停车中，超过在线阈值为离线；三种状态分别使用绿色、橙色、灰色。
- 框选/圈选：在高德地图上方增加交互覆盖层，拖动结束后用高德 `lngLatToContainer()` 将点位坐标转换为屏幕坐标并判断是否落入矩形/圆形区域；高德未就绪的兜底地图使用相同点位坐标比例计算。
- 区域汇总：框选/圈选后立即显示点位数、待派点数、异常数、在线师傅数，并把区域点位写入现有 `selectedIds`。
- 地图派单：区域点位或点选点位进入现有批量选择集合后，右侧“派单”或“区域汇总”的“一键批量派单”继续调用原有 `dispatchSelected()`，不新增第二套派单逻辑。
- 点位列表与地图联动：右侧点位列表可点击“定位”切到点位详情；地图 Marker 点击会切换右侧点位详情；点选模式下也会加入/移出批量选择。
- 调度视图：默认显示调度用点位和师傅小车，支持点选/框选/圈选后派单。
- 验收视图：聚焦已上传素材、待验收、已完成、需复查或素材缺失点位，便于验收与异常处理。
- 轨迹回放基础：读取 `trackLogs` 和 worker 最近位置，展示选中师傅今日轨迹记录，为后续时间轴播放和停车时长分析预留。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- E2E 已确认地图页仍显示点位、小车和右侧 Tabs。
- E2E 已确认调度视图、验收视图、轨迹回放、框选、圈选入口可见。
- E2E 已确认点位详情包含素材情况和异常情况。
- E2E 已确认框选后进入区域汇总，并显示待派点数和在线师傅数。
- E2E 已确认轨迹回放基础可打开。
- API 回归继续确认 `/api/worker-location` 定位上报仍可用。
- API 回归继续确认 `/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/debug-state`、`/api/complete-point/:pointId`、`/api/health` 均可用。

影响说明：
- 本阶段未改服务端 API 实现，未改师傅端 token、安全链接、上传、固定身份和左右滑动。
- 阶段 1 的统一状态、素材分类、项目级素材规则继续保留，并被地图异常筛选复用。
- 阶段 2 的公网链接逻辑未改。
- 阶段 3 的师傅端与 token 安全链路未改。
- 阶段 4 的后台一级信息架构未改。
- 更完整的历史轨迹时间轴播放、自动停车时长统计和跨区域智能推荐仍留给后续阶段。

## 34. 正式产品化阶段 6：点位 / 派单 / 素材联动

更新时间：2026-05-10。

本次修改目标：
- 只推进阶段 6，不进入阶段 7。
- 让点位管理、派单中心、素材管理形成业务闭环。
- 点位页清楚展示当前师傅、必传素材完成情况、缺失素材、是否可验收，并支持进入派单、素材查看、验收查看。
- 派单中心增加推荐师傅和派单前校验。
- 素材管理继续按项目级素材规则判断齐套，并保留六类素材分类和筛选。
- 上传素材后自动刷新齐套判断、点位状态、异常项、运营总览和地图调度数据。
- 保留前 5 阶段全部能力。

修改文件：
- `src/lib/domain.js`：新增 `pointMaterialCompletion()`、`isPointReadyForAcceptance()`、`assignedWorkersForPoint()`、`dispatchValidationForPoint()`，统一三页联动判断。
- `src/components/points/PointsTable.jsx`：点位表新增当前师傅、必传素材完成、缺什么素材、可验收列，并新增素材/验收入口。
- `src/components/points/PointDetailDrawer.jsx`：点位详情补充当前师傅、验收状态、素材齐套和缺失说明。
- `src/pages/PointsPage.jsx`：接入素材查看和验收查看入口。
- `src/App.jsx`：从点位页跳转素材管理时可聚焦指定点位；验收查看会进入素材管理并提示核对齐套/异常。
- `src/pages/DispatchPage.jsx`：新增推荐师傅、派单前校验、任务量/跨项目/重复派单/异常风险判断。
- `src/components/dispatch/DispatchBasket.jsx`：待派单篮子显示齐套状态和异常摘要。
- `src/components/dispatch/DispatchSummary.jsx`：展示推荐师傅和派单前校验；停用师傅会阻断派单。
- `src/pages/MediaPage.jsx`：支持点位聚焦；新增按“项目 / 点位编号 / 素材分类”的 ZIP 归档下载，并保留 manifest 导出。
- `src/components/media/MediaFilters.jsx`：将批量下载入口明确为“批量下载 ZIP”，并保留“导出归档清单”。
- `src/apiClient.js`：本地上传素材后按项目素材规则自动流转点位状态为 `已上传素材` 或 `待验收`，不再一刀切完成。
- `server/index.js`：mock/生产 API 上传素材后同样按项目素材规则自动更新点位状态。
- `src/hooks/useH5Data.js`：上传后自动 `loadAll()`，刷新点位、素材、异常、总览和地图数据。
- `src/styles.css`：补充素材齐套单元格、派单推荐、派单校验样式。
- `tests/e2e/app.spec.js`：补充点位联动列、派单校验推荐、上传后非固定完成态的回归断言。
- `TEST_REPORT.md`：记录阶段 6 修改和验证结果。

点位 / 派单 / 素材联动说明：
- 点位页展示当前状态、当前师傅、必传素材完成比例、缺失素材、是否可验收。
- 点位行可直接进入派单、素材查看、验收查看；素材/验收查看会跳到素材管理并按该点位聚焦。
- 派单成功后继续调用原有 dispatch 链路，点位状态变为 `已派单`，师傅任务数、地图调度和师傅端任务会通过统一数据刷新读取到最新状态。
- 素材上传后，点位状态按项目级素材规则自动流转：未齐套为 `已上传素材`，齐套为 `待验收`；仍可通过 `complete-point` 完成验收。
- 运营总览、地图调度、点位管理、素材管理都复用同一份 points/photos/tasks/projects 数据，因此上传/派单后刷新即可同步变化。

派单前校验：
- 师傅链接是否启用。
- 师傅是否在线。
- 当前任务量。
- 是否跨项目/区域。
- 点位是否已派给其他师傅。
- 是否存在异常风险。
- 推荐师傅依据：在线、同项目、已有定位、当前任务更少、链接启用；距离使用 worker 与所选点位经纬度的基础近似评分。

素材齐套判断：
- 严格使用项目级 `materialRules/material_rules`。
- 若项目未配置规则，继续使用阶段 1 的项目名称默认规则兼容旧数据。
- 分类继续包含：现场照片、720 全景、水印照片、凯立德图片、墙租协议图片、视频。
- 图片类素材上传数量仍不限制。

批量下载说明：
- 当前批量下载入口已经生成真正的 ZIP 压缩包，不再仅用 manifest 代替下载。
- ZIP 按当前筛选结果生成，目录层级为“项目名称 / 点位编号 / 素材分类 / 文件名”。
- 文件命名包含点位编号、素材分类和序号，例如 `GZ-BY-001_现场照片_001.jpg`。
- ZIP 内同时保留 `manifest.json`，其中包含每个素材的项目、点位编号、素材分类、文件名、访问 URL 和建议归档路径。
- 若某个素材文件拉取失败，ZIP 会写入对应 `.download-error.txt` 占位文件，方便办公室核对缺失项。

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- E2E 已确认后台 8 个一级页面、点位表格、派单中心、师傅 token、安全链路、地图调度、移动端上传和素材管理均可用。
- E2E 已确认点位页出现必传素材/可验收信息，点位详情出现验收状态。
- E2E 已确认派单中心出现推荐师傅和派单前校验。
- E2E 已确认上传素材后后台素材管理可见，点位状态进入 `已上传素材` / `待验收` / `已完成` 之一。
- API 回归继续确认 `/api/health`、`/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/worker-location`、`/api/debug-state`、`/api/complete-point/:pointId` 均可用。

影响说明：
- 阶段 1 的统一状态、素材分类、项目级规则继续保留，并被点位/派单/素材三页共用。
- 阶段 2 的公网链接逻辑未改。
- 阶段 3 的师傅端、token、安全链路、在线离线、左右滑动未改。
- 阶段 4 的后台信息架构未改。
- 阶段 5 的真实高德地图、框选、圈选、批量派单、小车显示未改。

## 35. 阶段 6 补齐项：真正 ZIP 素材批量归档下载

更新时间：2026-05-11。

本次只补齐素材批量归档下载，不进入阶段 7，不新增其它业务功能。

修改文件：
- `src/lib/zipArchive.js`：新增浏览器侧标准 ZIP 生成器，使用 store/no-compression 方式写入 local file header、central directory 和 end record，支持 UTF-8 中文路径。
- `src/pages/MediaPage.jsx`：新增 `downloadArchiveZip()`，按当前筛选结果拉取素材文件并生成 ZIP；保留 `downloadArchiveManifest()`。
- `src/components/media/MediaFilters.jsx`：批量入口拆分为“批量下载 ZIP”和“导出归档清单”。
- `tests/e2e/app.spec.js`：补充素材管理页 ZIP 下载断言，确认下载文件名为 `wall-media-archive-*.zip`。

ZIP 生成说明：
- ZIP 完全按素材管理页当前筛选后的 `visible` 结果生成。
- 每个素材按“项目名称 / 点位编号 / 素材分类”归档。
- 文件名至少包含点位编号、素材分类和序号。
- ZIP 内保留 `manifest.json`，manifest 继续可单独导出。
- 单个文件拉取失败时，不中断整包下载，而是在对应目录写入 `.download-error.txt` 便于追查。

ZIP 内目录示例：
```text
加多宝村镇墙体项目/
  GZ-BY-001/
    现场照片/
      GZ-BY-001_现场照片_001.jpg
    水印照片/
      GZ-BY-001_水印照片_001.jpg
  manifest.json
```

验证命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

验证结果：
- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。
- 已确认项目级素材规则、素材筛选、点位/派单/素材联动和前 5 阶段能力未被破坏。

## 36. 正式产品化阶段 7：最终验证、上线准备与文档收口

更新时间：2026-05-11。

本阶段只做最终回归、上线准备和文档收口，不再新增大功能。

修改文件：
- `README.md`：重写为最终产品说明，覆盖项目用途、主要能力、本地启动、生产部署、环境变量、公网链接逻辑、师傅 token、素材分类、项目级规则、ZIP 下载和已知限制。
- `DEPLOY_PRODUCTION.md`：重写为公网部署指南，覆盖云服务器 Node/Express、Nginx、HTTPS、域名、环境变量、pm2、上传目录持久化、数据备份和不建议只依赖 Vercel Serverless 的原因。
- `TEST_REPORT.md`：补充阶段 6 ZIP 修正和阶段 7 最终回归记录。

各阶段完成内容汇总：
- 阶段 1：统一点位状态链路、素材分类、异常规则和项目级素材规则，兼容旧数据。
- 阶段 2：强化同源 API、生产环境配置和公网师傅链接生成，避免复制 localhost。
- 阶段 3：补强师傅 CRUD、复杂 token、停用/重置失效、在线离线、固定身份、移动端上传分类和左右滑动。
- 阶段 4：后台升级为 8 个一级导航，增加全局项目/时间/搜索/快捷动作，并把师傅、点位、素材等页面改为企业级结构。
- 阶段 5：保留真实高德地图，增强点位 Marker、小车 Marker、框选、圈选、区域汇总、地图派单和轨迹回放基础。
- 阶段 6：打通点位 / 派单 / 素材联动，派单前校验、项目级齐套判断、上传后状态联动，并补齐真正 ZIP 批量归档下载。
- 阶段 7：完成最终文档收口和自动化回归。

最终回归命令：
```bash
npm run build
npm run test:e2e
npm run test:api
```

最终回归结果：
- `npm run build`：通过，Vite 生产构建成功，生成 `dist/`。
- `npm run test:e2e`：通过，11 passed。
- `npm run test:api`：通过。

关键 API 回归结果：
- `/api/health`：通过。
- `/api/debug-state`：通过，继续返回 projects、workers、points、dispatchTasks 等关键数据。
- `/api/dispatch`：通过，派单后点位进入统一状态 `已派单`。
- `/api/worker-tasks/w1`：通过，师傅端可读到任务。
- `/api/point-media/:pointId`：通过，旧素材分类可归一，上传链路可用。
- `/api/complete-point/:pointId`：通过，可将点位改为 `已完成`。
- `/api/worker-location`：通过，定位上报可更新在线状态和最近位置。
- 师傅 token API：通过，新增生成复杂 token，重置后旧 token 失效，停用后 token 链接和定位上报失效。

自动化覆盖到的关键链路：
- 后台 8 个一级页面可访问。
- 点位管理表格、搜索、筛选、分页、新增/编辑/删除入口可用。
- 派单中心可筛选、批量勾选、选择师傅并写入任务。
- 阶段 1 的统一状态、素材分类和项目素材规则保持兼容。
- 师傅管理支持分页、搜索、筛选、详情、token 链接、启用/停用、重置、删除。
- 地图调度保留点位 Marker、小车 Marker 和右侧 Tabs。
- 移动端上传图片后后台素材管理可见。
- 移动端上一点位/下一点位切换正常。
- 素材管理 ZIP 批量下载入口可触发下载。
- 系统状态、独立项目管理、Kimi 配置和导出 JSON 可用。

仍需人工验收：
- 用真实高德 Key 和正式域名打开 `/admin`，确认真实底图加载、Referer 白名单和 Security Code 均正确。
- 用真实手机 HTTPS 打开师傅 token 链接，确认定位授权、持续定位、小车 Marker 位置变化。
- 在地图上真实拖动框选/圈选，确认区域点位和批量派单符合现场预期。
- 上传真实照片、720 全景、水印照片、凯立德图片、墙租协议图片和视频，确认办公室后台可查看。
- 使用真实筛选条件下载 ZIP，确认办公室电脑可正常解压中文目录和文件名。
- 用正式域名复制师傅链接，确认不会出现 localhost 或局域网地址。

当前仍未完成但不影响首版上线的增强项：
- 完整轨迹回放播放器、时间轴和播放控制。
- 更高级的权限系统、登录、角色和审计日志。
- 更强的数据库与对象存储持久化方案。
- 后端自动视频转码、压缩和封面截图。
- 更高级的统计报表、区域经营分析和人员绩效。
- 超大批量素材的服务端异步 ZIP 打包任务。

上线前必须准备：
- HTTPS 公网域名。
- 高德 Web JS API Key 与 Security Code，并绑定正式域名 Referer。
- 生产环境变量 `VITE_PUBLIC_APP_ORIGIN`、`PUBLIC_APP_ORIGIN`、`VITE_AMAP_KEY`、`VITE_AMAP_SECURITY_CODE`。
- 云服务器 Node/Express、Nginx、pm2、上传大小限制和防火墙。
- `server/data/db.json` 和 `server/uploads/` 的持久化与备份策略。
- 至少一次真实手机端定位、上传和师傅 token 链接验收。

## 37. 第二阶段：Supabase 正式数据模式切换

更新时间：2026-05-12。

本阶段只处理 Supabase 环境变量、数据源切换、错误提示优化和构建验证，不改后台 UI、不改地图、不新增业务功能。

问题来源：
- 线上 Vercel 右下角出现“刷新工人定位失败：接口连接失败，服务端环境变量缺失：SUPABASE_CLIENT_DEP_DISABLED”。
- 审计确认 `SUPABASE_CLIENT_DEP_DISABLED` 来自 `api/_shared.js`：旧 Vercel Serverless API 尝试 `require("@supabase/supabase-js")`，但项目此前没有安装该依赖。
- 前端此前生产默认 `mock-server`，`src/supabaseClient.js` 只是占位 `supabase = null`，未真正根据 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 切换正式数据源。

修改文件：
- `package.json` / `package-lock.json`：新增 `@supabase/supabase-js`，修复 Vercel API 缺 Supabase SDK 的直接原因。
- `src/supabaseClient.js`：新增正式 Supabase client 封装，读取 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`；缺失时不崩溃。
- `src/apiClient.js`：新增 `supabase` 数据模式；配置 Supabase 时自动优先读取正式数据；未配置时进入本地演示；项目、点位、师傅、派单、素材、定位、轨迹接入 Supabase 表。
- `src/hooks/useH5Data.js`：将提示改为中文业务提示；Supabase 初始化失败时临时切换演示数据，避免页面不可用。
- `src/lib/domain.js`：将 `SUPABASE_CLIENT_DEP_DISABLED`、服务端环境变量缺失、表不存在等错误转换为中文可理解提示。
- `api/_shared.js` / `api/worker-tasks.js`：旧 Vercel API 不再把内部错误码直接展示给用户，改为提示检查 Vercel Supabase 环境变量和依赖。
- `supabase/schema.sql`：更新正式表结构，包含 `projects`、`workers.access_token`、定位字段、`point_photos`、`track_logs` 和 `point-media` bucket。
- `.env.example`：补齐并整理 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`、高德和 Kimi 变量。
- `tests/e2e/app.spec.js`：补充 Supabase 正式模式静态断言，同时保留旧 API 派单链路检查。

当前前端数据来源：
- 项目列表：Supabase `projects`；无 Supabase 时本地演示数据。
- 点位列表：Supabase `wall_points`；无 Supabase 时本地演示数据。
- 师傅列表：Supabase `workers`；无 Supabase 时本地演示数据。
- 派单数据：Supabase `dispatch_tasks`；无 Supabase 时本地演示数据。
- 素材数据：Supabase `point_photos` + Storage bucket `point-media`；无 Supabase 时本地 blob 演示。
- 工人定位数据：Supabase `workers` 最新定位字段 + `track_logs`；无 Supabase 时本地演示轨迹。
- 系统状态数据：前端 `healthCheck()` 按当前数据模式返回；旧 `/api/health` 仍保留给 Express/Vercel API 诊断。

需要在 Vercel 配置：
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
VITE_KIMI_API_KEY=
```

如果继续使用旧 Vercel Serverless API 代理，还需要服务端变量：
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Supabase 需要建表：
- `projects`
- `workers`
- `wall_points`
- `dispatch_tasks`
- `point_photos`
- `track_logs`
- Storage bucket：`point-media`

验证命令：
```bash
npm install
npm run build
```

验证结果：
- `npm install`：通过，依赖已安装；npm audit 仍提示 1 个 high severity，需要后续单独评估依赖升级风险。
- `npm run build`：通过。
- Vite 提示主包超过 500KB，这是引入 Supabase SDK 后的包体警告，不是构建失败；后续如有需要可再做代码分包优化。

兼容性说明：
- Vercel 未配置 Supabase 时，页面不会崩溃，会提示“当前未连接正式数据库，系统正在使用演示数据”。
- Vercel 配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 后，前端自动进入 Supabase 正式数据模式。
- 本阶段未改业务 UI、地图、权限系统或数据库以外的业务流程。

## 38. Vercel API 路由 NOT_FOUND 修复

更新时间：2026-05-12。

本次只处理 Vercel 生产环境 `/api` 路由缺失问题，不修改业务 UI、不改数据库结构、不新增业务功能。

问题判断：
- Vercel 前端页面可以打开，Supabase 前端环境变量已配置。
- 线上右下角报错为 `The page could not be found / NOT_FOUND`，说明请求命中了不存在的 Vercel Serverless Function。
- 全局排查 `fetch`、`/api/`、`worker`、`location`、`task`、`health` 后，确认前端实际请求了多个根目录 `api/` 下尚未补齐的路径。

修复内容：
- 新增或补齐 Vercel Serverless Function：`/api/health`、`/api/projects`、`/api/wall-points`、`/api/point-media`、`/api/dispatch-tasks`、`/api/track-logs`、`/api/worker-location`、`/api/debug-state`、`/api/import-demo`、`/api/reset-demo`、`/api/complete-point`。
- 新增动态路由：`/api/projects/:id`、`/api/workers/:id`、`/api/workers/:id/enable`、`/api/workers/:id/access-token`、`/api/workers/:id/heartbeat`、`/api/workers/:id/offline`、`/api/wall-points/:id`、`/api/point-media/:id`、`/api/complete-point/:pointId`、`/api/worker-tasks/:workerId`。
- 修复 `/api/worker-tasks` 同时兼容 `workerId`、`worker_id`、`worker`、`code` 等查询参数。
- `/api/workers` 增加 POST 支持，避免 API 模式下新增师傅时只存在 GET 路由。
- `/api/projects` 增加 GET/POST 和动态 GET/PUT/PATCH/DELETE，避免项目页或项目切换请求在 Vercel 上 404。

验证命令：
```bash
node -e "require all api/*.js"
npm run build
```

验证结果：
- 所有根目录 `api/**/*.js` 文件均可被 Node 加载，未发现基础语法或相对路径错误。
- `npm run build` 通过。
- 构建仍提示部分 chunk 超过 500KB，这是引入 Supabase SDK 后的包体积 warning，不影响部署。

部署后人工复查：
- 重新部署 Vercel 后，优先检查 `/api/health`、`/api/projects`、`/api/workers?includeDisabled=true`、`/api/wall-points`、`/api/worker-location` 不应再返回 `NOT_FOUND`。
- 如果后续仍报错但不是 `NOT_FOUND`，应继续检查 Vercel 服务端环境变量 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 是否配置。

补充验证：
```bash
npm run test:e2e
```

补充验证结果：
- `npm run test:e2e` 通过，11 passed。
- 其中最后一条静态断言已调整为检查 `src/supabaseClient.js` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，与当前 Supabase 客户端封装位置一致。

补充 API 回归：
```bash
npm run test:api
```

补充 API 回归结果：
- `npm run test:api` 通过。
- 已确认 `/api/health`、`/api/dispatch`、`/api/worker-tasks/w1`、`/api/point-media/:pointId`、`/api/worker-location`、`/api/debug-state`、`/api/complete-point/:pointId` 等旧链路仍可用。
## 41. 点位保存正式 API 与数据库连接状态修复

更新时间：2026-05-12 14:37:14 +08:00。

本次继续处理线上 `/admin/points` 保存点位失败和左下角误显示“本地演示数据”的问题。

修复内容：

- 前端点位保存统一调用 `POST /api/wall-points`，新增和编辑都由后端按 `id` upsert。
- 后台主数据加载只把 `/api/projects` 和 `/api/wall-points` 作为核心连接判断；`workers`、`dispatch`、`media`、`track_logs` 作为可选数据源，失败时返回空数组，不再导致整站降级为本地演示数据。
- Supabase 正式模式加载成功后，左下角数据源显示为“Supabase 正式数据模式 / 数据库已连接”。
- 前端不再把后端错误二次翻译成“请运行 supabase/schema.sql”；保存失败会直接展示后端返回的错误类别与详情。
- `/api/wall-points` 增加 Supabase schema cache / 可选列缺失的降级重试：先写完整字段，若线上表缺少 `city/tags/completed_at` 等可选列，则自动改用核心字段再次写入。

已执行验证：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build` 通过；仅有 Vite chunk 体积 warning，不影响部署。
- `npm run test:e2e` 通过，11/11 passed。
- 本地 API 函数级验证通过：模拟 Supabase schema cache 缺列错误后，`POST /api/wall-points` 可自动降级重试并写入 `TEST-001`。

线上复查建议：

```text
https://repository-name-wall-ad-h5-test.vercel.app/api/projects
https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points
```

在 `/admin/points` 新增 `TEST-001` 后，再访问 `/api/wall-points`，应能在 `data` 数组看到该点位。

## 40. 新增点位真实写入 Supabase 修复

更新时间：2026-05-12 12:50:41 +08:00。

本次只处理线上“点位管理新增点位后 `/api/wall-points` 仍为空”的问题，不新增业务功能、不调整 UI。

修复内容：

- `api/wall-points.js` 保持单个 Vercel Serverless Function，支持 `GET /api/wall-points` 从 Supabase `wall_points` 读取数据。
- `api/wall-points.js` 支持 `POST /api/wall-points` 写入新增点位，并返回 `{ ok: true, data: 新增点位 }`。
- API 层新增字段白名单映射：`point_code/title` 写入 `title`，`install_captain_*` 写入 `captain_*`，`wall_team_*` 写入 `scout_*`，避免前端表单字段直接污染数据库列。
- 前端新增点位标记 `__isNew`，保存时明确走 `POST /api/wall-points`；已有点位编辑继续走 `PUT /api/wall-points?action=update&id=...`。
- 点位列表加载改为同源 `GET /api/wall-points`，不再在 Supabase 模式下绕过 Vercel API 直连浏览器 Supabase。
- `新增点位` 和 `保存点位` 失败时会继续抛错，避免 API 写入失败时弹窗关闭并造成“假成功”。

已执行验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build` 通过；仅保留 Vite chunk 体积 warning，不影响部署。
- `npm run test:e2e` 通过，11/11 passed。

线上人工复查路径：

```text
https://repository-name-wall-ad-h5-test.vercel.app/api/wall-points
```

预期：先返回空数组或已有点位；在前端新增 `TEST-001` 后，再访问该接口应能在 `data` 数组中看到 `TEST-001`。
## 43. `/admin/points` 最终新版界面替换

更新时间：2026-05-12 16:18:13 +08:00。

本次将 `/admin/points` 从过渡版结构替换为最终确认版点位管理界面，保留现有 Supabase 真实数据读写。

完成内容：

- `/admin/points` 真实入口仍为 [src/App.jsx](/C:/Users/wangs/Desktop/wall_ad_h5_test/src/App.jsx:192) -> [src/pages/PointsPage.jsx](/C:/Users/wangs/Desktop/wall_ad_h5_test/src/pages/PointsPage.jsx)。
- 已确认项目内不存在第二个实际生效的 `PointsPage` 或 `PointManagement` 页面与之并行引用。
- 过渡版页面中的“执行台账中心”“筛选与批量操作”“点位清单”等结构和文案已从 `/admin/points` 真实入口移除。
- 点位管理页保留真实 Supabase 数据读取、新增点位保存、点位表格真实展示、详情抽屉、派单、素材、验收、删除等现有行为。
- 前端字段 fallback 继续兼容 `point_code/title/name`、`detail_address/address`、`longitude/lng`、`latitude/lat`、`captain_* / install_captain_*`、`scout_* / wall_team_*`。

已执行验证：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build` 通过。
- `npm run test:e2e` 通过，11/11 passed。

## 44. `/admin/points` 正式新版点位管理页面定稿

更新时间：2026-05-12。

本次只修复线上 `/admin/points` 的实际渲染页面，不改数据库结构、不改 Supabase schema、不改 `/api/wall-points` 的真实数据读写链路。

路由与入口确认：

- `index.html` 直接加载 `src/App.jsx`。
- `src/App.jsx` 中 `/admin/points` 的真实页面入口仍然是 `src/pages/PointsPage.jsx`。
- 点位表格实际由 `src/components/points/PointsTable.jsx` 渲染。
- 顶部后台头部实际由 `src/components/layout/Header.jsx` 渲染，并在 points 页切换为专用 `Point Center` 文案。

本次修改文件：

- `src/pages/PointsPage.jsx`
- `src/components/points/PointsTable.jsx`
- `src/components/layout/Header.jsx`
- `src/styles.css`
- `tests/e2e/app.spec.js`
- `TEST_REPORT.md`

页面结构调整结果：

- 顶部已改为 `管理后台 / Point Center` + `点位管理`。
- 左侧导航中的点位英文标签也已同步为 `Point Center`，避免线上页面继续出现旧版 `Point Management`。
- 右侧已保留 `标签管理`、`批量导入`、`新增点位`。
- 页面主体顺序已调整为 `header` -> `pointToolbar` -> `pointBatchBar` -> `pointTableWrap`。
- `pointToolbar` 已包含：搜索框、`全部状态`、`异常筛选`、`批量打标签`、`批量移除标签`、`导入模板`。
- `pointBatchBar` 未选中时显示 `点击任意点位行即可多选`，选中后显示 `已选 X 个点位`，并显示批量按钮。
- `pointTableWrap` 表头已调整为：选择框、点位编号、项目 / 标签、地址、师傅 / 队伍、状态、素材情况、最近更新、操作。
- 页面已不再渲染旧版点位页中的英文大标题、顶部大统计卡片和“点位筛选”大区域。

数据链路确认：

- 点位列表仍通过 `GET /api/wall-points` 读取真实数据。
- 新增/编辑点位仍通过现有 `saveWallPoint()` -> `POST /api/wall-points` 保存。
- 未改回本地静态假数据，也未破坏现有新增点位保存能力。

本次验证命令：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build`：通过。
- `npm run test:e2e`：通过，11 passed。

## 42. `/admin/points` 第二版新版界面升级

更新时间：2026-05-12 15:41:14 +08:00。

本次只升级点位管理页，不改动 `/api/wall-points` Supabase 读写主链路。

完成内容：

- `/admin/points` 升级为第二版正式业务界面：新增顶部点位概览、紧凑筛选区、正式表格壳层和新版详情抽屉。
- 点位表格继续保留查看、编辑、现场查看、派单、素材、验收、删除入口。
- 前端展示兼容 `point_code/title/name`、`detail_address/address`、`longitude/lng`、`latitude/lat`、`captain_* / install_captain_*`、`scout_* / wall_team_*` 等字段。
- 新增点位弹窗仍使用现有保存流程，继续写入 Supabase；本次未修改数据库 API 写入逻辑。
- 表格继续显示项目、地址、K码、状态、房东、当前师傅、素材完成、缺失素材、可验收、施工队长、找墙队伍、最近更新时间、异常状态和操作按钮。

已执行验证：

```bash
npm run build
npm run test:e2e
```

验证结果：

- `npm run build` 通过；仅有 Vite chunk 体积 warning，不影响部署。
- `npm run test:e2e` 通过，11/11 passed。
