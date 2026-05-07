# 墙体广告执行 H5 测试版

这是一个可以本地演示、也可以真实部署测试的 H5 工程：

- 电脑后台：筛选点位、全选/反选、派单给指定师傅
- 师傅手机端：只看自己的点位、点击高德导航、上传照片/视频
- 上传成功后：点位自动更新为“已完成”
- 本地演示：不配置 Supabase 也能在同一浏览器完成后台派单、师傅页查看、上传后更新状态
- 真实跨设备同步：Supabase 数据库和文件存储
- 前端部署：Vercel / Netlify / 自己服务器均可

当前后台已包含：

- Supabase 连接诊断：检查环境变量、URL 格式、4 张表读写、RLS、Storage bucket
- 高德地图执行台、标签筛选、放大筛选列表、点位编辑
- 项目管理、批量新增点位、现场查看中心、项目照片库
- 720全景、全景视频、水印图片、工人定位轨迹、Kimi图片分类
- 地址自动匹配经纬度：需要配置 `VITE_AMAP_KEY`

---

## 一、先准备 Supabase

1. 注册并进入 Supabase。
2. New Project 创建项目。
3. 进入 SQL Editor。
4. 打开 `supabase/schema.sql`，复制全部 SQL，粘贴运行。
5. SQL 会自动创建 `point-media` Storage bucket，并添加测试期匿名读写策略。

Supabase React 官方快速开始说明了如何创建项目并在 React 中查询数据；Storage 官方文档提供了 JS 上传文件的接口说明。

---

## 二、配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

填写：

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AMAP_KEY=
VITE_AMAP_SECURITY_CODE=
VITE_KIMI_CLASSIFY_ENDPOINT=
VITE_DATA_MODE=proxy
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

高德导航链接不需要把密钥写进代码。地址自动匹配经纬度会读取 `VITE_AMAP_KEY` 调用高德地理编码。

Kimi 图片分类不要把真实 Kimi API Key 放到前端；请放在后端接口里，然后把后端接口地址填到 `VITE_KIMI_CLASSIFY_ENDPOINT`。未配置时，系统会使用本地文件名规则分类。

### Vercel API 代理模式

线上真实手机测试建议使用代理模式：

```env
VITE_DATA_MODE=proxy
```

此时浏览器前端会优先请求本站 `/api/*`，再由 Vercel Serverless Function 访问 Supabase。这样即使手机或浏览器无法直连 Supabase，系统仍可通过 Vercel 后端代理工作。

Vercel 需要配置两类环境变量：

前端公开变量：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_AMAP_KEY
VITE_AMAP_SECURITY_CODE
VITE_DATA_MODE=proxy
VITE_KIMI_CLASSIFY_ENDPOINT，可选
```

服务端私密变量：

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY` 在 Supabase Project Settings → API 里查看。这个 key 权限很高，绝对不能写到前端代码、README、报告、`.env.example` 的真实值、GitHub 仓库或聊天里，只允许填到 Vercel Project → Settings → Environment Variables，并且只允许 `/api/*` Serverless Function 读取。

---

## 三、本地运行

```bash
npm install
npm run dev
```

打开：

```text
http://localhost:5173
```

师傅移动端测试：

```text
http://localhost:5173/worker?worker=zhang
http://localhost:5173/worker?worker=li
```

未配置 Supabase 时，系统会使用浏览器 localStorage 保存演示数据。你可以直接在后台点击“重置本地演示数据”，选择点位并派单，再打开师傅移动端链接查看任务。这个模式适合同一台电脑或同一浏览器演示。

如果要让办公室电脑和真实手机跨设备同步，仍然需要按前两节配置 Supabase，并运行 `supabase/schema.sql`。

配置后进入后台“Supabase诊断”，点击“开始诊断”。诊断会明确区分：

- 网络失败
- 环境变量错误
- 表不存在
- RLS权限问题
- Storage bucket 不存在
- Storage 权限问题

---

## 四、部署到 Vercel 真实手机测试

### 1. GitHub 上传方法：上传到 GitHub 私有仓库

1. 在 GitHub 新建一个 Private repository。
2. 把本项目代码提交并推送到该仓库。
3. 确认不要提交 `.env`、`.env.local`、`.env.*.local`。这些文件已经写入 `.gitignore`。

### 2. 在 Vercel 创建项目

1. 登录 Vercel。
2. 点击 New Project。
3. 选择刚才的 GitHub 私有仓库。
4. Framework Preset 选择 Vite。
5. Build Command 填：

```bash
npm run build
```

6. Output Directory 填：

```text
dist
```

### 3. 配置 Vercel 环境变量

进入 Vercel 项目 Settings → Environment Variables，添加：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_AMAP_KEY
VITE_AMAP_SECURITY_CODE
VITE_DATA_MODE=proxy
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

可选：

```text
VITE_KIMI_CLASSIFY_ENDPOINT
```

`VITE_KIMI_CLASSIFY_ENDPOINT` 是后端 Kimi 图片分类接口地址。不要把 Kimi API Key、Supabase service_role、secret key 或高德密钥硬编码到前端代码里。

### 4. 部署后后台和师傅移动端访问地址

```text
后台：https://你的域名.vercel.app/
张师傅：https://你的域名.vercel.app/worker?worker=zhang
李师傅：https://你的域名.vercel.app/worker?worker=li
```

项目已包含 `vercel.json`，会把所有路径 rewrite 到 `/`，避免刷新 `/worker?worker=li` 时 404。

### 5. 真实手机测试流程

1. 打开后台。
2. 点击 Supabase诊断。
3. 点击开始诊断，确认环境变量、表、RLS、Storage 都通过。
4. 点击写入演示数据。
5. 选择李师傅。
6. 勾选点位。
7. 点击发送已选点位到师傅移动端。
8. 手机打开 `/worker?worker=li`。
9. 上传照片。
10. 回后台刷新。
11. 确认点位状态变为“已完成”，照片/视频数量增加。

### 6. Vercel CLI 可选用法

当前机器如果没有安装 Vercel CLI，可以手动安装：

```bash
npm i -g vercel
```

登录：

```bash
vercel login
```

拉取项目配置并本地构建：

```bash
vercel pull
vercel build
```

这些命令会使用 Vercel 项目的环境变量。不要把生成的 `.env.local` 提交到仓库。

---

## 五、测试流程

1. 打开电脑后台。
2. 本地演示时点击“重置本地演示数据”；Supabase 模式下点击“写入演示数据”。
3. 筛选点位。
4. 全选/反选/单选。
5. 选择张师傅或李师傅。
6. 点击“发送已选点位到师傅移动端”。
7. 把对应师傅链接发给手机。
8. 手机端点“高德导航”。
9. 到现场后上传照片/视频。
10. 上传会写入 Storage 和 `point_photos`，点位状态自动变成“已完成”。

---

## 六、当前是测试权限

`schema.sql` 里为了方便你真实手机测试，RLS 是宽松测试策略：匿名可读写。

正式上线必须改成：

- 管理员登录后才能看全部点位
- 张师傅只能看自己的派单
- 李师傅只能看自己的派单
- 照片/视频只能由对应人员上传
- Kimi API Key 不能放前端，要放后端接口

---

## 七、下一版建议

- 登录系统：管理员 / 张师傅 / 李师傅
- 后台项目管理、批量导入 Excel
- 高德地图 JS 地图显示点位
- 后端视频转码
- 图片水印 OCR 自动识别地址
- 操作日志、定位轨迹、停车计时
