# 快速发布通道说明

这份文档用于以后快速发布新版本：Codex 或开发人员改完代码后，把代码提交到 GitHub，GitHub Actions 自动检查构建，Vercel 或 Netlify 自动生成预览链接。确认预览没问题后，再合并到 `main` 发布正式版。

当前项目类型：Vite React。

## 本地安装

第一次拿到代码时执行：

```bash
npm install
```

如果已经安装过依赖，平时不用反复安装，除非 `package.json` 有变化。

## 本地启动

启动前端开发页面：

```bash
npm run dev
```

启动本地 Node / Express API：

```bash
npm run dev:api
```

前端和 API 一起启动：

```bash
npm run dev:all
```

打开地址通常是：

```text
http://localhost:5173/admin
```

如果 Vite 提示了其它端口，以终端显示为准。

## 构建命令

发布前必须先构建：

```bash
npm run build
```

当前项目是 Vite React，构建产物目录是：

```text
dist
```

本地预览构建产物：

```bash
npm run preview
```

## 环境变量说明

复制 `.env.example` 为 `.env.local` 或在部署平台后台配置环境变量。不要把真实 Key 写进代码或提交到 GitHub。

常用变量：

```env
VITE_APP_ENV=development
VITE_APP_VERSION=
VITE_COMMIT_SHA=
VITE_BUILD_TIME=
VITE_DEPLOY_PLATFORM=
VITE_RELEASE_NOTES=

VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://你的域名

VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

VITE_KIMI_API_KEY=
VITE_KIMI_CLASSIFY_ENDPOINT=

PORT=8787
PUBLIC_APP_ORIGIN=https://你的域名
```

变量解释：

- `VITE_APP_ENV`：当前环境，常见值为 `development`、`staging`、`production`。
- `VITE_APP_VERSION`：版本号，例如 `v1.0.0`。
- `VITE_COMMIT_SHA`：本次构建对应的 Git commit。
- `VITE_BUILD_TIME`：构建时间。
- `VITE_DEPLOY_PLATFORM`：部署平台，例如 `Vercel`、`Netlify`、`Cloud Server`。
- `VITE_RELEASE_NOTES`：发布说明，例如 `师傅端上传体验优化`。
- `VITE_PUBLIC_APP_ORIGIN`：后台复制师傅链接时使用的公网地址，正式环境必须配置。
- `VITE_AMAP_KEY` 和 `VITE_AMAP_SECURITY_CODE`：高德地图 Web JS API 配置。

## GitHub 分支说明

建议使用三类分支：

- `main`：正式环境，合并后自动发布正式版。
- `develop`：测试环境，适合内部提前体验。
- `feature/xxx`：每个新功能单独开一个分支。

推荐流程：

```bash
git checkout -b feature/xxx
```

修改完成后：

```bash
npm run build
git add .
git commit -m "feat: xxx"
git push origin feature/xxx
```

然后在 GitHub 创建 Pull Request。

## GitHub Actions 构建检查

仓库已添加：

```text
.github/workflows/build-check.yml
```

它会在以下情况自动执行：

- 推送到 `main`
- 推送到 `develop`
- 向 `main` 创建 Pull Request
- 向 `develop` 创建 Pull Request

检查内容：

```bash
npm install
npm run build
```

只有构建通过，才建议合并代码。

## Vercel 部署步骤（推荐）

Vercel 适合自动生成预览链接和正式发布链接。当前项目如果只部署前端预览，配置非常简单；如果要承载上传文件和 Express API，正式小团队使用仍建议云服务器。

操作步骤：

1. 打开 Vercel。
2. 使用 GitHub 登录。
3. 点击 `Add New Project`。
4. 选择当前 GitHub 仓库。
5. Framework Preset 选择 `Vite`，通常 Vercel 会自动识别。
6. Build Command 填：

```bash
npm run build
```

7. Output Directory 填：

```text
dist
```

