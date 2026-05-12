import React, { useState } from "react";

import { API_BASE_URL, DATA_MODE, getDataModeLabel } from "../apiClient";
import { supabaseEnv } from "../supabaseClient";
import { KimiConfig, StabilityCheck } from "../components/shared/legacyModals";
import { cnTime, isWorkerOnline, safeJson } from "../lib/domain";

export function SystemHealthPage({ data, onRunDiagnosis }) {
  const [diagnosis, setDiagnosis] = useState(null);

  async function run() {
    const result = await onRunDiagnosis();
    setDiagnosis(result);
  }

  const releaseInfo = [
    { label: "当前版本", value: import.meta.env.VITE_APP_VERSION || "未配置" },
    { label: "当前环境", value: import.meta.env.VITE_APP_ENV || (import.meta.env.PROD ? "production" : "development") },
    { label: "最近构建时间", value: import.meta.env.VITE_BUILD_TIME || "未配置" },
    { label: "Git commit", value: import.meta.env.VITE_COMMIT_SHA || "未配置" },
    { label: "部署平台", value: import.meta.env.VITE_DEPLOY_PLATFORM || "未配置" },
    { label: "发布说明", value: import.meta.env.VITE_RELEASE_NOTES || "未配置" },
  ];

  const healthItems = [
    { label: "API 状态", value: data.message?.includes("失败") ? "需关注" : "正常", tone: data.message?.includes("失败") ? "danger" : "success" },
    { label: "高德地图状态", value: supabaseEnv.hasAmapKey && supabaseEnv.hasAmapSecurityCode ? "Key 已配置" : "待配置", tone: supabaseEnv.hasAmapKey ? "success" : "warning" },
    { label: "Kimi 状态", value: supabaseEnv.hasKimiClassifyEndpoint ? "已配置代理" : "本地规则兜底", tone: "info" },
    { label: "当前数据模式", value: getDataModeLabel(DATA_MODE), tone: "info" },
    { label: "最近心跳时间", value: cnTime(data.workers.map((worker) => worker.lastSeenAt || worker.last_seen_at).filter(Boolean).sort().at(-1)), tone: "neutral" },
    { label: "在线师傅数量", value: data.workers.filter(isWorkerOnline).length, tone: "success" },
    { label: "最近报错", value: data.message?.includes("失败") ? data.message : "暂无", tone: data.message?.includes("失败") ? "danger" : "success" },
    { label: "前后端连接状态", value: API_BASE_URL || "同源 /api 或本地模式", tone: "info" },
    { label: "上传服务状态", value: "上传后自动完成已接入", tone: "success" },
    { label: "部署环境", value: import.meta.env.PROD ? "生产构建" : "开发 / 测试", tone: "neutral" },
  ];

  return (
    <div className="system-page">
      <section className="health-grid">
        {healthItems.map((item) => (
          <article key={item.label} className={`health-card ${item.tone}`}>
            <span>{item.label}</span>
            <b>{item.value}</b>
          </article>
        ))}
      </section>
      <section className="system-grid">
        <section className="tool-card release-card">
          <div className="section-head">
            <div>
              <h2>版本信息</h2>
              <p>用于确认当前打开的是哪一次构建，方便预览、发布和回滚。</p>
            </div>
          </div>
          <div className="release-info-list">
            {releaseInfo.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}</b>
              </div>
            ))}
          </div>
        </section>
        <KimiConfig />
        <StabilityCheck />
        <section className="tool-card diagnosis-card">
          <div className="section-head">
            <div>
              <h2>系统健康诊断</h2>
              <p>检查数据模式、接口和关键环境变量，不打印真实密钥。</p>
            </div>
            <button className="blue-button" type="button" onClick={run}>开始诊断</button>
          </div>
          <pre className="diagnosis-pre">{safeJson(diagnosis || { mode: DATA_MODE, apiBaseUrl: DATA_MODE === "local" ? "本地模式无需配置" : API_BASE_URL })}</pre>
        </section>
      </section>
    </div>
  );
}
