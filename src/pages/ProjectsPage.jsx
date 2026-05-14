import React, { useMemo, useState } from "react";

import { MEDIA_TABS, getPointAnomalies, getPointStatus, getProjectName, normalizeMaterialRules } from "../lib/domain";

const emptyDraft = {
  id: "",
  name: "",
  client: "",
  month: "2026-05",
  color: "#2563eb",
  hidden: false,
  archived: false,
  materialRules: ["现场照片"],
};

export function ProjectsPage({ data, projects, activeProject, setActiveProject, onNavigate }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [monthFilter, setMonthFilter] = useState("全部月份");
  const [query, setQuery] = useState("");

  const monthOptions = useMemo(() => {
    const months = [...new Set(projects.filter((project) => project.id !== "all").map((project) => project.month || "未设置月份"))];
    return ["全部月份", ...months];
  }, [projects]);

  const projectRows = useMemo(() => projects
    .filter((project) => project.id !== "all")
    .filter((project) => monthFilter === "全部月份" || (project.month || "未设置月份") === monthFilter)
    .filter((project) => {
      const haystack = `${project.name || ""} ${project.client || ""} ${project.month || ""}`.toLowerCase();
      return !query.trim() || haystack.includes(query.trim().toLowerCase());
    }), [projects, monthFilter, query]);

  function projectStats(project) {
    const points = data.points.filter((point) => getProjectName(point) === project.name);
    const done = points.filter((point) => getPointStatus(point) === "已完成").length;
    const doing = points.filter((point) => ["已派单", "待施工", "施工中", "已上传素材", "待验收"].includes(getPointStatus(point))).length;
    const risks = points.filter((point) => getPointAnomalies(point, data.photos, data.tasks, data.projects).length).length;
    const rate = points.length ? Math.round((done / points.length) * 100) : 0;
    return { points, done, doing, risks, rate };
  }

  function edit(project) {
    setDraft({
      ...emptyDraft,
      ...project,
      materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name),
    });
  }

  function toggleRule(rule) {
    setDraft((current) => {
      const rules = current.materialRules || [];
      const next = rules.includes(rule) ? rules.filter((item) => item !== rule) : [...rules, rule];
      return { ...current, materialRules: next.length ? next : ["现场照片"] };
    });
  }

  async function save(event) {
    event.preventDefault();
    const name = draft.name.trim();
    if (!name) return;
    const payload = {
      ...draft,
      id: draft.id || name,
      name,
      materialRules: normalizeMaterialRules(draft.materialRules, name),
      material_rules: normalizeMaterialRules(draft.materialRules, name),
    };
    await data.saveProjectDraft(payload);
    setDraft(emptyDraft);
  }

  async function updateProject(project, changes) {
    await data.saveProjectDraft({
      ...project,
      ...changes,
      materialRules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name),
      material_rules: normalizeMaterialRules(project.materialRules || project.material_rules, project.name),
    });
  }

  const summary = {
    total: projectRows.length,
    active: projectRows.filter((project) => !project.hidden && !project.archived).length,
    points: projectRows.reduce((sum, project) => sum + projectStats(project).points.length, 0),
    risks: projectRows.reduce((sum, project) => sum + projectStats(project).risks, 0),
  };

  return (
    <div className="projects-page enterprise-page">
      <header className="enterprise-page-header">
        <div className="enterprise-page-title">
          <span>管理后台 / Projects</span>
          <div className="enterprise-page-heading">项目管理</div>
        </div>
        <div className="enterprise-page-actions">
          <button type="button" className="blue-button" onClick={() => setDraft(emptyDraft)}>新建项目</button>
          <button type="button" onClick={() => onNavigate("points")}>查看点位</button>
        </div>
      </header>

      <section className="projectSummary refined enterprise-kpi-grid">
        <article><span>项目总数</span><b>{summary.total}</b><small>当前可见项目</small></article>
        <article><span>进行中</span><b>{summary.active}</b><small>未隐藏且未归档</small></article>
        <article><span>总点位</span><b>{summary.points}</b><small>跨全部项目</small></article>
        <article><span>异常点位</span><b>{summary.risks}</b><small>需优先处理</small></article>
      </section>

      <section className="enterprise-layout enterprise-two-column project-page-layout">
        <section className="enterprise-card project-list-panel">
          <div className="enterprise-card-header">
            <div>
              <span>项目列表</span>
              <h3>月度分组与进度</h3>
            </div>
          </div>
          <div className="enterprise-toolbar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索项目 / 客户 / 月份" />
            <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
              {monthOptions.map((month) => <option key={month}>{month}</option>)}
            </select>
          </div>
          <div className="project-management-table">
            {projectRows.map((project) => {
              const stats = projectStats(project);
              const active = activeProject === project.name;
              return (
                <article key={project.id || project.name} className={active ? "active" : ""}>
                  <div className="project-row-main">
                    <span className="project-dot" style={{ background: project.color || "#2563eb" }} />
                    <div>
                      <b>{project.name}</b>
                      <small>{project.client || "未填写客户"} · {project.month || "未设置月份"}</small>
                    </div>
                    <strong>{stats.rate}%</strong>
                  </div>
                  <i><em style={{ width: `${stats.rate}%` }} /></i>
                  <div className="project-row-stats">
                    <span>点位 {stats.points.length}</span>
                    <span>推进中 {stats.doing}</span>
                    <span>完成 {stats.done}</span>
                    <span>异常 {stats.risks}</span>
                  </div>
                  <div className="project-rule-list">
                    {normalizeMaterialRules(project.materialRules || project.material_rules, project.name).map((rule) => <span key={rule}>{rule}</span>)}
                  </div>
                  <div className="row-actions">
                    <button type="button" onClick={() => { setActiveProject(project.name); onNavigate("dashboard"); }}>切换项目</button>
                    <button type="button" onClick={() => edit(project)}>编辑</button>
                    <button type="button" onClick={() => updateProject(project, { hidden: !project.hidden })}>{project.hidden ? "恢复显示" : "隐藏"}</button>
                    <button type="button" onClick={() => updateProject(project, { archived: !project.archived })}>{project.archived ? "取消归档" : "归档"}</button>
                  </div>
                </article>
              );
            })}
            {!projectRows.length && <div className="enterprise-empty">暂无项目，或筛选条件过窄。</div>}
          </div>
        </section>

        <form className="enterprise-card project-editor-card" onSubmit={save}>
          <div className="enterprise-card-header">
            <div>
              <span>项目编辑</span>
              <h3>{draft.id ? "编辑项目" : "新建项目"}</h3>
            </div>
          </div>
          <div className="project-form-grid">
            <label><span>项目名称</span><input required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="例如：加多宝村镇墙体项目" /></label>
            <label><span>客户</span><input value={draft.client || ""} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} placeholder="客户名称" /></label>
            <label><span>月份</span><input value={draft.month || ""} onChange={(event) => setDraft((current) => ({ ...current, month: event.target.value }))} placeholder="2026-05" /></label>
            <label><span>项目颜色</span><input type="color" value={draft.color || "#2563eb"} onChange={(event) => setDraft((current) => ({ ...current, color: event.target.value }))} /></label>
          </div>
          <div className="material-rule-editor">
            <b>素材必传规则</b>
            <div>
              {MEDIA_TABS.map((rule) => (
                <label key={rule} className={draft.materialRules?.includes(rule) ? "active" : ""}>
                  <input type="checkbox" checked={draft.materialRules?.includes(rule)} onChange={() => toggleRule(rule)} />
                  {rule}
                </label>
              ))}
            </div>
          </div>
          <div className="drawer-actions">
            <button type="button" onClick={() => setDraft(emptyDraft)}>清空</button>
            <button className="blue-button" type="submit">保存项目</button>
          </div>
        </form>
      </section>
    </div>
  );
}
