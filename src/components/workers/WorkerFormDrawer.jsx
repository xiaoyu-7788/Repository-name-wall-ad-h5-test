import React, { useState } from "react";

import { getWorkerTeamTypeName, normalizeCarNo } from "../../apiClient";
import { workerCarNo } from "../../lib/domain";
import { Modal } from "../shared/Modal";
import { Field } from "../shared/Field";

export function WorkerFormDrawer({ worker, projects, onClose, onSave }) {
  const editing = Boolean(worker?.id);
  const [draft, setDraft] = useState({
    ...worker,
    name: worker?.name || "",
    phone: worker?.phone || "",
    carNo: normalizeCarNo(worker?.carNo || worker?.car_no || ""),
    workerKey: worker?.workerKey || worker?.worker_key || worker?.code || "",
    slug: worker?.slug || "",
    teamType: worker?.teamType || "install",
    projectId: worker?.projectId || worker?.project_id || "all",
    enabled: worker?.enabled !== false,
    lng: worker?.lng ?? 113.2644,
    lat: worker?.lat ?? 23.1291,
    speed: worker?.speed ?? 0,
    moving: worker?.moving === true,
    stoppedSeconds: worker?.stoppedSeconds ?? 0,
  });

  function update(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave({
      ...draft,
      worker_key: draft.workerKey,
      code: draft.workerKey,
      carNo: normalizeCarNo(draft.carNo),
      car_no: normalizeCarNo(draft.carNo),
      teamTypeName: getWorkerTeamTypeName(draft),
      lng: Number(draft.lng),
      lat: Number(draft.lat),
      speed: Number(draft.speed || 0),
      stoppedSeconds: Number(draft.stoppedSeconds || 0),
    });
  }

  return (
    <Modal title={editing ? "编辑师傅" : "新增师傅"} subtitle="用于派单、移动端访问和定位同步。" onClose={onClose} wide>
      <form className="worker-form worker-form-modal" onSubmit={submit}>
        {editing && <div className="mini-status">师傅 ID：{worker.id} · 当前车牌：{workerCarNo(worker)}</div>}
        <div className="worker-form-grid">
          <Field label="师傅姓名"><input required value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="张师傅" /></Field>
          <Field label="手机号码"><input required value={draft.phone || ""} onChange={(event) => update("phone", event.target.value)} placeholder="13800000001" /></Field>
          <Field label="车辆编号"><input value={draft.carNo || ""} onChange={(event) => update("carNo", normalizeCarNo(event.target.value))} placeholder="粤A·车001" /></Field>
          <Field label="内部编码"><input value={draft.workerKey || ""} onChange={(event) => update("workerKey", event.target.value)} placeholder="zhang" /></Field>
          <Field label="旧链接 slug"><input value={draft.slug || ""} onChange={(event) => update("slug", event.target.value)} placeholder="仅用于旧链接兼容" /></Field>
          <Field label="队伍类型">
            <select value={draft.teamType} onChange={(event) => update("teamType", event.target.value)}>
              <option value="install">安装队伍</option>
              <option value="wall">找墙队伍</option>
            </select>
          </Field>
          <Field label="所属项目">
            <select value={draft.projectId || "all"} onChange={(event) => update("projectId", event.target.value)}>
              <option value="all">全部项目</option>
              {projects.filter((project) => project.id !== "all").map((project) => (
                <option key={project.id || project.name} value={project.id || project.name}>{project.name}</option>
              ))}
            </select>
          </Field>
          <Field label="经度"><input type="number" step="0.000001" value={draft.lng} onChange={(event) => update("lng", event.target.value)} /></Field>
          <Field label="纬度"><input type="number" step="0.000001" value={draft.lat} onChange={(event) => update("lat", event.target.value)} /></Field>
          <Field label="速度 km/h"><input type="number" value={draft.speed} onChange={(event) => update("speed", event.target.value)} /></Field>
        </div>
        <div className="worker-toggle-row">
          <label><input type="checkbox" checked={draft.enabled} onChange={(event) => update("enabled", event.target.checked)} /> 链接启用</label>
          <label><input type="checkbox" checked={draft.moving} onChange={(event) => update("moving", event.target.checked)} /> 行驶中</label>
        </div>
        <div className="drawer-actions">
          <button type="button" onClick={onClose}>取消</button>
          <button className="blue-button" type="submit">{editing ? "保存师傅" : "新增师傅"}</button>
        </div>
      </form>
    </Modal>
  );
}
