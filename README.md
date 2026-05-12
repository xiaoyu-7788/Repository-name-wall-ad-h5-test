# 全国墙体广告执行坐标系统

这是一个面向小团队真实执行的墙体广告项目管理系统，包含后台管理端和师傅移动端 H5。当前主线采用 React + Vite + Express mock/本地 API，可部署到公网 HTTPS 域名后由办公室和全国各地师傅通过链接使用。

系统不需要上架应用商城。后台用于项目、点位、师傅、派单、地图调度、素材和系统状态管理；师傅端通过后台生成的专属复杂 token 链接进入，只负责查看任务、导航、上传素材和开启定位。

## 当前主要能力

后台一级导航已经整理为正式产品结构：

- 运营总览：KPI、今日优先事项、近 7 天趋势、项目推进、队伍状态、素材风险和异常入口。
- 地图调度：真实高德地图、圆形点位 Marker、小车 Marker、点选、框选、圈选、区域汇总、批量派单、调度/验收/轨迹回放基础视图。
- 点位管理：搜索、项目/状态/异常/师傅/标签/时间筛选、企业级表格、详情 Drawer、批量操作、素材齐套和验收状态展示。
- 师傅管理：新增、编辑、删除、启用、停用、重置链接、复制链接、打开师傅端、搜索、筛选、表格、分页、详情侧栏。
- 派单中心：待派点位池、派单篮子、推荐师傅、派单前校验、批量派单、历史记录。
- 项目管理：新增、编辑、隐藏、归档、按月份分组、项目级素材必传规则。
- 素材管理：六类素材筛选、项目级齐套判断、manifest 导出、真正 ZIP 批量归档下载。
- 系统状态：health、debug-state、接口状态、环境与部署自检入口。

师傅移动端能力：

- 通过 `/worker/tk_XXXXXXXXXXXX` 专属 token 链接自动识别身份。
- 不再显示姓名、手机号、车牌输入框，基础身份只读且只能后台修改。
- 一页一个点位，支持上一点位/下一点位按钮和手机左右滑动切换。
- 支持高德导航、实时定位上报、任务读取、分类上传素材。
- 现场照片、720 全景、水印照片、凯立德图片、墙租协议图片均可无限制上传；视频按现有规则保留。

## 本地启动

安装依赖：

```bash
npm install
```

只启动前端开发服务：

```bash
npm run dev
```

启动本地 Express API：

```bash
npm run dev:api
```

前后端一起启动：

```bash
npm run dev:all
```

生产方式本地预演：

```bash
npm run build
npm run start
```

默认后端端口为 `8787`，生产同源访问时前端会请求 `/api/...`。

## 环境变量

请在 `.env.local` 或 `.env.production` 中配置变量，不要把真实 Key、token 或密钥提交到仓库。

```env
VITE_DATA_MODE=mock-server
VITE_API_BASE_URL=
VITE_PUBLIC_APP_ORIGIN=https://你的域名
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
PUBLIC_APP_ORIGIN=https://你的域名
PORT=8787
```

变量说明：

- `VITE_DATA_MODE`：推荐使用 `mock-server`，即前端通过 Express API 读写本地数据文件。
- `VITE_API_BASE_URL`：本地分离开发可填 `http://localhost:8787`；公网同源部署请留空。
- `VITE_PUBLIC_APP_ORIGIN`：后台复制师傅链接时优先使用的公网 origin，生产环境建议固定为 `https://你的域名`。
- `PUBLIC_APP_ORIGIN`：服务端 health 返回和部署自检使用的公网 origin，建议与 `VITE_PUBLIC_APP_ORIGIN` 一致。
- `VITE_AMAP_KEY`：高德 Web 端 JS API Key。
- `VITE_AMAP_SECURITY_CODE`：高德 JS API 安全密钥。
- `PORT`：Express 服务端口，默认 `8787`。

## 公网链接逻辑

后台复制师傅链接时按以下优先级生成：

- 已配置 `VITE_PUBLIC_APP_ORIGIN`：始终生成 `https://你的域名/worker/tk_XXXXXXXXXXXX`。
- 未配置但后台通过公网域名打开：使用当前浏览器公网 origin。
- 本地 `localhost` 打开：尝试读取 `/api/health` 返回的局域网地址，避免直接复制 localhost。
- API 不可用且没有公网配置：显示局域网模板提示，管理员必须替换为真实可访问地址后才能发给手机测试。

