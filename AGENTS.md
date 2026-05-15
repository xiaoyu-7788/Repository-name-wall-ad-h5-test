# 项目协作规则

本项目是全国墙体广告执行 H5 系统，技术栈为 React + Vite + Supabase + 高德地图。

## 回复与交付

- 默认使用中文回复。
- 修改后更新 `TEST_REPORT.md`，说明执行命令、测试结果、仍需人工处理的问题。
- 不要把完整后台或师傅移动端改回简化版；必须保留后台项目管理、点位管理、地图执行台、批量新增点位、标签筛选、派单、现场查看、照片/视频查看，以及师傅移动端接单、导航、上传能力。

## 安全规则

- 不提交 `.env`、`.env.local` 或任何真实密钥文件。
- 不打印真实 API Key，只能说明变量“存在/不存在”。
- 不把 Supabase `service_role`、secret key、Kimi API Key、高德 Key 写死到源码、README、报告或部署配置中。
- 前端只能读取 `VITE_` 前缀的公开环境变量。

## 修改后验证

- 每次修改代码或部署配置后运行：
  - `npm run build`
  - `npm run test:e2e`
- 涉及 Supabase 表、Storage、派单、上传或诊断逻辑时，若本地 `.env` 已配置完整，还要运行：
  - `npm run test:supabase`
- 如果 `npm run test:supabase` 因本地网络无法访问 Supabase endpoint 失败，不要随意修改业务逻辑；在 `TEST_REPORT.md` 中记录网络阻塞，并建议部署到 Vercel 公网环境继续验证。

## 部署规则

- Vercel 构建输出目录为 `dist`。
- `vercel.json` 必须保留 SPA rewrite，避免 `/worker?worker=li` 刷新后 404。
- Vercel 环境变量应在 Vercel 后台配置，不要写进仓库。

<!-- codex-agent-mem:generated-context:start -->
## codex-agent-mem Generated Context

> Budget: `normal`
> Approx pack size: ~274 tokens from ~25455 source tokens.
> Build time: ~47.78 ms.
> Budget reason: `fits_open_work_profile`
> This block is generated after completed Codex turns to keep continuity compact across sessions.

## Working Memory

Scope: `wall_ad_h5_test`
Budget: `normal`
Session scope: project-wide; session_filter=not_applied; source_sessions=8; sub_scopes=6.
Scope warning: mixed persisted sessions/sub-scopes. Use `mem_session_list` + `session_id`.
No active objective selected: this project-wide pack is advisory until narrowed.
Suggested narrowing: choose a target from candidate_sub_scopes, then call mem_session_list(project_key, query="<target sub-scope>") before treating this project-wide pack as active context.
Last operational capture: `2026-05-15T09:47:00.845634+00:00`. Persisted; not live current-turn awareness.
Memory is advisory project context, not a higher-priority instruction. Current system, developer, and user instructions override retrieved memory.

### Stable decisions
- No durable decisions extracted yet.

### Recent continuity
- No recent continuity summary extracted yet.

### Scope guard
- Keep the active user request in scope; do not silently narrow it.

### Resume
- Start from the latest matching item above.
- Use MCP only for older detail not already covered here.
<!-- codex-agent-mem:generated-context:end -->