8. 在 Environment Variables 中配置 `.env.example` 里的 `VITE_` 变量。
9. 设置 `main` 分支作为 Production。
10. 设置 `develop` 分支作为测试环境，或让 `develop` 自动生成 Preview。
11. 每个 Pull Request 会自动生成一个 Preview 链接。
12. 检查 Preview 链接没问题后，合并到 `main`，Vercel 自动发布正式版。

注意：

- Vercel 预览非常适合验收前端页面。
- 当前系统包含 Node / Express API、上传文件和本地数据文件，真正给小团队长期使用时仍建议云服务器部署。

## Netlify 部署步骤（备用）

Netlify 也可以用于前端预览和发布。

操作步骤：

1. 打开 Netlify。
2. 使用 GitHub 登录。
3. 点击 `Add new site`。
4. 选择 `Import an existing project`。
5. 选择当前 GitHub 仓库。
6. Build command 填：

```bash
npm run build
```

7. Publish directory 填：

```text
dist
```

8. 在 Site configuration 里配置环境变量。
9. Pull Request 会生成 Deploy Preview。
10. 合并到 `main` 后自动发布正式站点。

## 新版本发布流程

标准流程：

1. 从 `main` 或 `develop` 拉出新功能分支：

```bash
git checkout -b feature/xxx
```

2. 修改代码。
3. 本地构建：

```bash
npm run build
```

4. 构建通过后提交：

```bash
git add .
git commit -m "feat: xxx"
git push origin feature/xxx
```

5. 在 GitHub 创建 Pull Request。
6. 等待 GitHub Actions 显示 Build Check 通过。
7. 打开 Vercel 或 Netlify 自动生成的预览链接。
8. 用预览链接检查后台和师傅端页面。
9. 确认没问题后合并到 `main`。
10. `main` 自动发布正式版。

## 回滚流程

如果 Vercel 正式版出问题：

1. 打开 Vercel 项目。
2. 进入 `Deployments`。
3. 找到上一个稳定版本。
4. 点击 `Promote to Production` 或 `Redeploy`。
5. 打开正式域名检查恢复情况。

如果 Netlify 正式版出问题：

1. 打开 Netlify 项目。
2. 进入 `Deploys`。
3. 找到上一个稳定版本。
4. 点击 `Publish deploy`。
5. 打开正式域名检查恢复情况。

如果云服务器正式版出问题：

1. 回到上一版 Git commit。
2. 执行 `npm install`。
3. 执行 `npm run build`。
4. 重启 pm2 服务。
5. 必要时恢复 `server/data/db.json` 和 `server/uploads/` 备份。

## 常见错误处理

构建失败：

- 先看 GitHub Actions 或本地终端里的红色报错。
- 常见原因是语法错误、文件路径错误、依赖没有安装。
- 本地先执行 `npm install`，再执行 `npm run build`。

预览链接打不开：

- 检查 Vercel/Netlify 的 Build Log。
- 确认 Output Directory 是 `dist`。
- 确认 Build Command 是 `npm run build`。

地图不显示：

- 检查 `VITE_AMAP_KEY`。
- 检查 `VITE_AMAP_SECURITY_CODE`。
- 检查高德控制台域名白名单是否包含当前预览域名或正式域名。

师傅链接出现 localhost：

- 正式环境必须配置 `VITE_PUBLIC_APP_ORIGIN=https://你的域名`。
- 不要从本机 `localhost` 后台复制链接发给外地师傅。

上传失败：

- 如果是 Vercel/Netlify 纯前端预览，上传链路可能无法像云服务器一样持久保存文件。
- 小团队正式使用建议走云服务器 Node / Express 部署。

版本信息显示“未配置”：

- 在部署平台配置 `VITE_APP_VERSION`、`VITE_APP_ENV`、`VITE_COMMIT_SHA`、`VITE_BUILD_TIME`、`VITE_DEPLOY_PLATFORM`。
- 修改环境变量后重新部署。