生产环境请固定配置 `VITE_PUBLIC_APP_ORIGIN` 和 `PUBLIC_APP_ORIGIN`，并使用 HTTPS 域名打开 `/admin` 后再复制给师傅。

## 师傅 token 安全逻辑

- 正式链接使用复杂不可猜测的 `accessToken`，格式为 `/worker/tk_XXXXXXXXXXXX`。
- 停用师傅后，token 链接立即失效，师傅端显示停用提示。
- 重置链接后，新 token 生效，旧 token 失效。
- 旧的 id/slug 链接仅用于兼容历史数据，正式复制不再使用 `liu`、`huang` 这类简单后缀。
- 师傅端打开链接后自动匹配后台 worker，不允许自行切换身份。

在线/离线判断基于最近心跳或最近定位上报时间。师傅端打开有效链接后会发送 heartbeat，开启定位后会通过 `POST /api/worker-location` 上报最近坐标，后台地图据此显示小车 Marker。

## 业务规则

统一点位状态链路：

```text
待派单 -> 已派单 -> 待施工 -> 施工中 -> 已上传素材 -> 待验收 -> 已完成 / 需复查
```

统一素材分类：

- 现场照片
- 720 全景
- 水印照片
- 凯立德图片
- 墙租协议图片
- 视频

项目可配置自己的素材必传规则。素材上传后，系统会按当前项目规则重新计算齐套状态，并联动点位状态、异常项、运营总览、地图调度和素材管理。

## 素材 ZIP 批量下载

素材管理页支持按当前筛选结果生成真正的 ZIP 压缩包，而不是只导出清单。ZIP 内部按以下层级归档：

```text
项目名称/
  点位编号/
    素材分类/
      点位编号_素材分类_001.jpg
```

ZIP 中会同时保留 `manifest.json`，便于办公室核对项目、点位、素材分类、原始 URL 和建议归档路径。若某个文件下载失败，ZIP 内会生成对应的 `.download-error.txt` 占位文件，便于发现缺失素材。

## 关键 API

- `GET /api/health`
- `GET /api/debug-state`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/workers`
- `GET /api/workers/:workerIdOrSlug`
- `POST /api/workers`
- `PUT /api/workers/:id`
- `DELETE /api/workers/:id`
- `PATCH /api/workers/:id/enable`
- `PATCH /api/workers/:id/access-token`
- `POST /api/workers/:id/heartbeat`
- `GET /api/wall-points`
- `POST /api/wall-points`
- `PUT /api/wall-points/:id`
- `DELETE /api/wall-points/:id`
- `POST /api/dispatch`
- `GET /api/worker-tasks/:workerId`
- `POST /api/point-media/:pointId`
- `POST /api/complete-point/:pointId`
- `POST /api/worker-location`
- `GET /api/track-logs`

## 验证命令

每次上线前至少执行：

```bash
npm run build
npm run test:e2e
npm run test:api
```

自动化测试会覆盖后台核心页面、师傅 token、固定身份、派单、任务读取、上传、地图调度入口、素材 ZIP 下载入口、health、debug-state 等关键链路。真实高德底图、手机定位权限、HTTPS 证书和外地手机网络仍需在公网环境人工验收。

## 生产部署

推荐使用一台云服务器运行 Node/Express，同一个 HTTPS 域名提供：

- `/admin` 后台管理端
- `/worker/tk_...` 师傅端 H5
- `/api/...` 后端接口
- `/uploads/...` 上传文件访问

详细部署步骤见 [DEPLOY_PRODUCTION.md](./DEPLOY_PRODUCTION.md)。

## 已知限制

当前版本适合首版小团队试运行，但仍有后续增强项：

- 轨迹回放目前是基础入口和轨迹数据展示，还不是完整时间轴播放器。
- 当前没有细粒度权限/RBAC 和正式登录体系，公网前建议增加访问保护。
- 默认持久化使用 `server/data/db.json` 和 `server/uploads/`，大规模生产建议迁移到数据库和对象存储。
- 视频未做后端自动转码、压缩和截图。
- 统计报表以运营驾驶舱为主，后续可扩展更多财务、区域和人员绩效报表。
- ZIP 当前为浏览器侧标准 ZIP 打包，适合中小批量；超大批量素材建议后续增加服务端异步打包任务。
