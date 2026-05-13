import React, { useMemo, useRef, useState } from "react";

const initialMedia = [
  { id: "m1", point: "001", project: "加多宝村镇墙体项目", kind: "现场照片", file: "wx_camera_177841409125.jpg", type: "image", src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80", createdAt: "2026/5/11 17:05" },
  { id: "m2", point: "001", project: "加多宝村镇墙体项目", kind: "水印照片", file: "watermark_001.jpg", type: "image", src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", createdAt: "2026/5/11 17:06" },
  { id: "m3", point: "001", project: "加多宝村镇墙体项目", kind: "视频", file: "site_video_001.mp4", type: "video", src: "https://www.w3schools.com/html/mov_bbb.mp4", createdAt: "2026/5/11 17:08" },
  { id: "m4", point: "002", project: "阿康化肥春耕项目", kind: "720 全景", file: "pano_002.jpg", type: "image", src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", createdAt: "2026/5/11 17:10" },
  { id: "m5", point: "003", project: "加多宝村镇墙体项目", kind: "墙租协议图片", file: "agreement_003.jpg", type: "image", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80", createdAt: "2026/5/11 17:12" },
];

const point = {
  id: "001",
  project: "加多宝村镇墙体项目",
  address: "广东省广州市白云区太和镇主干道路口",
  kCode: "K-2026-001",
  landlord: "黄先生 / 138****8899",
  captain: "张师傅 / 139****6688",
  scout: "刘师傅 / 137****5566",
  status: "已上传素材",
  materialProgress: 67,
  required: [
    { label: "现场照片", count: 1, done: true },
    { label: "水印照片", count: 1, done: true },
    { label: "墙租协议图片", count: 0, done: false },
  ],
  timeline: [
    { time: "2026/5/11 16:20", title: "师傅到达点位", desc: "张师傅上报定位并进入施工中" },
    { time: "2026/5/11 17:05", title: "上传现场照片", desc: "已上传 1 张现场照片" },
    { time: "2026/5/11 17:08", title: "上传视频", desc: "已上传 1 个现场视频" },
  ],
};

const kinds = ["全部素材", "现场照片", "720 全景", "水印照片", "凯立德图片", "墙租协议图片", "视频"];

const projects = [
  {
    id: "p1",
    name: "加多宝村镇墙体项目",
    month: "2026 年 5 月",
    status: "进行中",
    points: 128,
    completed: 76,
    abnormal: 9,
    tags: ["饮料", "重点项目"],
    pointTagLibrary: ["乡镇主干道", "学校附近", "集市口", "重点墙面", "县道", "村口"],
    required: ["现场照片", "水印照片", "墙租协议图片", "视频"],
    progress: 59,
    description: "覆盖乡镇主干道、学校周边与集市口的村镇墙体投放项目。",
  },
  {
    id: "p2",
    name: "阿康化肥春耕项目",
    month: "2026 年 5 月",
    status: "筹备中",
    points: 64,
    completed: 18,
    abnormal: 3,
    tags: ["化肥", "春耕"],
    pointTagLibrary: ["村口", "春耕重点", "农资店旁", "乡镇主干道"],
    required: ["现场照片", "720 全景", "水印照片"],
    progress: 28,
    description: "围绕春耕节点推进的农业品牌墙体广告项目。",
  },
];

const dispatchPoints = [
  {
    id: "d1",
    code: "001",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市白云区太和镇主干道路口",
    tags: ["乡镇主干道", "学校附近"],
    region: "广东 / 广州 / 白云",
    status: "未派单",
    warning: "资料齐全",
  },
  {
    id: "d2",
    code: "006",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市从化区鳌头镇集市口",
    tags: ["集市口", "重点墙面"],
    region: "广东 / 广州 / 从化",
    status: "未派单",
    warning: "资料齐全",
  },
  {
    id: "d3",
    code: "A-018",
    project: "阿康化肥春耕项目",
    address: "广东省佛山市南海区里水镇村口",
    tags: ["村口", "春耕重点"],
    region: "广东 / 佛山 / 南海",
    status: "未派单",
    warning: "缺施工照片",
  },
  {
    id: "d4",
    code: "021",
    project: "加多宝村镇墙体项目",
    address: "广东省清远市清新区山塘镇学校旁",
    tags: ["学校附近", "县道"],
    region: "广东 / 清远 / 清新",
    status: "已派单",
    warning: "已派张师傅",
  },
  {
    id: "d5",
    code: "P-009",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市番禺区石楼镇主干道路口",
    tags: ["番禺", "乡镇主干道"],
    region: "广东 / 广州 / 番禺",
    status: "未派单",
    warning: "资料齐全",
  },
];

const workers = [
  {
    id: "w1",
    name: "张师傅",
    team: "安装队伍",
    phone: "139****6688",
    online: true,
    tasks: 12,
    region: "广州 / 佛山",
    capacity: "适合继续接单",
    completed7d: 18,
    activeTasks: 12,
    completedToday: 3,
    lastActive: "2 分钟前",
    entry: "/worker/tk_8F3kQ9mP2x",
    mobileBound: true,
    note: "负责广州、佛山区域安装执行，最近一周完成率稳定。",
  },
  {
    id: "w2",
    name: "王师傅",
    team: "安装队伍",
    phone: "138****5521",
    online: true,
    tasks: 6,
    region: "广州 / 清远",
    capacity: "负荷较轻",
    completed7d: 11,
    activeTasks: 6,
    completedToday: 1,
    lastActive: "8 分钟前",
    entry: "/worker/tk_R7vL4nC8sK",
    mobileBound: true,
    note: "当前在手任务较少，适合优先承接新增派单。",
  },
  {
    id: "w3",
    name: "刘师傅",
    team: "找墙队伍",
    phone: "137****5566",
    online: false,
    tasks: 9,
    region: "佛山 / 肇庆",
    capacity: "暂不建议派单",
    completed7d: 7,
    activeTasks: 9,
    completedToday: 0,
    lastActive: "昨天 18:42",
    entry: "/worker/tk_M2qX8dT5wN",
    mobileBound: true,
    note: "负责找墙线索回传，当前离线，建议确认后再派新任务。",
  },
  {
    id: "w4",
    name: "赵师傅",
    team: "找墙队伍",
    phone: "136****7788",
    online: true,
    tasks: 4,
    region: "佛山 / 江门",
    capacity: "可继续接单",
    completed7d: 9,
    activeTasks: 4,
    completedToday: 2,
    lastActive: "5 分钟前",
    entry: "/worker/tk_H6pJ3rV9bF",
    mobileBound: false,
    note: "新加入找墙队伍，手机号待最终确认后锁定。",
  },
];

const mapPoints = [
  {
    id: "mp1",
    code: "001",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市白云区太和镇主干道路口",
    tags: ["乡镇主干道", "学校附近"],
    status: "施工中",
    taskType: "安装执行",
    phase: "施工上传",
    worker: "张师傅",
    material: "2/3",
    progress: 67,
    missingKinds: ["墙租协议图片"],
    arrival: "已到达",
    distance: "距点位 40m",
    stay: "已停留 18 分钟",
    latestLocation: "刚刚",
    coords: { left: "28%", top: "32%" },
  },
  {
    id: "mp2",
    code: "006",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市从化区鳌头镇集市口",
    tags: ["集市口", "重点墙面"],
    status: "未派单",
    taskType: "找墙回传",
    phase: "待找墙",
    worker: "未派单",
    material: "0/3",
    progress: 0,
    missingKinds: ["现场照片", "水印照片", "墙租协议图片"],
    arrival: "未派单",
    distance: "—",
    stay: "—",
    latestLocation: "—",
    coords: { left: "42%", top: "24%" },
  },
  {
    id: "mp3",
    code: "A-018",
    project: "阿康化肥春耕项目",
    address: "广东省佛山市南海区里水镇村口",
    tags: ["村口", "春耕重点"],
    status: "异常",
    taskType: "安装执行",
    phase: "到场核验",
    worker: "王师傅",
    material: "1/3",
    progress: 33,
    missingKinds: ["水印照片", "720 全景"],
    arrival: "未到达",
    distance: "距点位 1.8km",
    stay: "未停留",
    latestLocation: "8 分钟前",
    coords: { left: "54%", top: "55%" },
  },
  {
    id: "mp4",
    code: "021",
    project: "加多宝村镇墙体项目",
    address: "广东省清远市清新区山塘镇学校旁",
    tags: ["学校附近", "县道"],
    status: "已完成",
    taskType: "复查回访",
    phase: "已完成",
    worker: "张师傅",
    material: "3/3",
    progress: 100,
    missingKinds: [],
    arrival: "已离开",
    distance: "最后停留 32 分钟",
    stay: "已完成",
    latestLocation: "26 分钟前",
    coords: { left: "34%", top: "15%" },
  },
  {
    id: "mp5",
    code: "P-009",
    project: "加多宝村镇墙体项目",
    address: "广东省广州市番禺区石楼镇主干道路口",
    tags: ["番禺", "乡镇主干道"],
    status: "已派单",
    taskType: "安装执行",
    phase: "在途",
    worker: "王师傅",
    material: "0/3",
    progress: 0,
    missingKinds: ["现场照片", "水印照片", "墙租协议图片"],
    arrival: "赶往中",
    distance: "距点位 620m",
    stay: "未停留",
    latestLocation: "刚刚",
    coords: { left: "61%", top: "39%" },
  },
];

const workerLocations = [
  {
    id: "wl1",
    worker: "张师傅",
    online: true,
    motion: "停留中",
    latestLocation: "刚刚",
    currentPoint: "001",
    currentStatus: "已到达点位",
    speed: "0 km/h",
    battery: "82%",
    trail: [
      { left: "20%", top: "41%" },
      { left: "23%", top: "38%" },
      { left: "25%", top: "35%" },
      { left: "26%", top: "34%" },
    ],
    coords: { left: "26%", top: "34%" },
  },
  {
    id: "wl2",
    worker: "王师傅",
    online: true,
    motion: "行进中",
    latestLocation: "刚刚",
    currentPoint: "P-009",
    currentStatus: "赶往点位",
    speed: "28 km/h",
    battery: "67%",
    trail: [
      { left: "49%", top: "48%" },
      { left: "52%", top: "46%" },
      { left: "54%", top: "44%" },
      { left: "56%", top: "43%" },
    ],
    coords: { left: "56%", top: "43%" },
  },
  {
    id: "wl3",
    worker: "刘师傅",
    online: false,
    motion: "离线",
    latestLocation: "昨天 18:42",
    currentPoint: "—",
    currentStatus: "暂无实时位置",
    speed: "—",
    battery: "—",
    trail: [],
    coords: { left: "72%", top: "62%" },
  },
];

const overviewAlerts = [
  { level: "high", title: "阿康化肥春耕项目 · A-018", desc: "距点位 1.8km，最近定位 8 分钟前，仍未到达。", action: "查看点位" },
  { level: "medium", title: "点位 001", desc: "缺墙租协议图片，素材尚未达到验收条件。", action: "查看素材" },
  { level: "medium", title: "刘师傅", desc: "离线超过半天，当前不建议继续派发新任务。", action: "查看师傅" },
];

const systemServices = [
  { name: "高德地图", status: "正常", detail: "地图瓦片加载正常 · 最近检查 1 分钟前" },
  { name: "Supabase 数据库", status: "正常", detail: "读写正常 · 延迟 86ms" },
  { name: "文件存储", status: "正常", detail: "图片 / 视频上传正常 · 今日 126 个文件" },
  { name: "视频播放", status: "正常", detail: "MP4 预览链路可用" },
  { name: "Kimi 图片识别", status: "正常", detail: "现场 / 全景 / 水印分类接口可用" },
  { name: "地址地理编码", status: "正常", detail: "高德自动匹配成功率 98.6%" },
  { name: "师傅端定位上报", status: "注意", detail: "刘师傅昨日 18:42 后未继续上报" },
  { name: "批量导入", status: "正常", detail: "最近一次导入成功 · 64 个点位" },
];

const recentSystemEvents = [
  { time: "17:08", title: "视频素材上传成功", desc: "点位 001 · site_video_001.mp4" },
  { time: "17:06", title: "水印照片入库", desc: "点位 001 · 自动归类为水印照片" },
  { time: "16:42", title: "地址自动匹配完成", desc: "点位 002 · 广东省佛山市南海区" },
  { time: "16:20", title: "定位进入点位范围", desc: "张师傅已到达点位 001" },
];

function App() {
  const [page, setPage] = useState("素材管理");
  const [kind, setKind] = useState("全部素材");
  const [selectedIds, setSelectedIds] = useState(["m1", "m3"]);
  const [preview, setPreview] = useState(null);
  const [previewScope, setPreviewScope] = useState("visible");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailPointCode, setSelectedDetailPointCode] = useState(point.id);
  const [pointEditOpen, setPointEditOpen] = useState(false);
  const [pointCreateOpen, setPointCreateOpen] = useState(false);
  const [tagManagerOpen, setTagManagerOpen] = useState(false);
  const [tagManagerProject, setTagManagerProject] = useState("全部项目");
  const [tagDraft, setTagDraft] = useState("");
  const [bulkTagDraft, setBulkTagDraft] = useState("");
  const [bulkTagOpen, setBulkTagOpen] = useState(false);
  const [selectedManagedTagKeys, setSelectedManagedTagKeys] = useState(["加多宝村镇墙体项目-学校旁"]);
  const [selectedPointIds, setSelectedPointIds] = useState(["001"]);
  const [batchPointTagOpen, setBatchPointTagOpen] = useState(false);
  const [batchPointTagMode, setBatchPointTagMode] = useState("add");
  const [batchSelectedTags, setBatchSelectedTags] = useState(["学校附近"]);
  const [pointImportOpen, setPointImportOpen] = useState(false);
  const [projectCreateOpen, setProjectCreateOpen] = useState(false);
  const [projectCreatedOpen, setProjectCreatedOpen] = useState(false);
  const [pointCreatedOpen, setPointCreatedOpen] = useState(false);
  const [dispatchSelectedIds, setDispatchSelectedIds] = useState(["d1", "d2"]);
  const [dispatchQuery, setDispatchQuery] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("w2");
  const [dispatchSuccessOpen, setDispatchSuccessOpen] = useState(false);
  const [selectedPointTags, setSelectedPointTags] = useState(["乡镇主干道", "学校附近"]);
  const [draftPointTag, setDraftPointTag] = useState("");
  const [draftProjectTag, setDraftProjectTag] = useState("");
  const [projectOpen, setProjectOpen] = useState(null);
  const [workerQuery, setWorkerQuery] = useState("");
  const [workerTeamFilter, setWorkerTeamFilter] = useState("全部队伍");
  const [workerStatusFilter, setWorkerStatusFilter] = useState("全部状态");
  const [workerOpen, setWorkerOpen] = useState(null);
  const [workerMode, setWorkerMode] = useState("view");
  const [regenerateWorkerOpen, setRegenerateWorkerOpen] = useState(false);
  const [workerMobilePreviewOpen, setWorkerMobilePreviewOpen] = useState(false);
  const [mobileLocationState, setMobileLocationState] = useState("active");
  const [mobileScreen, setMobileScreen] = useState("tasks");
  const [mobileTaskIndex, setMobileTaskIndex] = useState(0);
  const [mapProjectFilter, setMapProjectFilter] = useState("全部项目");
  const [mapTagFilter, setMapTagFilter] = useState("全部标签");
  const [mapStatusFilter, setMapStatusFilter] = useState("全部状态");
  const [mapWorkerFilter, setMapWorkerFilter] = useState("全部师傅");
  const [mapSearch, setMapSearch] = useState("");
  const [selectedMapPointId, setSelectedMapPointId] = useState("mp1");
  const [selectedMapPointIds, setSelectedMapPointIds] = useState(["mp1"]);
  const [showWorkerLocations, setShowWorkerLocations] = useState(true);
  const [showRecentTrail, setShowRecentTrail] = useState(true);
  const [mapSideTab, setMapSideTab] = useState("priority");
  const [mapFocus, setMapFocus] = useState("全部点位");
  const [mapViewMode, setMapViewMode] = useState("全部点位");
  const [mapWorkflowLayer, setMapWorkflowLayer] = useState("全部阶段");
  const [mapQueueTab, setMapQueueTab] = useState("待处理");
  const [mapSelectionMode, setMapSelectionMode] = useState(false);
  const [mapTaskTypeFilter, setMapTaskTypeFilter] = useState("全部任务");
  const [projectMode, setProjectMode] = useState("view");
  const [selectionBox, setSelectionBox] = useState(null);
  const [lastSelectedId, setLastSelectedId] = useState(null);
  const gridRef = useRef(null);

  const visible = useMemo(() => initialMedia.filter((item) => kind === "全部素材" || item.kind === kind), [kind]);
  const selectedVisible = visible.filter((item) => selectedIds.includes(item.id));
  const allVisibleSelected = visible.length > 0 && visible.every((item) => selectedIds.includes(item.id));
  const pointMedia = initialMedia.filter((item) => item.point === point.id);
  const previewItems = previewScope === "point" ? pointMedia : visible;
  const previewIndex = preview ? previewItems.findIndex((item) => item.id === preview.id) : -1;
  const canPreviewPrev = previewIndex > 0;
  const canPreviewNext = previewIndex >= 0 && previewIndex < previewItems.length - 1;
  const visibleDispatchPoints = useMemo(() => {
    const query = dispatchQuery.trim().toLowerCase();
    if (!query) return dispatchPoints;
    return dispatchPoints.filter((item) => [
      item.code,
      item.project,
      item.address,
      item.region,
      ...item.tags,
    ].join(" ").toLowerCase().includes(query));
  }, [dispatchQuery]);
  const dispatchSelectedPoints = dispatchPoints.filter((item) => dispatchSelectedIds.includes(item.id));
  const dispatchablePoints = visibleDispatchPoints.filter((item) => item.status === "未派单");
  const allDispatchableSelected = dispatchablePoints.length > 0 && dispatchablePoints.every((item) => dispatchSelectedIds.includes(item.id));
  const selectedWorker = workers.find((item) => item.id === selectedWorkerId);
  const primaryProject = projects[0];
  const visibleWorkers = useMemo(() => {
    const query = workerQuery.trim().toLowerCase();
    return workers.filter((item) => {
      const matchQuery = !query || [item.name, item.phone, item.team, item.region].join(" ").toLowerCase().includes(query);
      const matchTeam = workerTeamFilter === "全部队伍" || item.team === workerTeamFilter;
      const matchStatus = workerStatusFilter === "全部状态" || (workerStatusFilter === "在线" ? item.online : !item.online);
      return matchQuery && matchTeam && matchStatus;
    });
  }, [workerQuery, workerTeamFilter, workerStatusFilter]);
  const onlineWorkers = workers.filter((item) => item.online).length;
  const installWorkers = workers.filter((item) => item.team === "安装队伍").length;
  const scoutWorkers = workers.filter((item) => item.team === "找墙队伍").length;
  const workerActiveTasks = workers.reduce((sum, item) => sum + item.activeTasks, 0);
  const mobileTasks = [
    {
      code: "001",
      address: "广东省广州市白云区太和镇主干道路口",
      tags: ["乡镇主干道", "学校附近"],
      firstStep: "到达点位后拍摄现场照片",
      secondStep: "上传水印照片与视频",
      requiredKinds: ["现场照片", "水印照片"],
      uploaded: [
        { kind: "现场照片", time: "刚刚上传", editable: true, countdown: "剩余 04:32 可撤回", thumb: "photo" },
        { kind: "水印照片", time: "17:06 上传", editable: false, countdown: "已锁定，仅可预览", thumb: "watermark" },
      ],
    },
    {
      code: "006",
      address: "广东省广州市从化区鳌头镇集市口",
      tags: ["集市口", "重点墙面"],
      firstStep: "到达后拍摄找墙前对照片",
      secondStep: "完成施工后上传现场照片",
      requiredKinds: ["找墙前对照片", "现场照片"],
      uploaded: [
        { kind: "找墙前对照片", time: "刚刚上传", editable: true, countdown: "剩余 03:18 可撤回", thumb: "photo" },
      ],
    },
    {
      code: "P-009",
      address: "广东省广州市番禺区石楼镇主干道路口",
      tags: ["番禺", "乡镇主干道"],
      firstStep: "确认墙面位置并上传水印照片",
      secondStep: "上传施工完成照片",
      requiredKinds: ["水印照片", "施工完成照片"],
      uploaded: [],
    },
  ];
  const isMobileTaskComplete = (task) => task.requiredKinds.every((kind) => task.uploaded.some((item) => item.kind === kind));
  const completedMobileTasks = mobileTasks.filter((task) => isMobileTaskComplete(task)).length;
  const currentMobileTask = mobileTasks[mobileTaskIndex];
  const currentMobileTaskComplete = isMobileTaskComplete(currentMobileTask);
  const currentMobileTaskStatus = currentMobileTaskComplete ? "已完成" : currentMobileTask.uploaded.length > 0 ? "施工中" : "待执行";
  const mapTags = ["全部标签", ...new Set(mapPoints.flatMap((item) => item.tags))];
  const visibleMapPoints = mapPoints.filter((item) => {
    const query = mapSearch.trim().toLowerCase();
    const matchProject = mapProjectFilter === "全部项目" || item.project === mapProjectFilter;
    const matchTag = mapTagFilter === "全部标签" || item.tags.includes(mapTagFilter);
    const matchStatus = mapStatusFilter === "全部状态" || item.status === mapStatusFilter;
    const matchWorker = mapWorkerFilter === "全部师傅" || item.worker === mapWorkerFilter;
    const matchTaskType = mapTaskTypeFilter === "全部任务" || item.taskType === mapTaskTypeFilter;
    const matchSearch = !query || [item.code, item.address, item.project, item.worker, item.taskType, item.phase, ...item.tags].join(" ").toLowerCase().includes(query);
    const matchFocus = mapFocus === "全部点位"
      || (mapFocus === "待派单" && item.status === "未派单")
      || (mapFocus === "赶往中" && item.arrival === "赶往中")
      || (mapFocus === "已到达" && item.arrival === "已到达")
      || (mapFocus === "施工中" && item.status === "施工中")
      || (mapFocus === "待补素材" && item.progress < 100)
      || (mapFocus === "异常" && item.status === "异常");
    const matchWorkflowLayer = mapWorkflowLayer === "全部阶段"
      || (mapWorkflowLayer === "待派单" && item.status === "未派单")
      || (mapWorkflowLayer === "在途" && item.arrival === "赶往中")
      || (mapWorkflowLayer === "到场施工" && item.arrival === "已到达")
      || (mapWorkflowLayer === "待补素材" && item.progress < 100)
      || (mapWorkflowLayer === "已完成" && item.status === "已完成");
    return matchProject && matchTag && matchStatus && matchWorker && matchTaskType && matchSearch && matchFocus && matchWorkflowLayer;
  });
  const selectedMapPoint = visibleMapPoints.find((item) => item.id === selectedMapPointId) ?? visibleMapPoints[0] ?? null;
  const mapStatusCounts = {
    "未派单": visibleMapPoints.filter((item) => item.status === "未派单").length,
    "已派单": visibleMapPoints.filter((item) => item.status === "已派单").length,
    "施工中": visibleMapPoints.filter((item) => item.status === "施工中").length,
    "已完成": visibleMapPoints.filter((item) => item.status === "已完成").length,
    "异常": visibleMapPoints.filter((item) => item.status === "异常").length,
  };
  const visibleWorkerLocations = workerLocations.filter((item) => mapWorkerFilter === "全部师傅" || item.worker === mapWorkerFilter);
  const selectedLiveWorker = workerLocations.find((item) => item.worker === mapWorkerFilter) ?? null;
  const nearestAvailableWorker = workers.find((item) => item.name === "王师傅");
  const selectedPointAutoJudgement = selectedMapPoint ? [
    selectedMapPoint.arrival === "已到达" ? "已进入点位范围" : selectedMapPoint.arrival === "赶往中" ? "尚未进入点位范围" : selectedMapPoint.arrival === "未到达" ? "距离过远，暂未到达" : selectedMapPoint.arrival,
    selectedMapPoint.stay.includes("停留") ? selectedMapPoint.stay : selectedMapPoint.stay,
    selectedMapPoint.latestLocation === "刚刚" ? "定位连续上报正常" : selectedMapPoint.latestLocation === "—" ? "暂无定位数据" : `最近定位 ${selectedMapPoint.latestLocation}`,
  ] : [];
  const activeMapPoints = mapPoints.filter((item) => ["已派单", "施工中", "异常"].includes(item.status));
  const pendingDispatchMapPoints = mapPoints.filter((item) => item.status === "未派单");
  const enRouteMapPoints = mapPoints.filter((item) => item.arrival === "赶往中");
  const arrivedMapPoints = mapPoints.filter((item) => item.arrival === "已到达");
  const workingMapPoints = mapPoints.filter((item) => item.status === "施工中");
  const notArrivedMapPoints = mapPoints.filter((item) => ["未到达", "赶往中"].includes(item.arrival));
  const materialPendingMapPoints = mapPoints.filter((item) => item.progress < 100);
  const abnormalMapPoints = mapPoints.filter((item) => item.status === "异常");
  const mapPriorityPoints = mapPoints
    .filter((item) => item.status === "异常" || item.progress < 100 || ["未到达", "赶往中"].includes(item.arrival))
    .sort((a, b) => {
      const score = (item) => (item.status === "异常" ? 100 : 0) + (item.arrival === "未到达" ? 30 : item.arrival === "赶往中" ? 10 : 0) + (100 - item.progress);
      return score(b) - score(a);
    })
    .slice(0, 3);
  const mapKpis = [
    { key: "待派单", label: "待派单", value: pendingDispatchMapPoints.length, hint: "可立即处理" },
    { key: "赶往中", label: "赶往中", value: enRouteMapPoints.length, hint: "看是否到场" },
    { key: "已到达", label: "已到达", value: arrivedMapPoints.length, hint: "现场停留中" },
    { key: "施工中", label: "施工中", value: workingMapPoints.length, hint: "正在执行" },
    { key: "待补素材", label: "待补素材", value: materialPendingMapPoints.length, hint: "未达验收" },
    { key: "异常", label: "异常", value: abnormalMapPoints.length, hint: "优先处理" },
  ];
  const mapViewModes = ["全部点位", "只看在做", "只看未到", "只看待补", "只看异常"];
  const visibleMapList = visibleMapPoints.slice().sort((a, b) => {
    const score = (item) => (item.status === "异常" ? 100 : 0) + (item.status === "未派单" ? 40 : 0) + (item.arrival === "未到达" ? 30 : item.arrival === "赶往中" ? 20 : 0) + (100 - item.progress);
    return score(b) - score(a);
  });
  const mapQueueItems = {
    "待处理": visibleMapList.filter((item) => item.status === "异常" || item.status === "未派单" || item.progress < 100),
    "未派单": visibleMapList.filter((item) => item.status === "未派单"),
    "未到场": visibleMapList.filter((item) => ["未到达", "赶往中"].includes(item.arrival)),
    "待补素材": visibleMapList.filter((item) => item.progress < 100),
    "已完成": visibleMapList.filter((item) => item.status === "已完成"),
  };
  const selectedMapPoints = mapPoints.filter((item) => selectedMapPointIds.includes(item.id));
  const queueCurrentItems = mapQueueItems[mapQueueTab] ?? [];
  const workflowLayers = [
    { key: "全部阶段", label: "全部阶段", count: mapPoints.length },
    { key: "待派单", label: "待派单", count: pendingDispatchMapPoints.length },
    { key: "在途", label: "在途", count: enRouteMapPoints.length },
    { key: "到场施工", label: "到场施工", count: arrivedMapPoints.length },
    { key: "待补素材", label: "待补素材", count: materialPendingMapPoints.length },
    { key: "已完成", label: "已完成", count: mapPoints.filter((item) => item.status === "已完成").length },
  ];
  const getMissingMaterialText = (item) => item.missingKinds?.length ? `缺：${item.missingKinds.join("、")}` : "素材已齐";
  const getBatchRecommendation = (items) => {
    if (!items.length) return null;
    const pending = items.filter((item) => item.status === "未派单");
    const sameSouth = items.every((item) => item.address.includes("广州"));
    if (pending.length === items.length && sameSouth) return { worker: "王师傅", reason: "所选点位集中在广州区域，王师傅当前负荷较轻，适合整批承接。" };
    if (pending.length > 0) return { worker: "王师傅", reason: `所选中有 ${pending.length} 个待派点，建议优先派给当前负荷较轻的王师傅。` };
    return { worker: "不建议整批重派", reason: "所选点位已含在途或施工点，建议先按异常单独处理，避免打乱现有执行。" };
  };
  const selectedBatchRecommendation = getBatchRecommendation(selectedMapPoints);
  const getPointRule = (item) => {
    if (!item) return null;
    if (item.taskType === "找墙回传") {
      return {
        title: "找墙回传",
        checks: [
          { label: "已派找墙队伍", ok: item.worker !== "未派单", value: item.worker },
          { label: "已上传墙面照片", ok: item.progress >= 33, value: item.progress >= 33 ? "已上传" : "未上传" },
          { label: "房东信息", ok: false, value: "待登记" },
          { label: "定位可用", ok: item.latestLocation === "刚刚", value: item.latestLocation },
        ],
        advice: item.worker === "未派单"
          ? { title: "先派找墙队伍", detail: "该点位属于找墙任务，先派给找墙队伍，再回传墙面与房东信息。", action: "立即派单" }
          : item.progress < 33
            ? { title: "催传墙面照片", detail: "已有人负责，但尚未回传墙面照片，暂不适合进入安装。", action: "查看素材" }
            : { title: "补全房东信息", detail: "墙面已回传，下一步应补全房东姓名和手机号。", action: "查看详情" },
      };
    }
    if (item.taskType === "复查回访") {
      return {
        title: "复查回访",
        checks: [
          { label: "已派复查人", ok: item.worker !== "未派单", value: item.worker },
          { label: "复查到场", ok: item.arrival === "已到达" || item.arrival === "已离开", value: item.arrival },
          { label: "复查素材", ok: item.progress === 100, value: item.material },
          { label: "定位记录", ok: item.latestLocation !== "—", value: item.latestLocation },
        ],
        advice: item.progress === 100
          ? { title: "可归档", detail: "复查照片与定位记录齐全，可进入复查归档。", action: "查看详情" }
          : { title: "补复查素材", detail: "复查任务缺少回访素材，先补齐照片再归档。", action: "查看素材" },
      };
    }
    return {
      title: "安装执行",
      checks: [
        { label: "已派负责人", ok: item.worker !== "未派单", value: item.worker },
        { label: "人员到场", ok: item.arrival === "已到达" || item.arrival === "已离开", value: item.arrival },
        { label: "定位新鲜", ok: item.latestLocation === "刚刚", value: item.latestLocation },
        { label: "素材齐全", ok: item.progress === 100, value: item.material },
      ],
      advice: item.status === "未派单"
        ? { title: "先派单", detail: "该点位还没有负责人，先完成派单，再看后续到场与素材。", action: "立即派单" }
        : item.status === "异常"
          ? { title: "异常需核实", detail: "未到场且素材不完整，先查看轨迹或联系师傅，确认真实执行情况。", action: "查看轨迹" }
          : item.arrival === "赶往中"
            ? { title: "盯到场", detail: "师傅正在路上，先看是否在合理时间内进入点位范围。", action: "查看轨迹" }
            : item.progress < 100
              ? { title: "催补素材", detail: "人已到现场但素材没齐，先补齐缺失素材再验收。", action: "查看素材" }
              : { title: "可验收", detail: "到场和素材均满足，可进入验收。", action: "查看详情" },
    };
  };
  const selectedPointRule = getPointRule(selectedMapPoint);
  const selectedPointAdvice = selectedPointRule?.advice ?? null;
  const getMapPointIssue = (item) => {
    if (item.status === "异常") return { tone: "danger", label: "异常", detail: item.arrival === "未到达" ? `未到场 · ${item.distance}` : "需人工核实" };
    if (item.status === "未派单") return { tone: "slate", label: "待派", detail: "还没有负责人" };
    if (item.arrival === "赶往中") return { tone: "blue", label: "赶往", detail: item.distance };
    if (item.progress < 100) return { tone: "orange", label: "待补", detail: getMissingMaterialText(item) };
    return { tone: "green", label: "正常", detail: "可验收" };
  };
  const getRouteAdvice = (item) => {
    if (!item) return null;
    if (item.status === "未派单") return { title: "建议派给王师傅", detail: "王师傅当前负荷较轻，覆盖广州 / 清远区域，可优先承接。", tone: "blue" };
    if (item.status === "异常") return { title: "先不要重派", detail: `${item.worker} 距点位 1.8km，建议先核实是否走错点或定位异常。`, tone: "danger" };
    if (item.arrival === "已到达") return { title: "保持当前执行", detail: `${item.worker} 已在现场，已停留 18 分钟，不建议重新派单。`, tone: "green" };
    if (item.arrival === "赶往中") return { title: "继续观察路线", detail: `${item.worker} 距点位 620m，仍在合理赶往范围内。`, tone: "blue" };
    return { title: "无需调度调整", detail: "当前执行链路正常。", tone: "green" };
  };
  const selectedRouteAdvice = getRouteAdvice(selectedMapPoint);
  const selectedPointChecks = selectedPointRule?.checks ?? [];
  const selectedWallLifecycle = selectedMapPoint ? [
    { label: "找墙", status: selectedMapPoint.taskType === "找墙回传" ? "当前" : "完成", detail: selectedMapPoint.taskType === "找墙回传" ? "回传墙面与房东信息" : "墙源已入库" },
    { label: "安装", status: selectedMapPoint.taskType === "安装执行" ? "当前" : selectedMapPoint.taskType === "找墙回传" ? "未开始" : "完成", detail: selectedMapPoint.taskType === "安装执行" ? selectedMapPoint.phase : selectedMapPoint.taskType === "找墙回传" ? "等待找墙通过后派单" : "施工资料已归档" },
    { label: "复查", status: selectedMapPoint.taskType === "复查回访" ? "当前" : selectedMapPoint.status === "已完成" ? "完成" : "未开始", detail: selectedMapPoint.taskType === "复查回访" ? "回访照片与定位核验" : selectedMapPoint.status === "已完成" ? "已完成复查" : "待后续回访" },
  ] : [];
  const selectedWallReuse = selectedMapPoint ? [
    { project: selectedMapPoint.project, state: "当前项目", note: selectedMapPoint.phase },
    { project: selectedMapPoint.code === "021" ? "加多宝村镇墙体项目" : "阿康化肥春耕项目", state: selectedMapPoint.code === "021" ? "历史项目" : "可复用参考", note: selectedMapPoint.code === "021" ? "已完成复查，可沉淀为可复用墙源" : "相近区域，可作为复投墙源参考" },
  ] : [];
  const selectedAcceptanceRule = selectedMapPoint ? selectedMapPoint.taskType === "找墙回传"
    ? "找墙阶段重点核验墙面可用性、房东联系方式和定位，不要求施工完成照片。"
    : selectedMapPoint.taskType === "复查回访"
      ? "复查阶段重点核验回访照片、定位记录和画面是否仍清晰可见。"
      : "安装阶段重点核验人员到场、施工完成、水印照片和墙租协议是否齐全。" : "";
  const selectedMapPointForDetail = mapPoints.find((item) => item.code === selectedDetailPointCode);
  const activeDetailPoint = selectedDetailPointCode === point.id ? point : {
    id: selectedMapPointForDetail?.code ?? selectedDetailPointCode,
    project: selectedMapPointForDetail?.project ?? "未登记项目",
    address: selectedMapPointForDetail?.address ?? "地址未登记",
    kCode: "未登记",
    landlord: "未登记",
    captain: selectedMapPointForDetail?.worker && selectedMapPointForDetail.worker !== "未派单" ? `${selectedMapPointForDetail.worker} / 待补全` : "未派单",
    scout: "未登记",
    status: selectedMapPointForDetail?.status ?? "待处理",
    materialProgress: selectedMapPointForDetail?.progress ?? 0,
    required: [
      { label: "现场照片", count: selectedMapPointForDetail?.progress ? 1 : 0, done: (selectedMapPointForDetail?.progress ?? 0) >= 33 },
      { label: "水印照片", count: (selectedMapPointForDetail?.progress ?? 0) >= 67 ? 1 : 0, done: (selectedMapPointForDetail?.progress ?? 0) >= 67 },
      { label: "墙租协议图片", count: (selectedMapPointForDetail?.progress ?? 0) === 100 ? 1 : 0, done: (selectedMapPointForDetail?.progress ?? 0) === 100 },
    ],
    timeline: [
      { time: "最近更新", title: selectedMapPointForDetail?.arrival ?? "暂无状态", desc: selectedMapPointForDetail?.latestLocation === "—" ? "暂无定位记录" : `最近定位：${selectedMapPointForDetail?.latestLocation ?? "暂无"}` },
    ],
  };

  function toggleOne(id, event) {
    if (event?.shiftKey && lastSelectedId) {
      const startIndex = visible.findIndex((item) => item.id === lastSelectedId);
      const endIndex = visible.findIndex((item) => item.id === id);
      if (startIndex >= 0 && endIndex >= 0) {
        const [start, end] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        const rangeIds = visible.slice(start, end + 1).map((item) => item.id);
        setSelectedIds((list) => [...new Set([...list, ...rangeIds])]);
        setLastSelectedId(id);
        return;
      }
    }

    if (event?.ctrlKey || event?.metaKey) {
      setSelectedIds((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
      setLastSelectedId(id);
      return;
    }

    setSelectedIds((list) => list.length === 1 && list.includes(id) ? [] : [id]);
    setLastSelectedId(id);
  }

  function toggleAllVisible() {
    setSelectedIds((list) => allVisibleSelected
      ? list.filter((id) => !visible.some((item) => item.id === id))
      : [...new Set([...list, ...visible.map((item) => item.id)])]);
    setLastSelectedId(visible.at(-1)?.id ?? null);
  }

  function handleGridMouseDown(event) {
    if (event.target.closest('[data-media-id]')) return;
    const rect = gridRef.current.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    setSelectionBox({ left: event.clientX - rect.left, top: event.clientY - rect.top, width: 0, height: 0 });
    setSelectedIds([]);
    setLastSelectedId(null);

    const handleMove = (moveEvent) => {
      const current = { x: moveEvent.clientX, y: moveEvent.clientY };
      const box = {
        left: Math.min(start.x, current.x),
        top: Math.min(start.y, current.y),
        right: Math.max(start.x, current.x),
        bottom: Math.max(start.y, current.y),
      };
      setSelectionBox({
        left: box.left - start.left,
        top: box.top - start.top,
        width: box.right - box.left,
        height: box.bottom - box.top,
      });

      const selected = visible.filter((item) => {
        const node = gridRef.current?.querySelector(`[data-media-id="${item.id}"]`);
        if (!node) return false;
        const itemRect = node.getBoundingClientRect();
        return itemRect.left < box.right && itemRect.right > box.left && itemRect.top < box.bottom && itemRect.bottom > box.top;
      }).map((item) => item.id);
      setSelectedIds(selected);
      setLastSelectedId(selected.at(-1) ?? null);
    };

    const handleUp = () => {
      setSelectionBox(null);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function openPreview(item, scope) {
    setPreviewScope(scope);
    setPreview(item);
  }

  function closePreview() {
    setPreview(null);
  }

  function showPreviousPreview() {
    if (canPreviewPrev) setPreview(previewItems[previewIndex - 1]);
  }

  function showNextPreview() {
    if (canPreviewNext) setPreview(previewItems[previewIndex + 1]);
  }

  function toggleDispatchPoint(id) {
    setDispatchSelectedIds((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function toggleAllDispatchable() {
    setDispatchSelectedIds((list) => allDispatchableSelected
      ? list.filter((id) => !dispatchablePoints.some((item) => item.id === id))
      : [...new Set([...list, ...dispatchablePoints.map((item) => item.id)])]);
  }

  function togglePointTag(tag) {
    setSelectedPointTags((list) => list.includes(tag) ? list.filter((item) => item !== tag) : [...list, tag]);
  }

  function addDraftPointTag() {
    const next = draftPointTag.trim();
    if (!next) return;
    setSelectedPointTags((list) => list.includes(next) ? list : [...list, next]);
    setDraftPointTag("");
  }

  function toggleManagedTag(item) {
    const key = `${item.project}-${item.name}`;
    setSelectedManagedTagKeys((list) => list.includes(key) ? list.filter((value) => value !== key) : [...list, key]);
  }

  function toggleAllVisibleManagedTags() {
    const keys = visibleManagedTags.map((item) => `${item.project}-${item.name}`);
    setSelectedManagedTagKeys((list) => allVisibleManagedSelected ? list.filter((key) => !keys.includes(key)) : [...new Set([...list, ...keys])]);
  }

  function useRecentTag(tag) {
    setTagDraft(tag);
  }

  function toggleManagedPoint(id) {
    setSelectedPointIds((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function toggleBatchSelectedTag(tag) {
    setBatchSelectedTags((list) => list.includes(tag) ? list.filter((item) => item !== tag) : [...list, tag]);
  }

  const managedTags = [
    { name: "乡镇主干道", project: "加多宝村镇墙体项目", points: 41, status: "启用" },
    { name: "学校附近", project: "加多宝村镇墙体项目", points: 28, status: "启用" },
    { name: "集市口", project: "加多宝村镇墙体项目", points: 19, status: "启用" },
    { name: "重点墙面", project: "加多宝村镇墙体项目", points: 12, status: "启用" },
    { name: "村口", project: "阿康化肥春耕项目", points: 16, status: "启用" },
    { name: "春耕重点", project: "阿康化肥春耕项目", points: 9, status: "启用" },
    { name: "学校旁", project: "加多宝村镇墙体项目", points: 6, status: "待合并" },
  ];
  const visibleManagedTags = managedTags.filter((item) => tagManagerProject === "全部项目" || item.project === tagManagerProject);
  const recentTags = ["乡镇主干道", "学校附近", "集市口", "重点墙面", "村口", "春耕重点", "农资店旁", "县道"];
  const allVisibleManagedSelected = visibleManagedTags.length > 0 && visibleManagedTags.every((item) => selectedManagedTagKeys.includes(`${item.project}-${item.name}`));

  function openMapPoint(pointId) {
    const mapPoint = mapPoints.find((item) => item.id === pointId);
    setPage("地图调度");
    setSelectedMapPointId(pointId);
    if (mapPoint) {
      setMapProjectFilter(mapPoint.project);
      setMapWorkerFilter(mapPoint.worker === "未派单" ? "全部师傅" : mapPoint.worker);
    }
  }

  function openPointDetail(code = point.id) {
    setSelectedDetailPointCode(code);
    setDetailOpen(true);
  }

  function openPointMedia(code = point.id) {
    setPage("素材管理");
    setKind("全部素材");
    setSelectedIds(initialMedia.filter((item) => item.point === code).map((item) => item.id));
  }

  function openDispatchForPoint(code) {
    const dispatchPoint = dispatchPoints.find((item) => item.code === code);
    setPage("派单中心");
    if (dispatchPoint) setDispatchSelectedIds([dispatchPoint.id]);
  }

  function openWorkerCenter(workerName, mode = "view") {
    const targetWorker = workers.find((item) => item.name === workerName);
    setPage("师傅管理");
    if (targetWorker) {
      setWorkerOpen(targetWorker);
      setWorkerMode(mode);
    }
  }

  function openWorkerMap(workerName) {
    setPage("地图调度");
    setMapWorkerFilter(workerName);
  }

  function toggleMapPointSelection(id) {
    setSelectedMapPointId(id);
    setSelectedMapPointIds((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  function selectVisibleMapPoints() {
    setSelectedMapPointIds(visibleMapPoints.map((item) => item.id));
  }

  function clearMapSelection() {
    setSelectedMapPointIds([]);
  }

  return (
    <div className="app">
      <aside>
        <div className="logo">墙</div>
        <nav>
          {["运营总览", "地图调度", "点位管理", "师傅管理", "派单中心", "项目管理", "素材管理", "系统状态"].map((item) => (
            <button key={item} className={page === item ? "active" : ""} onClick={() => setPage(item)}>{item}</button>
          ))}
        </nav>
      </aside>

      <main className={page === "地图调度" ? "mapMain" : ""}>
        {page === "运营总览" ? (
          <>
            <header className="overviewHeader">
              <div>
                <small>管理后台 / Operations Overview</small>
                <h1>运营总览</h1>
              </div>
              <div className="overviewHeaderActions">
                <button>导出日报</button>
                <button className="primary" onClick={() => setPage("地图调度")}>进入地图调度</button>
              </div>
            </header>

            <section className="overviewHero">
              <article><span>今日新增点位</span><b>24</b><small>较昨日 +6</small></article>
              <article><span>今日已派单</span><b>38</b><small>其中 6 单待出发</small></article>
              <article><span>施工中</span><b>17</b><small>3 位师傅在线执行</small></article>
              <article><span>今日已完成</span><b>29</b><small>完成率 76%</small></article>
              <article><span>异常待处理</span><b>12</b><small>需优先跟进</small></article>
            </section>

            <section className="overviewGrid">
              <section className="overviewPanel projectOverviewPanel">
                <div className="overviewPanelHead">
                  <h2>项目进度</h2>
                  <button onClick={() => setPage("项目管理")}>查看全部</button>
                </div>
                {projects.map((item) => (
                  <article key={item.id}>
                    <div>
                      <b>{item.name}</b>
                      <span>{item.completed} / {item.points} 已完成</span>
                    </div>
                    <em><i style={{ width: `${item.progress}%` }} /></em>
                    <small>{item.progress}% · 异常 {item.abnormal}</small>
                  </article>
                ))}
              </section>

              <section className="overviewPanel liveOverviewPanel">
                <div className="overviewPanelHead">
                  <h2>实时执行</h2>
                  <button onClick={() => setPage("地图调度")}>打开地图</button>
                </div>
                {workerLocations.map((item) => (
                  <article key={item.id}>
                    <div>
                      <b>{item.worker}</b>
                      <span>{item.currentStatus}</span>
                    </div>
                    <em className={item.online ? "online" : "offline"}>{item.online ? item.motion : "离线"}</em>
                    <small>{item.latestLocation}</small>
                  </article>
                ))}
              </section>

              <section className="overviewPanel materialOverviewPanel">
                <div className="overviewPanelHead">
                  <h2>素材回收</h2>
                  <button onClick={() => setPage("素材管理")}>查看素材</button>
                </div>
                <div className="materialBars">
                  <article><span>现场照片</span><em><i style={{ width: "84%" }} /></em><b>84%</b></article>
                  <article><span>水印照片</span><em><i style={{ width: "78%" }} /></em><b>78%</b></article>
                  <article><span>视频</span><em><i style={{ width: "61%" }} /></em><b>61%</b></article>
                  <article><span>墙租协议</span><em><i style={{ width: "46%" }} /></em><b>46%</b></article>
                </div>
              </section>

              <section className="overviewPanel alertOverviewPanel">
                <div className="overviewPanelHead">
                  <h2>异常提醒</h2>
                  <button>全部处理</button>
                </div>
                {overviewAlerts.map((item) => (
                  <article key={item.title} className={item.level}>
                    <div>
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                    </div>
                    <button onClick={() => {
                      if (item.title.includes("A-018")) openMapPoint("mp3");
                      if (item.title.includes("点位 001")) openPointMedia();
                      if (item.title.includes("刘师傅")) openWorkerCenter("刘师傅");
                    }}>{item.action}</button>
                  </article>
                ))}
              </section>
            </section>

            <section className="overviewBottomGrid">
              <section className="overviewPanel compactMapPanel">
                <div className="overviewPanelHead">
                  <h2>地图摘要</h2>
                  <button onClick={() => setPage("地图调度")}>展开地图</button>
                </div>
                <div className="miniMap">
                  {mapPoints.map((item) => (
                    <i
                      key={item.id}
                      className={item.status === "未派单" ? "unassigned" : item.status === "已派单" ? "assigned" : item.status === "施工中" ? "working" : item.status === "已完成" ? "done" : "abnormal"}
                      style={item.coords}
                    />
                  ))}
                </div>
              </section>

              <section className="overviewPanel recentOverviewPanel">
                <div className="overviewPanelHead">
                  <h2>最近动态</h2>
                  <button>查看日志</button>
                </div>
                {recentSystemEvents.map((item) => (
                  <article key={`${item.time}-${item.title}`}>
                    <time>{item.time}</time>
                    <div>
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                    </div>
                  </article>
                ))}
              </section>
            </section>
          </>
        ) : page === "系统状态" ? (
          <>
            <header className="systemHeader">
              <div>
                <small>管理后台 / System Health</small>
                <h1>系统状态</h1>
              </div>
              <div className="systemHeaderActions">
                <button>刷新检查</button>
                <button className="primary">导出诊断</button>
              </div>
            </header>

            <section className="systemSummary">
              <article><span>整体状态</span><b>可用</b><small>7 正常 · 1 注意</small></article>
              <article><span>最近检查</span><b>刚刚</b><small>自动巡检</small></article>
              <article><span>今日上传</span><b>126</b><small>图片 + 视频</small></article>
              <article><span>定位在线率</span><b>75%</b><small>3 / 4 位师傅</small></article>
            </section>

            <section className="systemLayout">
              <section className="systemServicePanel">
                <div className="overviewPanelHead">
                  <h2>服务检查</h2>
                  <button>查看详情</button>
                </div>
                <div className="systemServiceGrid">
                  {systemServices.map((item) => (
                    <article key={item.name} className={item.status === "正常" ? "ok" : "warn"}>
                      <div>
                        <b>{item.name}</b>
                        <span>{item.detail}</span>
                      </div>
                      <em>{item.status}</em>
                    </article>
                  ))}
                </div>
              </section>

              <section className="systemSidePanel">
                <article>
                  <h2>需要关注</h2>
                  <div>
                    <b>师傅端定位上报</b>
                    <span>刘师傅昨日 18:42 后无新位置，建议确认手机端权限或网络状态。</span>
                  </div>
                  <button onClick={() => openWorkerCenter("刘师傅")}>前往师傅管理</button>
                </article>
                <article>
                  <h2>最近错误</h2>
                  <div>
                    <b>暂无阻断性错误</b>
                    <span>最近 24 小时内未发现数据库、存储或视频链路故障。</span>
                  </div>
                </article>
              </section>
            </section>

            <section className="systemTimelinePanel">
              <div className="overviewPanelHead">
                <h2>最近系统事件</h2>
                <button>查看全部</button>
              </div>
              {recentSystemEvents.map((item) => (
                <article key={`system-${item.time}-${item.title}`}>
                  <time>{item.time}</time>
                  <div>
                    <b>{item.title}</b>
                    <span>{item.desc}</span>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : page === "地图调度" ? (
          <>
            <header className="mapPageHeader">
              <div>
                <small>管理后台 / Map Dispatch</small>
                <h1>地图调度</h1>
              </div>
              <div className="mapHeaderActions">
                <button className={mapSelectionMode ? "activeSoft" : ""} onClick={() => setMapSelectionMode((active) => !active)}>{mapSelectionMode ? "退出多选" : "多选点位"}</button>
                <button onClick={selectVisibleMapPoints}>全选当前结果</button>
                <button onClick={clearMapSelection}>清空选择</button>
                <button className={showWorkerLocations ? "activeSoft" : ""} onClick={() => setShowWorkerLocations((show) => !show)}>{showWorkerLocations ? "隐藏师傅" : "显示师傅"}</button>
                <button className={showRecentTrail ? "activeSoft" : ""} onClick={() => setShowRecentTrail((show) => !show)}>{showRecentTrail ? "隐藏轨迹" : "显示轨迹"}</button>
                <button className="primary" disabled={selectedMapPointIds.length === 0} onClick={() => openDispatchForPoint(selectedMapPoints[0]?.code ?? "P-009")}>派单所选</button>
              </div>
            </header>

            <section className="mapKpiStrip">
              {mapKpis.map((item) => (
                <button
                  key={item.key}
                  className={mapFocus === item.key ? "active" : ""}
                  onClick={() => setMapFocus((current) => current === item.key ? "全部点位" : item.key)}
                >
                  <span>{item.label}</span>
                  <b>{item.value}</b>
                  <small>{item.hint}</small>
                </button>
              ))}
            </section>

            <section className="mapToolbar practicalToolbar">
              <input value={mapSearch} onChange={(event) => setMapSearch(event.target.value)} placeholder="搜索点位编号 / 地址 / 师傅 / 标签" />
              <select value={mapProjectFilter} onChange={(event) => setMapProjectFilter(event.target.value)}>
                <option>全部项目</option>
                {projects.map((item) => <option key={item.id}>{item.name}</option>)}
              </select>
              <select value={mapTagFilter} onChange={(event) => setMapTagFilter(event.target.value)}>
                {mapTags.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select value={mapWorkerFilter} onChange={(event) => setMapWorkerFilter(event.target.value)}>
                <option>全部师傅</option>
                {workers.map((item) => <option key={item.id}>{item.name}</option>)}
              </select>
              <select value={mapTaskTypeFilter} onChange={(event) => setMapTaskTypeFilter(event.target.value)}>
                <option>全部任务</option>
                <option>安装执行</option>
                <option>找墙回传</option>
                <option>复查回访</option>
              </select>
              <button onClick={() => { setMapSearch(""); setMapProjectFilter("全部项目"); setMapTagFilter("全部标签"); setMapStatusFilter("全部状态"); setMapWorkerFilter("全部师傅"); setMapTaskTypeFilter("全部任务"); setMapFocus("全部点位"); setMapViewMode("全部点位"); setMapWorkflowLayer("全部阶段"); }}>重置</button>
            </section>

            {selectedMapPointIds.length > 0 && (
              <section className="mapSelectionBasket richerBasket">
                <div>
                  <b>已选 {selectedMapPointIds.length} 个点位</b>
                  <span>{selectedMapPoints.map((item) => item.code).join("、")}</span>
                </div>
                {selectedBatchRecommendation && (
                  <article>
                    <small>批量建议</small>
                    <strong>{selectedBatchRecommendation.worker}</strong>
                    <em>{selectedBatchRecommendation.reason}</em>
                  </article>
                )}
                <div>
                  <button onClick={() => openDispatchForPoint(selectedMapPoints[0]?.code ?? "P-009")}>派单所选</button>
                  <button>批量打标签</button>
                  <button>导出所选</button>
                  <button onClick={clearMapSelection}>清空</button>
                </div>
              </section>
            )}

            <section className="mapDispatchLayout practicalMapLayout">
              <aside className="mapQueuePanel">
                <div className="mapQueueHeader">
                  <div>
                    <h2>调度队列</h2>
                    <span>先处理什么，一眼看清</span>
                  </div>
                  <b>{queueCurrentItems.length}</b>
                </div>
                <div className="mapQueueTabs">
                  {Object.keys(mapQueueItems).map((item) => (
                    <button key={item} className={mapQueueTab === item ? "active" : ""} onClick={() => setMapQueueTab(item)}>{item}</button>
                  ))}
                </div>
                <div className="mapQueueList">
                  {queueCurrentItems.map((item) => {
                    const issue = getMapPointIssue(item);
                    return (
                      <button key={item.id} className={selectedMapPoint?.id === item.id ? "active" : ""} onClick={() => mapSelectionMode ? toggleMapPointSelection(item.id) : setSelectedMapPointId(item.id)}>
                        <div>
                          <b>{item.code}</b>
                          <em className={issue.tone}>{issue.label}</em>
                        </div>
                        <strong>{item.taskType}</strong>
                        <p>{item.address}</p>
                        <small>{issue.detail}</small>
                        <i>{item.worker} · {item.arrival} · {getMissingMaterialText(item)}</i>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <section className="mapCanvasPanel">
                <div className="mapCanvasHeader">
                  <div>
                    <h2>全国执行地图</h2>
                    <span>地图负责看空间关系；左侧看待处理队列；右侧看当前点下一步。</span>
                  </div>
                  <div className="mapLegend">
                    <span className="unassigned">未派单</span>
                    <span className="assigned">已派单</span>
                    <span className="working">施工中</span>
                    <span className="done">已完成</span>
                    <span className="abnormal">异常</span>
                  </div>
                </div>
                <section className="mapWorkflowTabs">
                  {workflowLayers.map((item) => (
                    <button key={item.key} className={mapWorkflowLayer === item.key ? "active" : ""} onClick={() => setMapWorkflowLayer(item.key)}>
                      <span>{item.label}</span>
                      <b>{item.count}</b>
                    </button>
                  ))}
                </section>
                <div className="mapCanvas">
                  <section className="mapNowPanel practicalNowPanel">
                    <small>当前查看</small>
                    <h3>{mapFocus}</h3>
                    <div>
                      <span>显示 {visibleMapPoints.length} 个点</span>
                      <span>已选 {selectedMapPointIds.length}</span>
                      <span>异常 {abnormalMapPoints.length}</span>
                    </div>
                  </section>
                  <div className="mapRoad roadA" />
                  <div className="mapRoad roadB" />
                  <div className="mapRoad roadC" />
                  <div className="mapBlock blockA" />
                  <div className="mapBlock blockB" />
                  <div className="mapBlock blockC" />
                  {visibleMapPoints.map((item) => {
                    const issue = getMapPointIssue(item);
                    return (
                      <button
                        key={item.id}
                        className={`mapPin ${item.status === "未派单" ? "unassigned" : item.status === "已派单" ? "assigned" : item.status === "施工中" ? "working" : item.status === "已完成" ? "done" : "abnormal"} ${selectedMapPoint?.id === item.id ? "active" : ""} ${selectedMapPointIds.includes(item.id) ? "checked" : ""}`}
                        style={item.coords}
                        onClick={() => mapSelectionMode ? toggleMapPointSelection(item.id) : setSelectedMapPointId(item.id)}
                      >
                        {selectedMapPointIds.includes(item.id) && <i>✓</i>}
                        {issue.label !== "正常" && <em>{issue.label}</em>}
                        <small>{item.taskType}</small>
                        <b>{item.code}</b>
                      </button>
                    );
                  })}
                  {showRecentTrail && selectedLiveWorker?.trail.length > 1 && selectedLiveWorker.trail.slice(1).map((pointItem, index) => {
                    const prev = selectedLiveWorker.trail[index];
                    return (
                      <span
                        key={`${selectedLiveWorker.worker}-trail-${index}`}
                        className="mapTrailSegment"
                        style={{
                          left: prev.left,
                          top: prev.top,
                          width: `${Math.hypot(parseFloat(pointItem.left) - parseFloat(prev.left), parseFloat(pointItem.top) - parseFloat(prev.top))}%`,
                          transform: `rotate(${Math.atan2(parseFloat(pointItem.top) - parseFloat(prev.top), parseFloat(pointItem.left) - parseFloat(prev.left)) * 180 / Math.PI}deg)`,
                        }}
                      />
                    );
                  })}
                  {showRecentTrail && selectedLiveWorker?.trail.map((pointItem, index) => (
                    <i key={`${selectedLiveWorker.worker}-dot-${index}`} className="mapTrailDot" style={pointItem} />
                  ))}
                  {showWorkerLocations && visibleWorkerLocations.map((item) => (
                    <button
                      key={item.id}
                      className={`workerMarker ${item.online ? "online" : "offline"} ${item.motion === "停留中" ? "staying" : item.motion === "行进中" ? "moving" : ""}`}
                      style={item.coords}
                      onClick={() => setMapWorkerFilter(item.worker)}
                      title={`${item.worker} · ${item.currentStatus}`}
                    >
                      <span />
                    </button>
                  ))}
                </div>
              </section>

              <aside className="mapSidePanel compactMapSide">
                <section className="mapSummaryPanel compactSummary">
                  <div>
                    <article><span>点位</span><b>{visibleMapPoints.length}</b></article>
                    <article><span>未派</span><b>{mapStatusCounts["未派单"]}</b></article>
                    <article><span>施工</span><b>{mapStatusCounts["施工中"]}</b></article>
                    <article><span>异常</span><b>{mapStatusCounts["异常"]}</b></article>
                  </div>
                </section>

                {selectedMapPoint ? (
                  <section className="mapPointCard compactPointCard">
                    <div className="mapPointHead">
                      <div>
                        <small>当前点位</small>
                        <h3>{selectedMapPoint.code}</h3>
                      </div>
                      <span className={selectedMapPoint.status === "未派单" ? "unassigned" : selectedMapPoint.status === "已派单" ? "assigned" : selectedMapPoint.status === "施工中" ? "working" : selectedMapPoint.status === "已完成" ? "done" : "abnormal"}>{selectedMapPoint.status}</span>
                    </div>
                    <p>{selectedMapPoint.address}</p>
                    <div className="pointBusinessRow">
                      <span>{selectedMapPoint.taskType}</span>
                      <b>{selectedMapPoint.phase}</b>
                    </div>
                    <div className="tagRow">
                      {selectedMapPoint.tags.map((tag) => <span key={tag}>{tag}</span>)}
                    </div>
                    <div className="mapPointMetrics compactMetrics">
                      <div><span>项目</span><b>{selectedMapPoint.project}</b></div>
                      <div><span>师傅</span><b>{selectedMapPoint.worker}</b></div>
                      <div><span>素材</span><b>{selectedMapPoint.material}</b><small>{getMissingMaterialText(selectedMapPoint)}</small></div>
                    </div>
                    <section className="mapArrivalPanel compactArrival">
                      <div><span>到达</span><b>{selectedMapPoint.arrival}</b></div>
                      <div><span>距离</span><b>{selectedMapPoint.distance}</b></div>
                      <div><span>停留</span><b>{selectedMapPoint.stay}</b></div>
                      <div><span>定位</span><b>{selectedMapPoint.latestLocation}</b></div>
                    </section>
                    <article className="mapProgress compactProgress">
                      <div>
                        <span>素材完成度</span>
                        <b>{selectedMapPoint.progress}%</b>
                      </div>
                      <em><i style={{ width: `${selectedMapPoint.progress}%` }} /></em>
                    </article>
                    <section className="mapCheckPanel">
                      {selectedPointChecks.map((item) => (
                        <div key={item.label} className={item.ok ? "ok" : "warn"}>
                          <span>{item.ok ? "✓" : "!"}</span>
                          <b>{item.label}</b>
                          <em>{item.value}</em>
                        </div>
                      ))}
                    </section>
                    <section className="mapAutoJudgePanel compactJudge practicalJudge">
                      <div>
                        <span>{selectedPointRule?.title}</span>
                        <b>{selectedPointAdvice?.title}</b>
                      </div>
                      <p>{selectedPointAdvice?.detail}</p>
                    </section>
                    {selectedRouteAdvice && (
                      <section className={`mapRouteAdvice ${selectedRouteAdvice.tone}`}>
                        <span>调度建议</span>
                        <b>{selectedRouteAdvice.title}</b>
                        <p>{selectedRouteAdvice.detail}</p>
                      </section>
                    )}
                    <section className="mapLifecyclePanel">
                      <div className="panelMiniHead">
                        <span>墙体生命周期</span>
                        <b>找墙 → 安装 → 复查</b>
                      </div>
                      <div className="lifecycleSteps">
                        {selectedWallLifecycle.map((item) => (
                          <article key={item.label} className={item.status === "当前" ? "current" : item.status === "完成" ? "done" : "pending"}>
                            <b>{item.label}</b>
                            <span>{item.status}</span>
                            <small>{item.detail}</small>
                          </article>
                        ))}
                      </div>
                    </section>
                    <section className="wallReusePanel">
                      <div className="panelMiniHead">
                        <span>同墙复用</span>
                        <b>{selectedWallReuse.length} 条记录</b>
                      </div>
                      {selectedWallReuse.map((item) => (
                        <article key={`${item.project}-${item.state}`}>
                          <div>
                            <b>{item.project}</b>
                            <span>{item.note}</span>
                          </div>
                          <em>{item.state}</em>
                        </article>
                      ))}
                    </section>
                    <section className="acceptanceRulePanel">
                      <span>验收口径</span>
                      <p>{selectedAcceptanceRule}</p>
                    </section>
                    <div className="mapPointActions practicalActions">
                      <button className="primary" onClick={() => {
                        if (selectedPointAdvice?.action === "立即派单") openDispatchForPoint(selectedMapPoint.code);
                        else if (selectedPointAdvice?.action === "查看素材") openPointMedia(selectedMapPoint.code);
                        else openPointDetail(selectedMapPoint.code);
                      }}>{selectedPointAdvice?.action}</button>
                      <button onClick={() => openPointDetail(selectedMapPoint.code)}>详情</button>
                      <button onClick={() => openPointMedia(selectedMapPoint.code)}>素材</button>
                      <button onClick={() => openDispatchForPoint(selectedMapPoint.code)}>{selectedMapPoint.status === "未派单" ? "派单" : "重派"}</button>
                    </div>
                  </section>
                ) : (
                  <section className="mapPointCard emptyMapCard">当前筛选下暂无点位</section>
                )}

                <section className="mapSideDock">
                  <div className="mapSideTabs fourTabs">
                    <button className={mapSideTab === "priority" ? "active" : ""} onClick={() => setMapSideTab("priority")}>优先</button>
                    <button className={mapSideTab === "worker" ? "active" : ""} onClick={() => setMapSideTab("worker")}>师傅</button>
                    <button className={mapSideTab === "live" ? "active" : ""} onClick={() => setMapSideTab("live")}>实时</button>
                    <button className={mapSideTab === "smart" ? "active" : ""} onClick={() => setMapSideTab("smart")}>建议</button>
                  </div>

                  {mapSideTab === "priority" && (
                    <section className="mapPriorityPanel">
                      {mapPriorityPoints.map((item) => (
                        <button key={item.id} onClick={() => setSelectedMapPointId(item.id)}>
                          <div>
                            <b>{item.code}</b>
                            <span>{item.status === "异常" ? "异常优先" : item.progress < 100 ? "素材待补" : "需跟进"}</span>
                          </div>
                          <p>{item.address}</p>
                          <small>{item.worker} · {item.arrival} · 素材 {item.material}</small>
                        </button>
                      ))}
                    </section>
                  )}

                  {mapSideTab === "worker" && (
                    <section className="mapWorkerPanel compactWorkerPanel">
                      {workers.slice(0, 3).map((item) => {
                        const live = workerLocations.find((liveItem) => liveItem.worker === item.name);
                        return (
                          <button key={item.id} onClick={() => setMapWorkerFilter(item.name)}>
                            <div>
                              <b>{item.name}</b>
                              <span>{live?.currentStatus ?? "暂无实时位置"} · {live?.latestLocation ?? "—"}</span>
                            </div>
                            <em>{mapPoints.filter((pointItem) => pointItem.worker === item.name).length} 点</em>
                          </button>
                        );
                      })}
                    </section>
                  )}

                  {mapSideTab === "live" && (
                    <section className="mapLiveWorkerCard compactLiveCard">
                      {selectedLiveWorker ? (
                        <>
                          <div>
                            <small>当前师傅</small>
                            <h3>{selectedLiveWorker.worker}</h3>
                          </div>
                          <div><span>状态</span><b>{selectedLiveWorker.currentStatus}</b></div>
                          <div><span>速度</span><b>{selectedLiveWorker.speed}</b></div>
                          <div><span>电量</span><b>{selectedLiveWorker.battery}</b></div>
                          <div><span>定位</span><b>{selectedLiveWorker.latestLocation}</b></div>
                        </>
                      ) : (
                        <div className="emptyDock">先选择一位师傅</div>
                      )}
                    </section>
                  )}

                  {mapSideTab === "smart" && (
                    <section className="mapSmartDispatch compactSmartDispatch richerSmartDispatch">
                      <div>
                        <span>最近可接单师傅</span>
                        <b>{nearestAvailableWorker?.name}</b>
                      </div>
                      <p>{nearestAvailableWorker?.name} 当前负荷较轻，覆盖广州 / 清远区域。</p>
                      <article>
                        <b>路线建议</b>
                        <span>王师傅当前赶往 P-009，若新增点位位于番禺 / 广州南部，可优先继续分配给同一人。</span>
                      </article>
                      <button className="primary" onClick={() => openDispatchForPoint("P-009")}>按建议派单</button>
                    </section>
                  )}
                </section>
              </aside>
            </section>
          </>
        ) : page === "素材管理" ? (
          <>
            <header>
              <div>
                <small>管理后台 / Media Center</small>
                <h1>素材管理</h1>
              </div>
            </header>

            <section className="summary">
              <article><span>当前素材</span><b>{visible.length}</b></article>
              <article><span>已选素材</span><b>{selectedVisible.length}</b></article>
              <article><span>视频素材</span><b>{initialMedia.filter((m) => m.type === "video").length}</b></article>
              <article><span>下载模式</span><b>可选择</b></article>
            </section>

            <section className="toolbar">
              <div className="hint">单击选中，Ctrl + 单击多选，Shift + 单击连续多选，双击预览；可从素材卡片之间或下方空白处按住左键拖动，像 Windows 文件管理器一样框选多个素材。</div>
              <div className="left">
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  {kinds.map((item) => <option key={item}>{item}</option>)}
                </select>
                <button onClick={toggleAllVisible}>{allVisibleSelected ? "取消全选" : "全选"}</button>
                <button onClick={() => { setSelectedIds([]); setLastSelectedId(null); }} disabled={selectedVisible.length === 0}>清空选择</button>
              </div>
              <div className="right">
                <span>已选 {selectedVisible.length} 个</span>
                <button className="primary" disabled={selectedVisible.length === 0}>下载已选 ZIP</button>
              </div>
            </section>

            <section className="grid" ref={gridRef} onMouseDown={handleGridMouseDown}>
              {selectionBox && <div className="selectionBox" style={selectionBox} />}
              {visible.map((item) => (
                <article
                  className={`card ${selectedIds.includes(item.id) ? "checked" : ""}`}
                  key={item.id}
                  data-media-id={item.id}
                  onClick={(event) => toggleOne(item.id, event)}
                >
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => toggleOne(item.id, event)}
                    />
                    <span>{selectedIds.includes(item.id) ? "✓" : ""}</span>
                  </label>
                  <button
                    className="preview"
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      openPreview(item, "visible");
                    }}
                    title="双击预览"
                  >
                    {item.type === "video" ? (
                      <>
                        <video src={item.src} muted />
                        <i className="playBadge">▶</i>
                        <strong className="fileBadge">MP4</strong>
                        <small className="durationBadge">00:12</small>
                      </>
                    ) : <img src={item.src} alt={item.kind} />}
                    <em>{item.kind}</em>
                  </button>
                  <div className="meta">
                    <b>{item.point}</b>
                    <span>{item.file}</span>
                    <small>{item.createdAt}</small>
                  </div>
                </article>
              ))}
            </section>
          </>
        ) : page === "点位管理" ? (
          <>
            <header>
              <div>
                <small>管理后台 / Point Center</small>
                <h1>点位管理</h1>
              </div>
              <div className="topActions">
                <button onClick={() => setTagManagerOpen(true)}>标签管理</button>
                <button onClick={() => setPointImportOpen(true)}>批量导入</button>
                <button className="primary" onClick={() => setPointCreateOpen(true)}>新增点位</button>
              </div>
            </header>
            <section className="pointToolbar">
              <input placeholder="搜索点位编号 / 地址 / 项目" />
              <button>全部状态</button>
              <button>异常筛选</button>
              <button onClick={() => { setBatchPointTagMode("add"); setBatchPointTagOpen(true); }} disabled={selectedPointIds.length === 0}>批量打标签</button>
              <button onClick={() => { setBatchPointTagMode("remove"); setBatchPointTagOpen(true); }} disabled={selectedPointIds.length === 0}>批量移除标签</button>
              <button onClick={() => setPointImportOpen(true)}>导入模板</button>
            </section>
            <section className={`pointBatchBar ${selectedPointIds.length > 0 ? "active" : ""}`}>
              <b>{selectedPointIds.length > 0 ? `已选 ${selectedPointIds.length} 个点位` : "点击任意点位行即可多选"}</b>
              {selectedPointIds.length > 0 && (
                <div>
                  <button onClick={() => { setBatchPointTagMode("add"); setBatchPointTagOpen(true); }}>批量打标签</button>
                  <button onClick={() => { setBatchPointTagMode("remove"); setBatchPointTagOpen(true); }}>批量移除标签</button>
                  <button>批量派单</button>
                </div>
              )}
            </section>
            <section className="pointTableWrap">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>点位编号</th>
                    <th>项目 / 标签</th>
                    <th>地址</th>
                    <th>师傅 / 队伍</th>
                    <th>状态</th>
                    <th>素材情况</th>
                    <th>最近更新</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={selectedPointIds.includes("001") ? "selected" : ""} onClick={() => toggleManagedPoint("001")}> 
                    <td>
                      <input type="checkbox" checked={selectedPointIds.includes("001")} onClick={(event) => event.stopPropagation()} onChange={() => toggleManagedPoint("001")} />
                    </td>
                    <td><b>001</b></td>
                    <td>
                      <div className="projectCell">
                        <b>{point.project}</b>
                        <div className="tagRow">
                          <span>乡镇主干道</span>
                          <span>学校附近</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="addressCell">
                        <b>{point.address}</b>
                        <small>K码：{point.kCode}</small>
                      </div>
                    </td>
                    <td>
                      <div className="workerCell">
                        <b>当前：张师傅</b>
                        <small>施工：张师傅</small>
                        <small>找墙：刘师傅</small>
                      </div>
                    </td>
                    <td>
                      <div className="statusCell">
                        <span className="blue">已上传素材</span>
                        <span className="orange">待补齐</span>
                      </div>
                    </td>
                    <td>
                      <div className="materialCell">
                        <b>2/3 · 67%</b>
                        <small>缺：墙租协议图片</small>
                      </div>
                    </td>
                    <td>
                      <div className="updateCell">
                        <b>2026/5/11</b>
                        <small>17:08</small>
                      </div>
                    </td>
                    <td>
                      <div className="rowActions">
                        <button className="primary small" onClick={(event) => { event.stopPropagation(); setDetailOpen(true); }}>查看</button>
                        <button className="small" onClick={(event) => { event.stopPropagation(); setPointEditOpen(true); }}>编辑</button>
                      </div>
                    </td>
                  </tr>
                  <tr className={selectedPointIds.includes("002") ? "selected" : ""} onClick={() => toggleManagedPoint("002")}> 
                    <td>
                      <input type="checkbox" checked={selectedPointIds.includes("002")} onClick={(event) => event.stopPropagation()} onChange={() => toggleManagedPoint("002")} />
                    </td>
                    <td><b>002</b></td>
                    <td>
                      <div className="projectCell">
                        <b>阿康化肥春耕项目</b>
                        <div className="tagRow">
                          <span>村口</span>
                          <span>春耕重点</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="addressCell">
                        <b>广东省佛山市南海区</b>
                        <small>K码：未登记</small>
                      </div>
                    </td>
                    <td>
                      <div className="workerCell">
                        <b>当前：王师傅</b>
                        <small>施工：未登记</small>
                        <small>找墙：赵师傅</small>
                      </div>
                    </td>
                    <td>
                      <div className="statusCell">
                        <span className="purple">待验收</span>
                      </div>
                    </td>
                    <td>
                      <div className="materialCell">
                        <b>1/3 · 33%</b>
                        <small>缺：现场照片、水印照片</small>
                      </div>
                    </td>
                    <td>
                      <div className="updateCell">
                        <b>2026/5/11</b>
                        <small>16:42</small>
                      </div>
                    </td>
                    <td>
                      <div className="rowActions">
                        <button className="small" onClick={(event) => event.stopPropagation()}>查看</button>
                        <button className="small" onClick={(event) => event.stopPropagation()}>编辑</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        ) : page === "师傅管理" ? (
          <>
            <header className="workerPageHeader">
              <div>
                <small>管理后台 / Worker Center</small>
                <h1>师傅管理</h1>
              </div>
              <div className="workerHeaderActions">
                <button>队伍规则</button>
                <button className="primary">新增师傅</button>
              </div>
            </header>

            <section className="workerSummary">
              <article><span>师傅总数</span><b>{workers.length}</b><small>安装 + 找墙</small></article>
              <article><span>在线师傅</span><b>{onlineWorkers}</b><small>当前可联络</small></article>
              <article><span>安装队伍</span><b>{installWorkers}</b><small>执行施工</small></article>
              <article><span>找墙队伍</span><b>{scoutWorkers}</b><small>回传墙源</small></article>
              <article><span>在手任务</span><b>{workerActiveTasks}</b><small>全队当前负荷</small></article>
            </section>

            <section className="workerToolbar">
              <input value={workerQuery} onChange={(event) => setWorkerQuery(event.target.value)} placeholder="搜索师傅姓名 / 手机号 / 区域" />
              <select value={workerTeamFilter} onChange={(event) => setWorkerTeamFilter(event.target.value)}>
                <option>全部队伍</option>
                <option>安装队伍</option>
                <option>找墙队伍</option>
              </select>
              <select value={workerStatusFilter} onChange={(event) => setWorkerStatusFilter(event.target.value)}>
                <option>全部状态</option>
                <option>在线</option>
                <option>离线</option>
              </select>
            </section>

            <section className="workerBoard">
              <div className="workerBoardHead">
                <h2>师傅列表</h2>
                <span>{visibleWorkers.length} 位符合当前筛选</span>
              </div>
              <div className="workerCards">
                {visibleWorkers.map((item) => (
                  <article className="workerCard" key={item.id}>
                    <div className="workerCardTop">
                      <div>
                        <h3>{item.name}</h3>
                        <span>{item.team}</span>
                      </div>
                      <em className={item.online ? "online" : "offline"}>{item.online ? "在线" : "离线"}</em>
                    </div>
                    <div className="workerMeta">
                      <span>{item.phone}</span>
                      <span>{item.region}</span>
                      <span>最近活跃：{item.lastActive}</span>
                    </div>
                    <div className="workerMetrics">
                      <div><span>在手任务</span><b>{item.activeTasks}</b></div>
                      <div><span>近 7 天完成</span><b>{item.completed7d}</b></div>
                      <div><span>今日完成</span><b>{item.completedToday}</b></div>
                    </div>
                    <div className="workerCapacity">
                      <span>{item.capacity}</span>
                      <small>{item.mobileBound ? "手机端已绑定" : "待首次绑定"}</small>
                    </div>
                    <div className="workerActions refinedActions">
                      <button className="projectAction primaryAction" onClick={() => { setWorkerOpen(item); setWorkerMode("view"); }}>查看</button>
                      <button className="projectAction secondaryAction" onClick={() => { setWorkerOpen(item); setWorkerMode("edit"); }}>编辑</button>
                      <button className="projectAction tertiaryAction" onClick={() => openWorkerMap(item.name)}>任务</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : page === "派单中心" ? (
          <>
            <header className="dispatchPageHeader">
              <div>
                <small>管理后台 / Dispatch Center</small>
                <h1>派单中心</h1>
              </div>
              <div className="dispatchHeaderActions">
                <button>派单记录</button>
                <button className="primary" disabled={dispatchSelectedPoints.length === 0 || !selectedWorker} onClick={() => setDispatchSuccessOpen(true)}>确认派单</button>
              </div>
            </header>

            <section className="dispatchSummary">
              <article><span>待派单点位</span><b>3</b><small>当前可立即处理</small></article>
              <article><span>本次已选</span><b>{dispatchSelectedPoints.length}</b><small>进入派单篮</small></article>
              <article><span>在线师傅</span><b>2</b><small>可接收任务</small></article>
              <article><span>风险提醒</span><b>1</b><small>含已派单点位</small></article>
            </section>

            <section className="dispatchLayout">
              <section className="dispatchPool">
                <div className="dispatchSectionHead">
                  <div>
                    <h2>待派单点位池</h2>
                    <span>先筛选，再批量选择点位</span>
                  </div>
                  <button onClick={toggleAllDispatchable}>{allDispatchableSelected ? "取消全选" : "全选未派单"}</button>
                </div>
                <div className="dispatchFilters">
                  <button>全部项目</button>
                  <button>全部标签</button>
                  <button>全部区域</button>
                  <button>只看未派单</button>
                  <input value={dispatchQuery} onChange={(event) => setDispatchQuery(event.target.value)} placeholder="搜索省 / 市 / 区 / 镇 / 点位编号 / 标签" />
                </div>
                <div className="dispatchPointList">
                  {visibleDispatchPoints.length === 0 ? (
                    <div className="emptyState">没有找到匹配的点位</div>
                  ) : visibleDispatchPoints.map((item) => (
                    <article className={`dispatchPoint ${dispatchSelectedIds.includes(item.id) ? "selected" : ""} ${item.status === "已派单" ? "locked" : ""}`} key={item.id} onClick={() => item.status === "未派单" && toggleDispatchPoint(item.id)}>
                      <label>
                        <input type="checkbox" checked={dispatchSelectedIds.includes(item.id)} readOnly disabled={item.status === "已派单"} />
                      </label>
                      <div className="dispatchPointMain">
                        <div className="dispatchPointTitle">
                          <b>{item.code}</b>
                          <span>{item.project}</span>
                        </div>
                        <p>{item.address}</p>
                        <div className="tagRow">
                          {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                      </div>
                      <div className="dispatchPointMeta">
                        <span>{item.region}</span>
                        <b className={item.status === "未派单" ? "ready" : "assigned"}>{item.status}</b>
                        <small>{item.warning}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="dispatchBasket">
                <div className="dispatchSectionHead compact">
                  <div>
                    <h2>本次派单篮</h2>
                    <span>{dispatchSelectedPoints.length} 个点位待确认</span>
                  </div>
                </div>
                <div className="basketList">
                  {dispatchSelectedPoints.length === 0 ? (
                    <div className="emptyState">尚未选择点位</div>
                  ) : dispatchSelectedPoints.map((item) => (
                    <article key={item.id}>
                      <b>{item.code}</b>
                      <span>{item.address}</span>
                      <button onClick={() => toggleDispatchPoint(item.id)}>移除</button>
                    </article>
                  ))}
                </div>
                <section className="dispatchChecks">
                  <h3>派单前检查</h3>
                  <div><span>地址完整</span><b>✓</b></div>
                  <div><span>重复派单</span><b>{dispatchSelectedPoints.some((item) => item.status === "已派单") ? "!" : "✓"}</b></div>
                  <div><span>异常点位</span><b>{dispatchSelectedPoints.filter((item) => item.warning !== "资料齐全").length}</b></div>
                </section>
              </section>

              <section className="workerChooser">
                <div className="dispatchSectionHead compact">
                  <div>
                    <h2>选择师傅</h2>
                    <span>优先派给可接单人员</span>
                  </div>
                </div>
                <div className="workerList">
                  {workers.map((item) => (
                    <button className={selectedWorkerId === item.id ? "selected" : ""} key={item.id} onClick={() => setSelectedWorkerId(item.id)}>
                      <div>
                        <b>{item.name}</b>
                        <span>{item.team}</span>
                      </div>
                      <em className={item.online ? "online" : "offline"}>{item.online ? "在线" : "离线"}</em>
                      <small>{item.phone}</small>
                      <small>{item.region}</small>
                      <strong>{item.tasks} 个在手任务</strong>
                      <i>{item.capacity}</i>
                    </button>
                  ))}
                </div>
                {selectedWorker && (
                  <section className="selectedWorkerCard">
                    <span>当前选择</span>
                    <b>{selectedWorker.name}</b>
                    <small>{selectedWorker.team} · {selectedWorker.region}</small>
                  </section>
                )}
              </section>
            </section>
          </>
        ) : page === "项目管理" ? (
          <>
            <header className="projectPageHeader">
              <div>
                <small>管理后台 / Project Center</small>
                <h1>项目管理</h1>
              </div>
              <div className="projectHeaderActions">
                <input placeholder="搜索项目名称 / 标签" />
                <button>全部状态</button>
                <button>2026 年 5 月</button>
                <button className="primary topAction" onClick={() => setProjectCreateOpen(true)}>新建项目</button>
              </div>
            </header>
            <section className="projectSummary refined">
              <article><span>项目总数</span><b>2</b><small>当前可见项目</small></article>
              <article><span>进行中</span><b>1</b><small>正在执行</small></article>
              <article><span>总点位</span><b>192</b><small>跨全部项目</small></article>
              <article><span>异常点位</span><b>12</b><small>需优先处理</small></article>
            </section>
            <section className="projectBoard">
              <div className="monthHeader">
                <div>
                  <h2>2026 年 5 月</h2>
                  <span>2 个项目 · 192 个点位</span>
                </div>
                <button>收起本月</button>
              </div>
              <div className="projectRows">
                {projects.map((item) => (
                  <article className="projectRow" key={item.id}>
                    <div className="projectIdentity">
                      <div className="projectTitleLine">
                        <h3>{item.name}</h3>
                        <span className={item.status === "进行中" ? "running" : "planning"}>{item.status}</span>
                      </div>
                      <p>{item.description}</p>
                      <div className="tagRow projectTags">
                        {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                      </div>
                    </div>

                    <div className="projectProgressBlock">
                      <div className="progressHead">
                        <span>执行进度</span>
                        <b>{item.progress}%</b>
                      </div>
                      <em><i style={{ width: `${item.progress}%` }} /></em>
                      <small>{item.completed} / {item.points} 已完成</small>
                    </div>

                    <div className="projectMiniStats">
                      <div><span>点位</span><b>{item.points}</b></div>
                      <div><span>完成</span><b>{item.completed}</b></div>
                      <div><span>异常</span><b>{item.abnormal}</b></div>
                    </div>

                    <div className="projectRuleSummary">
                      <span>素材规则</span>
                      <b>{item.required.length} 项必传</b>
                      <small>{item.required.join(" · ")}</small>
                    </div>

                    <div className="projectActions refinedActions">
                      <button className="projectAction primaryAction" onClick={() => { setProjectOpen(item); setProjectMode("view"); }}>查看</button>
                      <button className="projectAction secondaryAction" onClick={() => { setProjectOpen(item); setProjectMode("edit"); }}>编辑</button>
                      <button className="projectAction tertiaryAction" onClick={() => setPage("点位管理")}>点位</button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        ) : (
          <section className="placeholderPage">
            <small>当前预览重点</small>
            <h1>{page}</h1>
            <p>本轮先把你指出的关键问题做成可预览方案：视频可见、素材可选下载、点位详情叠层查看、点位与项目分层编辑。其他页面暂未改动。</p>
          </section>
        )}
      </main>

      {preview && (
        <div className="modal" onClick={closePreview}>
          <section className="previewModal premiumPreview" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <small>素材预览 / Preview</small>
                <b>{preview.file}</b>
                <span>{preview.kind} · 点位 {preview.point} · {previewIndex + 1}/{previewItems.length}</span>
              </div>
              <div className="previewActions">
                <button>下载当前素材</button>
                <button onClick={closePreview}>×</button>
              </div>
            </header>
            <div className="premiumPreviewBody">
              <div className="stage">
                {preview.type === "video" ? <video src={preview.src} controls autoPlay /> : <img src={preview.src} alt={preview.kind} />}
                <button className="nav prev" onClick={showPreviousPreview} disabled={!canPreviewPrev}>‹</button>
                <button className="nav next" onClick={showNextPreview} disabled={!canPreviewNext}>›</button>
              </div>
              <aside className="previewInfo">
                <h3>文件信息</h3>
                <div><span>素材分类</span><b>{preview.kind}</b></div>
                <div><span>点位编号</span><b>{preview.point}</b></div>
                <div><span>所属项目</span><b>{preview.project}</b></div>
                <div><span>上传时间</span><b>{preview.createdAt}</b></div>
                <div><span>文件类型</span><b>{preview.type === "video" ? "视频 / MP4" : "图片"}</b></div>
              </aside>
            </div>
          </section>
        </div>
      )}

      {batchPointTagOpen && (
        <div className="detailOverlay" onMouseDown={() => setBatchPointTagOpen(false)}>
          <section className="batchPointTagModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>{batchPointTagMode === "add" ? "批量打标签 / Batch Add Tags" : "批量移除标签 / Batch Remove Tags"}</small>
                <h2>{batchPointTagMode === "add" ? "给所选点位批量打标签" : "从所选点位批量移除标签"}</h2>
                <p>已选 {selectedPointIds.length} 个点位，点击标签即可选择，不必逐个进入详情编辑。</p>
              </div>
              <button onClick={() => setBatchPointTagOpen(false)}>×</button>
            </header>
            <section className="batchTagBody">
              <div>
                <h3>{batchPointTagMode === "add" ? "最近使用" : "可移除标签"}</h3>
                <div className="tagSelector batchSelector">
                  {recentTags.map((tag) => (
                    <button type="button" key={tag} className={batchSelectedTags.includes(tag) ? "selected" : ""} onClick={() => toggleBatchSelectedTag(tag)}>{tag}</button>
                  ))}
                </div>
              </div>
              <div className="batchTagSummary">
                <span>已选标签</span>
                <b>{batchSelectedTags.length > 0 ? batchSelectedTags.join("、") : "暂未选择标签"}</b>
              </div>
            </section>
            <footer>
              <button onClick={() => setBatchPointTagOpen(false)}>取消</button>
              <button className="primary">{batchPointTagMode === "add" ? "确认批量打标签" : "确认批量移除"}</button>
            </footer>
          </section>
        </div>
      )}

      {tagManagerOpen && (
        <div className="detailOverlay" onMouseDown={() => setTagManagerOpen(false)}>
          <section className="tagManagerModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>标签管理 / Tag Center</small>
                <h2>点位标签管理</h2>
                <p>统一维护点位标签，日常操作尽量简单，需要时再展开批量功能。</p>
              </div>
              <button onClick={() => setTagManagerOpen(false)}>×</button>
            </header>

            <section className="tagManagerToolbar simpleToolbar">
              <select value={tagManagerProject} onChange={(event) => setTagManagerProject(event.target.value)}>
                <option>全部项目</option>
                {projects.map((item) => <option key={item.id}>{item.name}</option>)}
              </select>
              <div className="inlineAdd tagAddBar">
                <input value={tagDraft} onChange={(event) => setTagDraft(event.target.value)} placeholder="新增标签，例如：医院附近" />
                <button type="button">添加</button>
              </div>
              <button type="button" className="softButton" onClick={() => setBulkTagOpen((open) => !open)}>
                {bulkTagOpen ? "收起批量新增" : "批量新增"}
              </button>
            </section>

            <section className="recentTagStrip">
              <span>最近使用</span>
              <div>
                {recentTags.map((item) => (
                  <button type="button" key={item} onClick={() => useRecentTag(item)}>{item}</button>
                ))}
              </div>
            </section>

            {bulkTagOpen && (
              <section className="bulkTagPanel compactBulkPanel">
                <textarea
                  value={bulkTagDraft}
                  onChange={(event) => setBulkTagDraft(event.target.value)}
                  placeholder={`一行一个，或用逗号隔开，例如：
医院附近
高速口
国道旁`}
                />
                <button type="button" className="primary">批量添加</button>
              </section>
            )}

            <section className={`tagBatchBar ${selectedManagedTagKeys.length > 0 ? "active" : ""}`}>
              <label>
                <input type="checkbox" checked={allVisibleManagedSelected} onChange={toggleAllVisibleManagedTags} />
                <span>{allVisibleManagedSelected ? "取消全选" : "全选当前结果"}</span>
              </label>
              <b>{selectedManagedTagKeys.length > 0 ? `已选 ${selectedManagedTagKeys.length} 个标签` : "点击任意标签行即可多选"}</b>
              {selectedManagedTagKeys.length > 0 && (
                <div>
                  <button type="button">批量停用</button>
                  <button type="button">批量合并</button>
                  <button type="button" className="danger">批量删除</button>
                </div>
              )}
            </section>

            <section className="tagManagerTable">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>标签</th>
                    <th>所属项目</th>
                    <th>使用点位数</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleManagedTags.map((item) => {
                    const tagKey = `${item.project}-${item.name}`;
                    const isSelected = selectedManagedTagKeys.includes(tagKey);
                    return (
                      <tr className={isSelected ? "selected" : ""} key={tagKey} onClick={() => toggleManagedTag(item)}>
                        <td>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(event) => event.stopPropagation()}
                            onChange={() => toggleManagedTag(item)}
                          />
                        </td>
                        <td><b>{item.name}</b></td>
                        <td>{item.project}</td>
                        <td>{item.points}</td>
                        <td>
                          <span className={item.status === "启用" ? "tagStatus active" : "tagStatus merge"}>{item.status}</span>
                        </td>
                        <td>
                          <div className="tagActions">
                            <button type="button" onClick={(event) => event.stopPropagation()}>编辑</button>
                            {item.points > 0 ? (
                              <button type="button" onClick={(event) => event.stopPropagation()}>停用</button>
                            ) : (
                              <button type="button" onClick={(event) => event.stopPropagation()}>删除</button>
                            )}
                            {item.status === "待合并" && (
                              <button type="button" className="primary" onClick={(event) => event.stopPropagation()}>合并</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </section>
        </div>
      )}

      {pointCreateOpen && (
        <div className="detailOverlay" onMouseDown={() => setPointCreateOpen(false)}>
          <section className="editModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>新增点位 / Create Point</small>
                <h2>新增一个执行点位</h2>
                <p>新建单个点位后，可继续派单、上传素材并纳入项目规则。</p>
              </div>
              <button onClick={() => setPointCreateOpen(false)}>×</button>
            </header>
            <div className="editGrid">
              <label><span>点位编号</span><input placeholder="例如：GZ-BY-001" /></label>
              <label><span>所属项目</span><select defaultValue=""><option value="" disabled>请选择项目</option><option>{point.project}</option><option>阿康化肥春耕项目</option></select></label>
              <label className="wide"><span>点位地址</span><input placeholder="请输入完整地址，后续自动地理编码" /></label>
              <label><span>K码</span><input placeholder="可选填" /></label>
              <label className="wide"><span>点位标签</span>
                <div className="tagSelector">
                  {primaryProject.pointTagLibrary.map((tag) => (
                    <button type="button" key={tag} className={selectedPointTags.includes(tag) ? "selected" : ""} onClick={() => togglePointTag(tag)}>{tag}</button>
                  ))}
                </div>
                <div className="inlineAdd">
                  <input value={draftPointTag} onChange={(event) => setDraftPointTag(event.target.value)} placeholder="输入自定义标签" />
                  <button type="button" onClick={addDraftPointTag}>添加</button>
                </div>
              </label>
              <label><span>房东姓名</span><input placeholder="请输入房东姓名" /></label>
              <label><span>房东手机号</span><input placeholder="请输入房东手机号" /></label>
              <label><span>施工队长</span><input placeholder="可后续派单" /></label>
              <label><span>找墙队伍</span><input placeholder="可选填" /></label>
              <label><span>初始状态</span><select defaultValue="待派单"><option>待派单</option><option>已派单</option><option>待施工</option></select></label>
            </div>
            <footer>
              <button onClick={() => setPointCreateOpen(false)}>取消</button>
              <button className="primary" onClick={() => { setPointCreateOpen(false); setPointCreatedOpen(true); }}>保存并创建</button>
            </footer>
          </section>
        </div>
      )}

      {pointImportOpen && (
        <div className="detailOverlay" onMouseDown={() => setPointImportOpen(false)}>
          <section className="importModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>批量导入 / Batch Import</small>
                <h2>批量导入点位</h2>
                <p>先上传表格，系统预检查后再写入，避免大量错误数据直接进入后台。</p>
              </div>
              <button onClick={() => setPointImportOpen(false)}>×</button>
            </header>
            <div className="importBody">
              <section className="uploadZone">
                <b>拖拽 Excel 到这里，或点击选择文件</b>
                <span>支持 .xlsx / .csv，建议先下载标准模板填写</span>
                <div>
                  <button>下载导入模板</button>
                  <button className="primary">选择文件</button>
                </div>
              </section>
              <section className="importSteps">
                <article><b>1</b><span>上传表格</span></article>
                <article><b>2</b><span>字段预检查</span></article>
                <article><b>3</b><span>地址自动匹配</span></article>
                <article><b>4</b><span>确认写入</span></article>
              </section>
              <section className="importNote">
                <h3>建议检查项</h3>
                <div>点位编号是否重复</div>
                <div>项目是否存在</div>
                <div>地址是否可识别</div>
                <div>手机号格式是否正确</div>
              </section>
            </div>
          </section>
        </div>
      )}

      {projectCreateOpen && (
        <div className="detailOverlay" onMouseDown={() => setProjectCreateOpen(false)}>
          <section className="projectModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>新建项目 / Create Project</small>
                <h2>创建新项目</h2>
                <p>先定义项目规则，后续新建点位会自动沿用本项目素材要求。</p>
              </div>
              <button onClick={() => setProjectCreateOpen(false)}>×</button>
            </header>
            <div className="editGrid projectEditGrid">
              <label><span>项目名称</span><input placeholder="请输入项目名称" /></label>
              <label><span>所属月份</span><input placeholder="例如：2026 年 5 月" /></label>
              <label><span>项目状态</span><select defaultValue="筹备中"><option>筹备中</option><option>进行中</option><option>已结束</option><option>隐藏</option></select></label>
              <label className="wide"><span>项目说明</span><textarea placeholder="简要说明投放范围、执行目标、客户要求" /></label>
              <label className="wide"><span>项目标签</span><input placeholder="例如：饮料，重点项目" /></label>
            </div>
            <section className="projectTagEditor">
              <div>
                <h3>点位标签库</h3>
                <p>在项目级统一维护可用标签，点位录入时优先勾选，避免“学校旁 / 学校附近 / 学校周边”混成不同标签。</p>
              </div>
              <div className="tagLibrary">
                {primaryProject.pointTagLibrary.map((item) => <span key={item}>{item}</span>)}
              </div>
              <div className="inlineAdd">
                <input value={draftProjectTag} onChange={(event) => setDraftProjectTag(event.target.value)} placeholder="新增项目点位标签" />
                <button type="button">添加标签</button>
              </div>
            </section>
            <section className="ruleEditor">
              <h3>素材必传规则</h3>
              {kinds.filter((item) => item !== "全部素材").map((item) => (
                <label key={item}>
                  <input type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </section>
            <footer>
              <button onClick={() => setProjectCreateOpen(false)}>取消</button>
              <button className="primary" onClick={() => { setProjectCreateOpen(false); setProjectCreatedOpen(true); }}>创建项目</button>
            </footer>
          </section>
        </div>
      )}

      {pointCreatedOpen && (
        <div className="detailOverlay" onMouseDown={() => setPointCreatedOpen(false)}>
          <section className="successModal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="successIcon">✓</div>
            <small>新增成功 / Point Created</small>
            <h2>点位已创建</h2>
            <p>点位已进入“待派单”状态。你可以继续新增，或直接进入派单流程。</p>
            <div className="successActions">
              <button onClick={() => setPointCreatedOpen(false)}>返回点位列表</button>
              <button onClick={() => { setPointCreatedOpen(false); setPointCreateOpen(true); }}>继续新增点位</button>
              <button className="primary" onClick={() => { setPointCreatedOpen(false); openDispatchForPoint(point.id); }}>立即派单</button>
            </div>
          </section>
        </div>
      )}

      {projectCreatedOpen && (
        <div className="detailOverlay" onMouseDown={() => setProjectCreatedOpen(false)}>
          <section className="successModal projectSuccess" onMouseDown={(event) => event.stopPropagation()}>
            <div className="successIcon">✓</div>
            <small>创建成功 / Project Created</small>
            <h2>项目已创建</h2>
            <p>项目规则已经保存。下一步最推荐直接导入本项目点位，让项目尽快进入执行。</p>
            <section className="nextStepPanel">
              <article>
                <b>推荐下一步</b>
                <span>批量导入项目点位</span>
              </article>
              <article>
                <b>已完成</b>
                <span>项目名称、状态、标签、素材规则</span>
              </article>
            </section>
            <div className="successActions">
              <button onClick={() => setProjectCreatedOpen(false)}>稍后再说</button>
              <button onClick={() => { setProjectCreatedOpen(false); setPage("项目管理"); }}>查看项目</button>
              <button className="primary" onClick={() => { setProjectCreatedOpen(false); setPage("点位管理"); setPointImportOpen(true); }}>继续批量导入点位</button>
            </div>
          </section>
        </div>
      )}

      {dispatchSuccessOpen && (
        <div className="detailOverlay" onMouseDown={() => setDispatchSuccessOpen(false)}>
          <section className="successModal dispatchSuccess" onMouseDown={(event) => event.stopPropagation()}>
            <div className="successIcon">✓</div>
            <small>派单成功 / Dispatch Sent</small>
            <h2>已派给 {selectedWorker?.name}</h2>
            <p>本次共派出 {dispatchSelectedPoints.length} 个点位，师傅端 H5 已可查看任务。</p>
            <section className="dispatchResultPanel">
              <article>
                <span>点位数量</span>
                <b>{dispatchSelectedPoints.length}</b>
              </article>
              <article>
                <span>师傅随机入口</span>
                <b>{selectedWorker?.entry}</b>
              </article>
            </section>
            <div className="successActions">
              <button onClick={() => setDispatchSuccessOpen(false)}>继续派单</button>
              <button>复制师傅链接</button>
              <button className="primary" onClick={() => { setDispatchSuccessOpen(false); openWorkerMap(selectedWorker?.name); }}>查看本批任务</button>
            </div>
          </section>
        </div>
      )}

      {pointEditOpen && (
        <div className="detailOverlay" onMouseDown={() => setPointEditOpen(false)}>
          <section className="editModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>点位编辑 / Edit Point</small>
                <h2>编辑点位 001</h2>
                <p>修改单个点位的执行信息，不影响项目级规则。</p>
              </div>
              <button onClick={() => setPointEditOpen(false)}>×</button>
            </header>
            <div className="editGrid">
              <label><span>点位编号</span><input defaultValue="001" /></label>
              <label><span>所属项目</span><select defaultValue={point.project}><option>{point.project}</option><option>阿康化肥春耕项目</option></select></label>
              <label className="wide"><span>点位地址</span><input defaultValue={point.address} /></label>
              <label><span>K码</span><input defaultValue={point.kCode} /></label>
              <label className="wide"><span>点位标签</span>
                <div className="tagSelector">
                  {primaryProject.pointTagLibrary.map((tag) => (
                    <button type="button" key={tag} className={selectedPointTags.includes(tag) ? "selected" : ""} onClick={() => togglePointTag(tag)}>{tag}</button>
                  ))}
                </div>
                <div className="inlineAdd">
                  <input value={draftPointTag} onChange={(event) => setDraftPointTag(event.target.value)} placeholder="输入自定义标签" />
                  <button type="button" onClick={addDraftPointTag}>添加</button>
                </div>
              </label>
              <label><span>房东姓名</span><input defaultValue="黄先生" /></label>
              <label><span>房东手机号</span><input defaultValue="13888888899" /></label>
              <label><span>施工队长</span><input defaultValue="张师傅" /></label>
              <label><span>施工队长手机号</span><input defaultValue="13966666688" /></label>
              <label><span>找墙队伍</span><input defaultValue="刘师傅" /></label>
              <label><span>找墙队伍手机号</span><input defaultValue="13755555566" /></label>
              <label><span>当前状态</span><select defaultValue="已上传素材"><option>待派单</option><option>施工中</option><option>已上传素材</option><option>待验收</option><option>已完成</option></select></label>
            </div>
            <footer>
              <button onClick={() => setPointEditOpen(false)}>取消</button>
              <button className="primary">保存修改</button>
            </footer>
          </section>
        </div>
      )}

      {workerOpen && (
        <div className="detailOverlay" onMouseDown={() => setWorkerOpen(null)}>
          <section className="workerModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>{workerMode === "edit" ? "师傅编辑 / Edit Worker" : "师傅详情 / Worker View"}</small>
                <h2>{workerOpen.name}</h2>
                <p>{workerOpen.team} · {workerOpen.region}</p>
              </div>
              <div className="headerActions">
                {workerMode === "view" && <button className="textButton" onClick={() => setWorkerMode("edit")}>编辑师傅</button>}
                <button onClick={() => setWorkerOpen(null)}>×</button>
              </div>
            </header>
            {workerMode === "view" ? (
              <div className="workerModalBody">
                <section className="workerOverview">
                  <article><span>在线状态</span><b>{workerOpen.online ? "在线" : "离线"}</b></article>
                  <article><span>在手任务</span><b>{workerOpen.activeTasks}</b></article>
                  <article><span>近 7 天完成</span><b>{workerOpen.completed7d}</b></article>
                  <article><span>今日完成</span><b>{workerOpen.completedToday}</b></article>
                </section>
                <section className="workerPanelGrid">
                  <article>
                    <h3>基础信息</h3>
                    <div><span>手机号</span><b>{workerOpen.phone}</b></div>
                    <div><span>所属队伍</span><b>{workerOpen.team}</b></div>
                    <div><span>负责区域</span><b>{workerOpen.region}</b></div>
                    <div><span>最近活跃</span><b>{workerOpen.lastActive}</b></div>
                  </article>
                  <article>
                    <h3>手机端入口</h3>
                    <div><span>入口地址</span><b>{workerOpen.entry}</b></div>
                    <div><span>绑定状态</span><b>{workerOpen.mobileBound ? "已绑定" : "待首次绑定"}</b></div>
                    <p>系统为每位师傅生成随机唯一入口。首次绑定后，后台可精准派单；如链接泄露，可重新生成。</p>
                    <div className="workerEntryActions">
                      <button>复制入口</button>
                      <button onClick={() => setWorkerMobilePreviewOpen(true)}>预览手机端</button>
                      <button onClick={() => setRegenerateWorkerOpen(true)}>重新生成链接</button>
                    </div>
                  </article>
                </section>
                <section className="workerNotePanel">
                  <h3>执行备注</h3>
                  <p>{workerOpen.note}</p>
                </section>
              </div>
            ) : (
              <>
                <div className="editGrid workerEditGrid">
                  <label><span>姓名</span><input defaultValue={workerOpen.name} /></label>
                  <label><span>手机号</span><input defaultValue={workerOpen.phone} /></label>
                  <label><span>所属队伍</span><select defaultValue={workerOpen.team}><option>安装队伍</option><option>找墙队伍</option></select></label>
                  <label><span>负责区域</span><input defaultValue={workerOpen.region} /></label>
                  <label><span>当前状态</span><select defaultValue={workerOpen.online ? "在线" : "离线"}><option>在线</option><option>离线</option></select></label>
                  <label><span>手机端绑定</span><select defaultValue={workerOpen.mobileBound ? "已绑定" : "待首次绑定"}><option>已绑定</option><option>待首次绑定</option></select></label>
                  <label className="wide"><span>执行备注</span><textarea defaultValue={workerOpen.note} /></label>
                </div>
                <section className="workerEditHint">
                  <b>规则建议</b>
                  <span>师傅首次确认姓名格式和手机号后，应锁定关键身份信息，避免派单入口对应错人。</span>
                </section>
                <footer>
                  <button onClick={() => setWorkerMode("view")}>取消</button>
                  <button className="primary">保存师傅</button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}

      {workerMobilePreviewOpen && workerOpen && (
        <div className="detailOverlay mobilePreviewLayer" onMouseDown={() => setWorkerMobilePreviewOpen(false)}>
          <section className="mobilePreviewModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>师傅端预览 / Worker H5</small>
                <h2>打开链接后自动请求定位</h2>
                <p>不再要求师傅手动点“开启定位”，页面加载后即主动申请权限并持续上报位置。</p>
              </div>
              <button onClick={() => setWorkerMobilePreviewOpen(false)}>×</button>
            </header>
            <div className="mobilePreviewLayout">
              <aside className="mobileFlowNotes">
                <h3>正式流程</h3>
                <ol>
                  <li>首次进入先完成身份绑定</li>
                  <li>进入任务页时自动请求定位</li>
                  <li>定位正常后不占版面，只保留小状态</li>
                  <li>一页只显示一个点位，可左右切换</li>
                  <li>上传后立即回显素材</li>
                  <li>必传素材齐全后自动完成，无需手动确认</li>
                  <li>5 分钟内可替换 / 撤回，超时后仅预览</li>
                </ol>
                <div className="mobileStateSwitch">
                  <span>预览页面</span>
                  <button className={mobileScreen === "bind" ? "active" : ""} onClick={() => setMobileScreen("bind")}>首次绑定</button>
                  <button className={mobileScreen === "tasks" ? "active" : ""} onClick={() => setMobileScreen("tasks")}>任务执行</button>
                </div>
                {mobileScreen === "tasks" && (
                  <div className="mobileStateSwitch compactSwitch">
                    <span>定位状态</span>
                    <button className={mobileLocationState === "locating" ? "active" : ""} onClick={() => setMobileLocationState("locating")}>请求中</button>
                    <button className={mobileLocationState === "active" ? "active" : ""} onClick={() => setMobileLocationState("active")}>已定位</button>
                    <button className={mobileLocationState === "denied" ? "active" : ""} onClick={() => setMobileLocationState("denied")}>已拒绝</button>
                  </div>
                )}
              </aside>
              <section className="phoneFrame">
                <div className="phoneTop" />
                <div className="phoneScreen">
                  {mobileScreen === "bind" ? (
                    <>
                      <div className="workerMobileHeader bindHeader">
                        <div>
                          <small>首次进入</small>
                          <h3>确认师傅身份</h3>
                        </div>
                        <span>一次确认后锁定</span>
                      </div>
                      <section className="bindingCard">
                        <label>
                          <span>姓名</span>
                          <input defaultValue={workerOpen.name} />
                        </label>
                        <label>
                          <span>队伍类型</span>
                          <select defaultValue={workerOpen.team}>
                            <option>安装队伍</option>
                            <option>找墙队伍</option>
                          </select>
                        </label>
                        <label>
                          <span>手机号</span>
                          <input defaultValue="13966666688" />
                        </label>
                        <p>确认后，姓名格式、队伍类型和手机号将锁定，后台会按此身份精准派单。</p>
                        <button className="mobilePrimary" onClick={() => setMobileScreen("tasks")}>确认并进入任务</button>
                      </section>
                    </>
                  ) : (
                    <>
                      <div className="workerMobileHeader">
                        <div>
                          <small>{workerOpen.name}</small>
                          <h3>今日任务</h3>
                        </div>
                        <div className="mobileHeaderMeta">
                          {mobileLocationState === "active" && <i>定位正常</i>}
                          <span>{workerOpen.team}</span>
                        </div>
                      </div>

                      <section className="mobileTaskSummary">
                        <div>
                          <span>今日进度</span>
                          <b>{completedMobileTasks} / {mobileTasks.length} 已完成</b>
                        </div>
                        <em><i style={{ width: `${Math.round((completedMobileTasks / mobileTasks.length) * 100)}%` }} /></em>
                      </section>

                      <section className="mobileTaskRail">
                        {mobileTasks.map((task, index) => {
                          const complete = isMobileTaskComplete(task);
                          const status = complete ? "已完成" : task.uploaded.length > 0 ? "施工中" : "待执行";
                          return (
                            <button
                              key={task.code}
                              className={`${index === mobileTaskIndex ? "active" : ""} ${complete ? "done" : ""}`}
                              onClick={() => setMobileTaskIndex(index)}
                            >
                              <b>{task.code}</b>
                              <span>{status}</span>
                            </button>
                          );
                        })}
                      </section>

                      {mobileLocationState === "locating" && (
                        <section className="locationCard locating">
                          <b>正在自动获取当前位置…</b>
                          <span>首次进入时，浏览器会弹出定位授权提示</span>
                          <em>无需师傅手动点开启</em>
                        </section>
                      )}

                      {mobileLocationState === "denied" && (
                        <section className="locationCard denied">
                          <b>需要开启定位后才能继续执行</b>
                          <span>当前无法上报位置，任务操作暂时锁定</span>
                          <div>
                            <button>重新获取定位</button>
                            <button>查看开启方法</button>
                          </div>
                        </section>
                      )}

                      <section className={`mobileTaskCard ${mobileLocationState === "denied" ? "locked" : ""}`}>
                        <div className="mobileTaskTop">
                          <small>{mobileTaskIndex + 1} / {mobileTasks.length}</small>
                          <b>点位 {currentMobileTask.code}</b>
                          <em className={currentMobileTaskComplete ? "done" : ""}>{currentMobileTaskStatus}</em>
                        </div>
                        <p>{currentMobileTask.address}</p>
                        <div className="mobileTagRow">
                          {currentMobileTask.tags.map((tag) => <span key={tag}>{tag}</span>)}
                        </div>
                        <article>
                          <span>第一步</span>
                          <b>{currentMobileTask.firstStep}</b>
                        </article>
                        <article>
                          <span>第二步</span>
                          <b>{currentMobileTask.secondStep}</b>
                        </article>
                        {currentMobileTaskComplete ? (
                          <section className="mobileAutoDone">
                            <b>必传素材已齐全</b>
                            <span>系统已自动将该点位更新为“已完成”</span>
                          </section>
                        ) : (
                          <button className="mobilePrimary" disabled={mobileLocationState === "denied"}>上传素材</button>
                        )}
                        <div className="mobileTaskPager">
                          <button disabled={mobileTaskIndex === 0} onClick={() => setMobileTaskIndex((index) => Math.max(0, index - 1))}>上一点</button>
                          <span>左右滑动切换点位</span>
                          <button disabled={mobileTaskIndex === mobileTasks.length - 1} onClick={() => setMobileTaskIndex((index) => Math.min(mobileTasks.length - 1, index + 1))}>下一点</button>
                        </div>
                      </section>

                      <section className={`mobileUploadedPanel ${mobileLocationState === "denied" ? "locked" : ""}`}>
                        <div className="mobileUploadedHead">
                          <div>
                            <h3>已上传素材</h3>
                            <span>用于确认是否已传、是否传错</span>
                          </div>
                          <small>5 分钟内可处理</small>
                        </div>
                        {currentMobileTask.uploaded.length === 0 ? (
                          <div className="mobileUploadEmpty">当前点位还没有上传素材</div>
                        ) : currentMobileTask.uploaded.map((item) => (
                          <article className={`mobileUploadItem ${item.editable ? "editable" : "lockedItem"}`} key={`${currentMobileTask.code}-${item.kind}`}>
                            <div className={`mobileThumb ${item.thumb}`} />
                            <div>
                              <b>{item.kind}</b>
                              <span>{item.time} · {item.countdown}</span>
                            </div>
                            <div className="mobileUploadActions">
                              <button>预览</button>
                              {item.editable && <button>替换</button>}
                              {item.editable && <button className="dangerText">撤回</button>}
                            </div>
                          </article>
                        ))}
                        <p className="mobileUploadHint">上传后 5 分钟内可预览、替换或撤回；超过 5 分钟后保留预览入口，但不再允许撤回，避免工人误删正式素材。</p>
                      </section>
                    </>
                  )}
                </div>
              </section>
            </div>
          </section>
        </div>
      )}

      {regenerateWorkerOpen && workerOpen && (
        <div className="detailOverlay confirmLayer" onMouseDown={() => setRegenerateWorkerOpen(false)}>
          <section className="confirmModal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="warningIcon">!</div>
            <small>重新生成入口 / Regenerate Link</small>
            <h2>确认重新生成师傅链接？</h2>
            <p>重新生成后，旧链接将立即失效。{workerOpen.name} 需要使用新链接重新进入手机端，已派任务不会丢失。</p>
            <div className="confirmDetails">
              <div><span>当前师傅</span><b>{workerOpen.name}</b></div>
              <div><span>当前入口</span><b>{workerOpen.entry}</b></div>
            </div>
            <div className="successActions">
              <button onClick={() => setRegenerateWorkerOpen(false)}>取消</button>
              <button className="dangerSolid">确认重新生成</button>
            </div>
          </section>
        </div>
      )}

      {projectOpen && (
        <div className="detailOverlay" onMouseDown={() => setProjectOpen(null)}>
          <section className="projectModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>{projectMode === "edit" ? "项目编辑 / Edit Project" : "项目详情 / Project View"}</small>
                <h2>{projectOpen.name}</h2>
                <p>{projectOpen.month} · {projectOpen.status}</p>
              </div>
              <div className="headerActions">
                {projectMode === "view" && <button className="textButton" onClick={() => setProjectMode("edit")}>编辑项目</button>}
                <button onClick={() => setProjectOpen(null)}>×</button>
              </div>
            </header>
            {projectMode === "view" ? (
              <div className="projectModalBody">
                <section className="projectOverview">
                  <article><span>总点位</span><b>{projectOpen.points}</b></article>
                  <article><span>已完成</span><b>{projectOpen.completed}</b></article>
                  <article><span>异常</span><b>{projectOpen.abnormal}</b></article>
                </section>
                <section className="projectPanel">
                  <h3>项目说明</h3>
                  <p>{projectOpen.description}</p>
                </section>
                <section className="projectPanel">
                  <h3>素材必传规则</h3>
                  <div className="ruleTags">
                    {projectOpen.required.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </section>
                <section className="projectPanel">
                  <h3>项目标签</h3>
                  <div className="tagRow projectTags">
                    {projectOpen.tags.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </section>
                <section className="projectPanel">
                  <h3>点位标签库</h3>
                  <p>这些标签可在新增 / 编辑点位时直接勾选，也可用于派单中心快速筛选。</p>
                  <div className="tagLibrary viewLibrary">
                    {projectOpen.pointTagLibrary.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </section>
              </div>
            ) : (
              <>
                <div className="editGrid projectEditGrid">
                  <label><span>项目名称</span><input defaultValue={projectOpen.name} /></label>
                  <label><span>所属月份</span><input defaultValue={projectOpen.month} /></label>
                  <label><span>项目状态</span><select defaultValue={projectOpen.status}><option>筹备中</option><option>进行中</option><option>已结束</option><option>隐藏</option></select></label>
                  <label className="wide"><span>项目说明</span><textarea defaultValue={projectOpen.description} /></label>
                  <label className="wide"><span>项目标签</span><input defaultValue={projectOpen.tags.join("，")} /></label>
                </div>
                <section className="projectTagEditor editMode">
                  <div>
                    <h3>点位标签库</h3>
                    <p>维护本项目可用的标准标签，点位录入时优先从这里勾选。</p>
                  </div>
                  <div className="tagLibrary">
                    {projectOpen.pointTagLibrary.map((item) => <span key={item}>{item}</span>)}
                  </div>
                  <div className="inlineAdd">
                    <input value={draftProjectTag} onChange={(event) => setDraftProjectTag(event.target.value)} placeholder="新增项目点位标签" />
                    <button type="button">添加标签</button>
                  </div>
                </section>
                <section className="ruleEditor">
                  <h3>素材必传规则</h3>
                  {kinds.filter((item) => item !== "全部素材").map((item) => (
                    <label key={item}>
                      <input type="checkbox" defaultChecked={projectOpen.required.includes(item)} />
                      <span>{item}</span>
                    </label>
                  ))}
                </section>
                <footer>
                  <button onClick={() => setProjectMode("view")}>取消</button>
                  <button className="primary">保存项目</button>
                </footer>
              </>
            )}
          </section>
        </div>
      )}

      {detailOpen && (
        <div className="detailOverlay" onMouseDown={() => setDetailOpen(false)}>
          <section className="detailModal" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>点位详情 / Detail View</small>
                <h2>{activeDetailPoint.id}</h2>
                <p>{activeDetailPoint.address}</p>
              </div>
              <div className="headerActions">
                <button className="textButton" onClick={() => setPointEditOpen(true)}>编辑点位</button>
                <button onClick={() => setDetailOpen(false)}>×</button>
              </div>
            </header>
            <div className="detailLayout">
              <section className="detailInfo">
                <div className="detailBlockTitle">
                  <h3>基础信息</h3>
                  <span>{activeDetailPoint.status}</span>
                </div>
                <div><span>项目</span><b>{activeDetailPoint.project}</b></div>
                <div><span>K码</span><b>{activeDetailPoint.kCode}</b></div>
                <div><span>房东</span><b>{activeDetailPoint.landlord}</b></div>
                <div><span>施工队长</span><b>{activeDetailPoint.captain}</b></div>
                <div><span>找墙队伍</span><b>{activeDetailPoint.scout}</b></div>
              </section>
              <section className="detailMain">
                <div className="detailMetrics">
                  <article>
                    <span>素材完整度</span>
                    <b>{activeDetailPoint.materialProgress}%</b>
                    <em><i style={{ width: `${activeDetailPoint.materialProgress}%` }} /></em>
                  </article>
                  <article>
                    <span>必传素材</span>
                    <b>{activeDetailPoint.required.filter((item) => item.done).length}/{activeDetailPoint.required.length}</b>
                    <small>按项目规则判断</small>
                  </article>
                  <article>
                    <span>异常</span>
                    <b>{activeDetailPoint.required.some((item) => !item.done) ? "有待补素材" : "无异常"}</b>
                    <small>{activeDetailPoint.required.some((item) => !item.done) ? "待补齐后可验收" : "当前可进入验收"}</small>
                  </article>
                </div>
                <section className="requiredPanel">
                  <h3>必传素材完成情况</h3>
                  <div>
                    {activeDetailPoint.required.map((item) => (
                      <span key={item.label} className={item.done ? "done" : "missing"}>
                        {item.done ? "✓" : "!"} {item.label} · {item.count}
                      </span>
                    ))}
                  </div>
                </section>
                <section className="detailMedia">
                <h3>素材预览</h3>
                <div className="detailMediaGrid">
                  {initialMedia.filter((m) => m.point === activeDetailPoint.id).map((item) => (
                    <button key={item.id} onDoubleClick={() => openPreview(item, "point")} title="双击预览">
                      {item.type === "video" ? <video src={item.src} muted /> : <img src={item.src} alt={item.kind} />}
                      <span>{item.kind}</span>
                    </button>
                  ))}
                </div>
                </section>
                <section className="timelinePanel">
                  <h3>状态流转</h3>
                  {activeDetailPoint.timeline.map((item) => (
                    <div key={item.time}>
                      <time>{item.time}</time>
                      <b>{item.title}</b>
                      <span>{item.desc}</span>
                    </div>
                  ))}
                </section>
              </section>
            </div>
          </section>
        </div>
      )}

      <style>{css}</style>
    </div>
  );
}

const css = `
*{box-sizing:border-box}body{margin:0;font-family:Arial,"Microsoft YaHei",sans-serif;background:#f4f7fb;color:#132033}.app{min-height:100vh;display:grid;grid-template-columns:200px 1fr}.app>aside{background:#0d1b31;color:#fff;padding:18px;position:sticky;top:0;height:100vh;align-self:start;overflow:auto}.logo{width:42px;height:42px;border-radius:14px;background:#1f6fff;display:grid;place-items:center;font-weight:700;margin-bottom:22px}nav{display:grid;gap:8px}nav button{border:0;background:transparent;color:#b8c5d9;text-align:left;padding:12px;border-radius:14px}nav button.active{background:#17345f;color:#fff}main{padding:22px}.mapMain{height:100vh;overflow:hidden;padding:14px;display:grid;grid-template-rows:auto auto auto auto minmax(0,1fr);gap:10px}.mapMain .mapPageHeader,.mapMain .mapKpiStrip,.mapMain .mapToolbar,.mapMain .mapSelectionBasket{margin-bottom:0}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}header small{display:block;color:#6b7a90;margin-bottom:5px}h1,h2,h3,p{margin:0}.ghost,.toolbar button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.toolbar button:disabled{opacity:.45;cursor:not-allowed}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.pointToolbar{display:flex;gap:10px;background:#fff;border-radius:18px;padding:14px;margin-bottom:16px}.pointToolbar input{flex:1;border:1px solid #d7dfeb;border-radius:14px;padding:0 14px}.pointToolbar button,.pointTableWrap button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.pointToolbar button:disabled{opacity:.45;cursor:not-allowed}.pointBatchBar{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;border-radius:18px;padding:14px 16px;margin-bottom:16px;color:#6b7a90}.pointBatchBar.active{color:#132033}.pointBatchBar div{display:flex;gap:8px;flex-wrap:wrap}.pointBatchBar button{border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:12px}.pointTableWrap{background:#fff;border-radius:20px;padding:12px}.pointTableWrap table{width:100%;border-collapse:collapse}.pointTableWrap th,.pointTableWrap td{text-align:left;padding:16px 12px;border-bottom:1px solid #edf1f6;vertical-align:top}.pointTableWrap th:first-child,.pointTableWrap td:first-child{width:34px}.pointTableWrap tbody tr{cursor:pointer;transition:background .16s ease}.pointTableWrap tbody tr:hover{background:#f8fbff}.pointTableWrap tbody tr.selected{background:#eef5ff}.pointTableWrap tbody tr.selected td:first-child{border-left:3px solid #2563eb}.pointTableWrap th{white-space:nowrap}.pointTableWrap .small{padding:8px 12px}.rowActions{display:flex;gap:8px;flex-wrap:wrap}.projectCell,.addressCell,.workerCell,.materialCell,.updateCell{display:grid;gap:5px}.projectCell b,.addressCell b,.workerCell b,.materialCell b,.updateCell b{line-height:1.4}.tagRow{display:flex;gap:6px;flex-wrap:wrap}.tagRow span{display:inline-flex;padding:4px 8px;border-radius:999px;background:#eef4ff;color:#315fd8;font-size:12px;font-weight:700}.addressCell small,.workerCell small,.materialCell small,.updateCell small{color:#6b7a90;line-height:1.5}.statusCell{display:flex;gap:6px;flex-wrap:wrap}.statusCell span{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.statusCell .blue{background:#dbeafe;color:#2563eb}.statusCell .orange{background:#ffedd5;color:#ea580c}.statusCell .purple{background:#ede9fe;color:#7c3aed}.topAction,.primary{background:#2563eb!important;color:#fff!important;border-color:#2563eb!important}.primary:disabled{opacity:.45;cursor:not-allowed}.topActions{display:flex;gap:10px}.topActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.projectPageHeader{align-items:flex-end}.projectHeaderActions{display:flex;align-items:center;gap:10px}.projectHeaderActions input{width:250px;border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.projectHeaderActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.projectSummary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.projectSummary article{background:#fff;border-radius:18px;padding:18px}.projectSummary span{display:block;color:#6b7a90}.projectSummary b{display:block;font-size:24px;margin-top:8px}.projectSummary.refined small{display:block;color:#90a0b8;margin-top:6px}.projectBoard{background:#fff;border-radius:24px;padding:18px}.monthHeader{display:flex;justify-content:space-between;align-items:center;padding:4px 4px 16px;border-bottom:1px solid #edf1f6}.monthHeader h2{font-size:20px}.monthHeader span{display:block;color:#6b7a90;margin-top:5px}.monthHeader button{border:1px solid #d7dfeb;background:#fff;padding:9px 13px;border-radius:14px}.projectRows{display:grid}.projectRow{display:grid;grid-template-columns:minmax(260px,1.5fr) minmax(180px,.75fr) minmax(210px,.78fr) minmax(220px,.9fr) auto;gap:18px;align-items:center;padding:20px 4px;border-bottom:1px solid #edf1f6}.projectRow:last-child{border-bottom:0}.projectIdentity{display:grid;gap:10px}.projectTitleLine{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.projectTitleLine h3{font-size:18px}.projectTitleLine span{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.projectTitleLine .running{background:#dcfce7;color:#15803d}.projectTitleLine .planning{background:#fef3c7;color:#b45309}.projectIdentity p{color:#6b7a90;line-height:1.7}.projectProgressBlock{display:grid;gap:10px}.progressHead{display:flex;justify-content:space-between;align-items:center}.progressHead span,.projectProgressBlock small,.projectRuleSummary span,.projectRuleSummary small{color:#6b7a90}.projectProgressBlock em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.projectProgressBlock i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.projectMiniStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.projectMiniStats div{background:#f6f8fc;border-radius:16px;padding:12px}.projectMiniStats span{display:block;color:#6b7a90;font-size:12px}.projectMiniStats b{display:block;font-size:20px;margin-top:5px}.projectRuleSummary{display:grid;gap:6px}.projectRuleSummary b{font-size:16px}.projectRuleSummary small{line-height:1.6}.projectActions{display:flex;gap:8px}.refinedActions{justify-content:flex-end;align-items:center}.projectAction{height:34px;min-width:54px;border:1px solid transparent;border-radius:12px;padding:0 13px;font-size:14px;font-weight:700;transition:all .18s ease}.projectAction.primaryAction{background:#2563eb;color:#fff;border-color:#2563eb;box-shadow:0 8px 16px rgba(37,99,235,.18)}.projectAction.secondaryAction{background:#fff;color:#334155;border-color:#d7dfeb}.projectAction.tertiaryAction{background:#f1f5f9;color:#475569;border-color:#f1f5f9}.projectAction.primaryAction:hover{background:#1d4ed8;border-color:#1d4ed8}.projectAction.secondaryAction:hover{background:#f8fafc;border-color:#b8c5d9}.projectAction.tertiaryAction:hover{background:#e2e8f0;border-color:#e2e8f0}.projectTags{margin-top:-2px}.workerPageHeader{align-items:flex-end}.workerHeaderActions{display:flex;gap:10px}.workerHeaderActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.workerSummary{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px}.workerSummary article{background:#fff;border-radius:18px;padding:18px}.workerSummary span{display:block;color:#6b7a90}.workerSummary b{display:block;font-size:24px;margin-top:8px}.workerSummary small{display:block;color:#90a0b8;margin-top:6px}.workerToolbar{display:flex;gap:10px;background:#fff;border-radius:18px;padding:14px;margin-bottom:16px}.workerToolbar input{flex:1;border:1px solid #d7dfeb;border-radius:14px;padding:0 14px}.workerToolbar select{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:0 14px}.workerBoard{background:#fff;border-radius:24px;padding:18px}.workerBoardHead{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}.workerBoardHead h2{font-size:20px}.workerBoardHead span{color:#6b7a90}.workerCards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.workerCard{display:grid;gap:14px;background:#fbfdff;border:1px solid #e3e9f2;border-radius:22px;padding:18px}.workerCardTop{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.workerCardTop h3{font-size:19px}.workerCardTop span{display:block;color:#6b7a90;margin-top:5px}.workerCardTop em{font-style:normal;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.workerCardTop .online{background:#dcfce7;color:#15803d}.workerCardTop .offline{background:#f1f5f9;color:#64748b}.workerMeta{display:flex;gap:10px;flex-wrap:wrap;color:#6b7a90}.workerMeta span{background:#fff;border-radius:999px;padding:6px 10px}.workerMetrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.workerMetrics div{background:#fff;border-radius:16px;padding:12px}.workerMetrics span{display:block;color:#6b7a90;font-size:12px}.workerMetrics b{display:block;font-size:20px;margin-top:5px}.workerCapacity{display:flex;justify-content:space-between;gap:10px;align-items:center}.workerCapacity span{font-weight:700;color:#315fd8}.workerCapacity small{color:#6b7a90}.mapPageHeader{align-items:center;min-height:46px}.mapPageHeader h1{font-size:22px}.mapPageHeader small{margin-bottom:2px}.mapMain .mapHeaderActions{flex-wrap:wrap;justify-content:flex-end}.mapMain .mapHeaderActions button{padding:8px 11px;border-radius:12px;font-size:13px}.mapHeaderActions{display:flex;gap:10px}.mapHeaderActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.mapHeaderActions .activeSoft{background:#eef4ff;color:#315fd8;border-color:#bfdbfe;font-weight:700}.mapKpiStrip{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-bottom:14px}.mapMain .mapKpiStrip{gap:8px}.mapKpiStrip button{border:1px solid transparent;background:#fff;border-radius:18px;padding:14px 16px;text-align:left;display:grid;gap:5px;box-shadow:0 1px 4px rgba(15,23,42,.05)}.mapMain .mapKpiStrip button{padding:9px 12px;border-radius:14px;grid-template-columns:1fr auto;align-items:center;gap:2px}.mapMain .mapKpiStrip button small{grid-column:1/-1}.mapKpiStrip span{color:#6b7a90;font-size:12px}.mapKpiStrip b{font-size:22px}.mapMain .mapKpiStrip b{font-size:18px}.mapKpiStrip small{color:#90a0b8}.mapKpiStrip button.active{border-color:#93c5fd;background:#eff6ff;box-shadow:0 0 0 3px rgba(37,99,235,.1)}.mapToolbar{display:flex;gap:10px;background:#fff;border-radius:18px;padding:14px;margin-bottom:16px}.mapMain .mapToolbar{padding:10px;border-radius:16px;gap:8px}.practicalToolbar{align-items:center;flex-wrap:wrap}.practicalToolbar input{flex:1;min-width:260px;border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:10px 14px}.mapMain .practicalToolbar input{padding:8px 12px;min-width:220px}.mapToolbar select,.mapToolbar button{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:10px 14px}.mapMain .mapToolbar select,.mapMain .mapToolbar button{padding:8px 10px;border-radius:12px}.mapSelectionBasket{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#0f172a;color:#fff;border-radius:18px;padding:14px 16px;margin-bottom:16px}.mapMain .mapSelectionBasket{padding:10px 12px;border-radius:16px;min-height:54px}.mapSelectionBasket b,.mapSelectionBasket span{display:block}.mapSelectionBasket span{color:#cbd5e1;margin-top:5px}.mapSelectionBasket>div:last-child{display:flex;gap:8px;flex-wrap:wrap}.mapSelectionBasket button{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.08);color:#fff;padding:9px 12px;border-radius:12px}.mapSelectionBasket button:first-child{background:#2563eb;border-color:#2563eb}.richerBasket{display:grid;grid-template-columns:auto 1fr auto}.richerBasket article{background:rgba(255,255,255,.08);border-radius:14px;padding:11px 13px}.mapMain .richerBasket article{padding:8px 10px}.richerBasket article small{display:block;color:#93c5fd;margin-bottom:4px}.richerBasket article strong{display:block}.richerBasket article em{display:block;color:#cbd5e1;font-style:normal;font-size:13px;line-height:1.5;margin-top:4px}.mapDispatchLayout{display:grid;grid-template-columns:minmax(640px,1.45fr) minmax(340px,.65fr);gap:16px;align-items:stretch;min-height:calc(100vh - 178px)}.mapMain .mapDispatchLayout{min-height:0;height:100%;overflow:hidden}.practicalMapLayout{grid-template-columns:300px minmax(560px,1fr) 360px;min-height:calc(100vh - 174px)}.mapMain .practicalMapLayout{grid-template-columns:280px minmax(520px,1fr) 340px;min-height:0}.mapCanvasPanel,.mapSummaryPanel,.mapPointCard,.mapWorkerPanel{background:#fff;border-radius:24px}.mapCanvasPanel{padding:18px;display:grid;grid-template-rows:auto auto minmax(0,1fr);min-height:0}.mapMain .mapCanvasPanel{padding:12px;border-radius:18px;overflow:hidden}.mapQueuePanel{background:#fff;border-radius:24px;padding:16px;display:grid;grid-template-rows:auto auto minmax(0,1fr);gap:12px;min-height:0}.mapMain .mapQueuePanel{height:100%;padding:12px;border-radius:18px;overflow:hidden;gap:10px}.mapQueueHeader{display:flex;justify-content:space-between;align-items:flex-start}.mapMain .mapQueueHeader h2{font-size:18px}.mapMain .mapQueueHeader span{font-size:12px}.mapQueueHeader span{display:block;color:#6b7a90;margin-top:5px}.mapQueueHeader b{display:grid;place-items:center;min-width:34px;height:34px;border-radius:999px;background:#eef4ff;color:#315fd8}.mapQueueTabs{display:flex;gap:6px;flex-wrap:wrap}.mapQueueTabs button{border:0;background:#f1f5f9;color:#64748b;padding:8px 10px;border-radius:999px;font-weight:700}.mapQueueTabs button.active{background:#dbeafe;color:#2563eb}.mapQueueList{display:grid;gap:8px;align-content:start;overflow:auto;padding-right:2px}.mapQueueList button{border:1px solid #e3e9f2;background:#fbfdff;border-radius:16px;padding:11px;text-align:left;display:grid;gap:6px}.mapMain .mapQueueList button{padding:9px;border-radius:14px;gap:5px}.mapQueueList button.active{border-color:#93c5fd;background:#eff6ff}.mapQueueList div{display:flex;justify-content:space-between;align-items:center}.mapQueueList em{font-style:normal;padding:4px 7px;border-radius:999px;font-size:12px;font-weight:700}.mapQueueList em.slate{background:#e2e8f0;color:#475569}.mapQueueList em.blue{background:#dbeafe;color:#2563eb}.mapQueueList em.orange{background:#ffedd5;color:#ea580c}.mapQueueList em.danger{background:#fee2e2;color:#dc2626}.mapQueueList em.green{background:#dcfce7;color:#15803d}.mapQueueList strong{font-size:12px;color:#315fd8}.mapQueueList p{font-size:13px;color:#475569;line-height:1.5}.mapQueueList small{color:#b45309}.mapQueueList i{font-style:normal;color:#6b7a90;font-size:12px}.mapCanvasHeader{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px}.mapMain .mapCanvasHeader{margin-bottom:10px}.mapMain .mapCanvasHeader h2{font-size:18px}.mapMain .mapCanvasHeader span{font-size:12px}.mapCanvasHeader h2{font-size:20px}.mapCanvasHeader span{display:block;color:#6b7a90;margin-top:5px}.mapWorkflowTabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;align-items:center}.mapMain .mapWorkflowTabs{margin-bottom:10px;gap:6px}.mapWorkflowTabs button{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:9px 11px;display:flex;align-items:center;gap:8px;height:max-content}.mapMain .mapWorkflowTabs button{padding:7px 9px;border-radius:12px;font-size:13px}.mapWorkflowTabs button.active{background:#0f172a;color:#fff;border-color:#0f172a}.mapWorkflowTabs b{display:grid;place-items:center;min-width:22px;height:22px;border-radius:999px;background:#eef4ff;color:#315fd8;font-size:12px}.mapWorkflowTabs button.active b{background:rgba(255,255,255,.16);color:#fff}.mapLegend{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.mapLegend span,.mapPointHead span{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.mapLegend .unassigned,.mapPointHead .unassigned{background:#e2e8f0;color:#475569}.mapLegend .assigned,.mapPointHead .assigned{background:#dbeafe;color:#2563eb}.mapLegend .working,.mapPointHead .working{background:#fef3c7;color:#b45309}.mapLegend .done,.mapPointHead .done{background:#dcfce7;color:#15803d}.mapLegend .abnormal,.mapPointHead .abnormal{background:#fee2e2;color:#dc2626}.mapCanvas{position:relative;min-height:0;height:100%;border-radius:22px;overflow:hidden;background:linear-gradient(135deg,#eef7ee,#dfeaf8)}.mapMain .mapCanvas{border-radius:18px}.mapCanvas:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(255,255,255,.95),transparent 30%),radial-gradient(circle at 75% 30%,rgba(255,255,255,.7),transparent 24%),linear-gradient(90deg,rgba(255,255,255,.22) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.22) 1px,transparent 1px);background-size:auto,auto,60px 60px,60px 60px}.mapNowPanel{position:absolute;left:18px;top:18px;z-index:4;background:rgba(255,255,255,.88);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.75);border-radius:18px;padding:14px 16px;box-shadow:0 10px 24px rgba(15,23,42,.1)}.mapNowPanel small{display:block;color:#6b7a90;margin-bottom:4px}.mapNowPanel h3{font-size:18px;margin-bottom:10px}.mapNowPanel div{display:flex;gap:8px;flex-wrap:wrap}.mapNowPanel span{background:#f1f5f9;color:#475569;padding:6px 9px;border-radius:999px;font-size:12px;font-weight:700}.mapTaskListPanel{position:absolute;left:18px;bottom:18px;z-index:4;width:min(420px,calc(100% - 36px));background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.78);border-radius:20px;padding:14px;box-shadow:0 16px 30px rgba(15,23,42,.12);display:grid;gap:8px}.mapTaskListPanel>div{display:flex;justify-content:space-between;align-items:center}.mapTaskListPanel>div span{color:#6b7a90;font-size:12px}.mapTaskListPanel button{display:grid;grid-template-columns:auto auto 1fr auto;gap:8px;align-items:center;border:0;background:#f8fafc;border-radius:14px;padding:10px;text-align:left}.mapTaskListPanel button.active{background:#dbeafe}.mapTaskListPanel strong{font-size:14px}.mapTaskListPanel em{font-style:normal;background:#eef4ff;color:#315fd8;padding:4px 7px;border-radius:999px;font-size:12px;font-weight:700}.mapTaskListPanel span{color:#475569}.mapTaskListPanel small{color:#6b7a90}.mapRoad{position:absolute;background:rgba(255,255,255,.9);border-radius:999px;box-shadow:0 0 0 2px rgba(148,163,184,.15)}.roadA{width:78%;height:16px;left:8%;top:38%;transform:rotate(-12deg)}.roadB{width:16px;height:76%;left:48%;top:10%;transform:rotate(8deg)}.roadC{width:58%;height:14px;left:24%;top:68%;transform:rotate(10deg)}.mapBlock{position:absolute;background:rgba(255,255,255,.42);border:1px solid rgba(148,163,184,.18);border-radius:20px}.blockA{width:160px;height:110px;left:12%;top:12%}.blockB{width:190px;height:130px;right:12%;top:18%}.blockC{width:220px;height:150px;left:18%;bottom:10%}.mapPin{position:absolute;transform:translate(-50%,-50%);width:48px;height:48px;border:0;border-radius:18px;color:#fff;font-weight:700;box-shadow:0 12px 24px rgba(15,23,42,.18);z-index:2}.mapPin i{position:absolute;right:-5px;top:-5px;display:grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#0f172a;color:#fff;font-style:normal;font-size:12px;border:2px solid #fff}.mapPin em{position:absolute;left:50%;top:-18px;transform:translateX(-50%);font-style:normal;background:#0f172a;color:#fff;padding:4px 7px;border-radius:999px;font-size:11px;white-space:nowrap}.mapPin small{position:absolute;left:50%;bottom:-20px;transform:translateX(-50%);background:rgba(255,255,255,.92);color:#475569;padding:4px 7px;border-radius:999px;font-size:11px;white-space:nowrap;box-shadow:0 5px 12px rgba(15,23,42,.12)}.mapPin.checked{outline:4px solid rgba(15,23,42,.14)}.mapPin.unassigned{background:#64748b}.mapPin.assigned{background:#2563eb}.mapPin.working{background:#f59e0b}.mapPin.done{background:#16a34a}.mapPin.abnormal{background:#dc2626}.mapPin.active{outline:4px solid rgba(37,99,235,.18);transform:translate(-50%,-50%) scale(1.08)}.workerMarker{position:absolute;z-index:3;transform:translate(-50%,-50%);width:28px;height:28px;border:0;background:transparent}.workerMarker span{display:block;width:18px;height:18px;border-radius:50%;margin:auto;background:#2563eb;border:3px solid #fff;box-shadow:0 10px 18px rgba(15,23,42,.24)}.workerMarker.online:before{content:"";position:absolute;inset:0;border-radius:50%;background:rgba(37,99,235,.18);animation:pulse 1.8s infinite}.workerMarker.offline span{background:#94a3b8}.workerMarker.moving span{background:#2563eb}.workerMarker.staying span{background:#16a34a}.workerMarker.moving:after{content:"";position:absolute;width:18px;height:3px;background:rgba(37,99,235,.38);left:18px;top:13px;border-radius:999px}.workerMarker.staying:after{content:"";position:absolute;inset:4px;border-radius:50%;border:1px solid rgba(22,163,74,.34)}.mapTrailSegment{position:absolute;z-index:1;height:4px;background:linear-gradient(90deg,rgba(37,99,235,.18),rgba(37,99,235,.68));transform-origin:left center;border-radius:999px}.mapTrailDot{position:absolute;z-index:2;transform:translate(-50%,-50%);width:9px;height:9px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 4px 10px rgba(37,99,235,.25)}@keyframes pulse{0%{transform:scale(.85);opacity:.9}70%{transform:scale(1.45);opacity:0}100%{transform:scale(1.45);opacity:0}}.mapSidePanel{display:grid;gap:16px;align-content:start;color:#132033}.mapMain .mapSidePanel{height:100%;min-height:0;overflow:hidden;gap:10px}.compactMapSide{grid-template-rows:auto minmax(0,1fr) auto;height:100%;min-height:0}.mapMain .compactMapSide{grid-template-rows:auto minmax(0,1fr)}.compactPointCard{overflow:auto}.mapMain .compactPointCard{min-height:0;max-height:none;overscroll-behavior:contain}.compactSummary{padding:14px}.mapMain .compactSummary{padding:10px;border-radius:18px}.compactSummary>div{grid-template-columns:repeat(4,1fr)}.compactSummary article{padding:10px}.mapMain .compactSummary article{padding:8px}.compactPointCard{gap:11px;padding:16px;min-height:0}.mapMain .compactPointCard{gap:9px;padding:12px;border-radius:18px}.compactPointCard p{line-height:1.55;font-size:13px}.pointBusinessRow{display:flex;align-items:center;gap:8px}.pointBusinessRow span{background:#e0f2fe;color:#0369a1;padding:6px 9px;border-radius:999px;font-size:12px;font-weight:700}.pointBusinessRow b{font-size:13px;color:#475569}.compactMetrics{grid-template-columns:1fr;gap:6px}.compactMetrics div{padding:10px}.compactMetrics b{font-size:13px}.compactMetrics small{display:block;color:#b45309;font-size:12px;margin-top:4px}.compactArrival{gap:6px}.compactArrival div{padding:10px}.compactArrival b{font-size:13px}.compactProgress{gap:6px}.compactProgress div{display:flex;justify-content:space-between;align-items:center}.mapCheckPanel{display:grid;grid-template-columns:1fr 1fr;gap:6px}.mapMain .mapCheckPanel{grid-template-columns:1fr 1fr}.mapCheckPanel div{display:grid;grid-template-columns:auto 1fr;column-gap:8px;row-gap:3px;background:#f8fafc;border-radius:14px;padding:10px}.mapCheckPanel div span{grid-row:1/3;display:grid;place-items:center;width:22px;height:22px;border-radius:50%;font-weight:700}.mapCheckPanel .ok span{background:#dcfce7;color:#15803d}.mapCheckPanel .warn span{background:#fee2e2;color:#dc2626}.mapCheckPanel b{font-size:13px}.mapCheckPanel em{font-style:normal;color:#6b7a90;font-size:12px}.compactJudge{padding:10px;gap:6px}.compactJudge h3{display:none}.compactJudge span{padding:8px 10px;font-size:13px}.practicalJudge{background:#fff7ed;border:1px solid #fed7aa}.practicalJudge div{display:flex;justify-content:space-between;align-items:center}.practicalJudge div span{padding:0;background:transparent;color:#9a3412}.practicalJudge b{color:#c2410c}.practicalJudge p{color:#9a3412;font-size:13px;line-height:1.55}.practicalJudge small{color:#b45309;line-height:1.5}.mapRouteAdvice{display:grid;gap:5px;border-radius:16px;padding:11px}.mapRouteAdvice span{color:#6b7a90;font-size:12px}.mapRouteAdvice p{font-size:13px;line-height:1.55}.mapRouteAdvice.blue{background:#eff6ff;border:1px solid #bfdbfe}.mapRouteAdvice.blue b,.mapRouteAdvice.blue p{color:#1d4ed8}.mapRouteAdvice.green{background:#f0fdf4;border:1px solid #bbf7d0}.mapRouteAdvice.green b,.mapRouteAdvice.green p{color:#15803d}.mapRouteAdvice.danger{background:#fef2f2;border:1px solid #fecaca}.mapRouteAdvice.danger b,.mapRouteAdvice.danger p{color:#dc2626}.panelMiniHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.panelMiniHead span{color:#6b7a90;font-size:12px}.panelMiniHead b{font-size:13px}.mapLifecyclePanel,.wallReusePanel,.acceptanceRulePanel{background:#fff;border:1px solid #e3e9f2;border-radius:18px;padding:12px;display:grid;gap:8px}.mapMain .mapLifecyclePanel,.mapMain .wallReusePanel,.mapMain .acceptanceRulePanel{padding:10px;border-radius:16px}.lifecycleSteps{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.lifecycleSteps article{border-radius:14px;padding:10px;display:grid;gap:4px;min-height:82px}.mapMain .lifecycleSteps article{padding:8px;min-height:auto}.lifecycleSteps article b{font-size:13px}.lifecycleSteps article span{font-size:12px;font-weight:700}.lifecycleSteps article small{color:#6b7a90;line-height:1.45}.lifecycleSteps .done{background:#f0fdf4}.lifecycleSteps .done span{color:#15803d}.lifecycleSteps .current{background:#eff6ff;border:1px solid #bfdbfe}.lifecycleSteps .current span{color:#2563eb}.lifecycleSteps .pending{background:#f8fafc}.lifecycleSteps .pending span{color:#64748b}.wallReusePanel article{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;background:#f8fafc;border-radius:14px;padding:10px}.mapMain .wallReusePanel article{padding:8px}.wallReusePanel article span{display:block;color:#6b7a90;font-size:12px;margin-top:4px;line-height:1.45}.wallReusePanel article em{font-style:normal;background:#eef4ff;color:#315fd8;border-radius:999px;padding:5px 8px;font-size:12px;font-weight:700;white-space:nowrap}.acceptanceRulePanel span{color:#6b7a90;font-size:12px;font-weight:700}.acceptanceRulePanel p{color:#475569;font-size:13px;line-height:1.65}.practicalActions{display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr}.mapMain .practicalActions{grid-template-columns:1.2fr 1fr 1fr 1fr}.practicalActions button{padding:9px 8px!important}.compactMapSide .mapPointActions button{padding:9px 11px}.mapSideDock{background:#fff;border-radius:24px;padding:14px;display:grid;gap:12px}.mapMain .mapSideDock{display:none}.mapSideTabs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mapSideTabs.fourTabs{grid-template-columns:repeat(4,1fr)}.mapSideTabs button{border:0;background:#f1f5f9;color:#64748b;border-radius:12px;padding:9px 10px;font-weight:700}.mapSideTabs button.active{background:#dbeafe;color:#2563eb}.mapPriorityPanel{display:grid;gap:8px}.mapPriorityPanel button{border:1px solid #e3e9f2;background:#fbfdff;border-radius:16px;padding:11px;text-align:left;display:grid;gap:5px}.mapPriorityPanel div{display:flex;justify-content:space-between;align-items:center}.mapPriorityPanel div span{background:#fee2e2;color:#dc2626;padding:5px 8px;border-radius:999px;font-size:12px;font-weight:700}.mapPriorityPanel p{font-size:13px;color:#475569;line-height:1.5}.mapPriorityPanel small{color:#6b7a90}.compactWorkerPanel{padding:0;background:transparent;border-radius:0;gap:8px}.compactWorkerPanel h2{display:none}.compactWorkerPanel button{padding:10px}.compactWorkerPanel div span{margin-top:4px;font-size:12px}.compactLiveCard,.compactSmartDispatch{padding:0;background:transparent;border-radius:0}.compactLiveCard>div:not(:first-child){padding:10px}.compactSmartDispatch div{padding:12px}.compactSmartDispatch p{font-size:13px}.richerSmartDispatch article{background:#f8fafc;border-radius:16px;padding:12px;display:grid;gap:5px}.richerSmartDispatch article span{color:#6b7a90;line-height:1.55}.emptyDock{min-height:110px;display:grid;place-items:center;color:#90a0b8;background:#f6f8fc!important;border-radius:16px}.mapSummaryPanel{padding:18px}.mapSummaryPanel h2,.mapWorkerPanel h2{font-size:20px;margin-bottom:14px}.mapSummaryPanel>div{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.mapSummaryPanel article{background:#f6f8fc;border-radius:16px;padding:12px}.mapSummaryPanel span{display:block;color:#6b7a90;font-size:12px}.mapSummaryPanel b{display:block;font-size:20px;margin-top:5px}.mapPointCard{padding:18px;display:grid;gap:14px}.mapPointHead{display:flex;justify-content:space-between;align-items:flex-start}.mapPointHead small{display:block;color:#6b7a90;margin-bottom:4px}.mapPointCard p{color:#475569;line-height:1.7}.mapPointMetrics{display:grid;gap:8px}.mapPointMetrics div{background:#f6f8fc;border-radius:16px;padding:12px}.mapPointMetrics span{display:block;color:#6b7a90;font-size:12px;margin-bottom:5px}.mapArrivalPanel{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mapArrivalPanel div{background:#f8fafc;border-radius:16px;padding:12px}.mapArrivalPanel span{display:block;color:#6b7a90;font-size:12px;margin-bottom:5px}.mapArrivalPanel b{font-size:14px}.mapProgress{display:grid;gap:8px}.mapProgress span{color:#6b7a90}.mapProgress em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.mapProgress i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.mapAutoJudgePanel{background:#f8fafc;border-radius:18px;padding:14px;display:grid;gap:8px}.mapAutoJudgePanel h3{font-size:15px}.mapAutoJudgePanel span{display:block;background:#fff;border-radius:14px;padding:10px 12px;color:#475569}.mapPointActions{display:flex;gap:8px;flex-wrap:wrap}.mapMain .mapPointActions{position:sticky;bottom:0;background:linear-gradient(180deg,rgba(255,255,255,.72),#fff 35%);padding-top:8px}.mapPointActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 12px;border-radius:14px}.emptyMapCard{min-height:180px;display:grid;place-items:center;color:#90a0b8}.mapWorkerPanel{padding:18px;display:grid;gap:10px}.mapWorkerPanel button{display:flex;justify-content:space-between;align-items:center;border:1px solid #e3e9f2;background:#fbfdff;border-radius:16px;padding:12px;text-align:left}.mapWorkerPanel div span{display:block;color:#6b7a90;margin-top:4px}.mapWorkerPanel div small{display:block;color:#90a0b8;margin-top:5px}.mapWorkerPanel em{font-style:normal;background:#eef4ff;color:#315fd8;padding:6px 10px;border-radius:999px;font-weight:700}.mapLiveWorkerCard,.mapSmartDispatch{background:#fff;border-radius:24px;padding:18px;display:grid;gap:10px}.mapLiveWorkerCard>div:first-child{margin-bottom:2px}.mapLiveWorkerCard small{display:block;color:#6b7a90;margin-bottom:4px}.mapLiveWorkerCard>div:not(:first-child){display:flex;justify-content:space-between;gap:10px;background:#f6f8fc;border-radius:16px;padding:12px}.mapLiveWorkerCard span{color:#6b7a90}.mapSmartDispatch h2{font-size:20px}.mapSmartDispatch div{background:#eef4ff;border-radius:16px;padding:14px}.mapSmartDispatch span{display:block;color:#6b7a90;margin-bottom:5px}.mapSmartDispatch p{color:#6b7a90;line-height:1.7}.mapSmartDispatch button{justify-self:start;border:1px solid #2563eb;padding:10px 12px;border-radius:14px}.dispatchPageHeader{align-items:flex-end}.dispatchHeaderActions{display:flex;gap:10px}.dispatchHeaderActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.dispatchSummary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.dispatchSummary article{background:#fff;border-radius:18px;padding:18px}.dispatchSummary span{display:block;color:#6b7a90}.dispatchSummary b{display:block;font-size:24px;margin-top:8px}.dispatchSummary small{display:block;color:#90a0b8;margin-top:6px}.dispatchLayout{display:grid;grid-template-columns:minmax(520px,1.35fr) minmax(320px,.72fr) minmax(290px,.62fr);gap:16px}.dispatchPool,.dispatchBasket,.workerChooser{background:#fff;border-radius:24px;padding:18px;min-height:610px}.dispatchSectionHead{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:16px}.dispatchSectionHead h2{font-size:20px}.dispatchSectionHead span{display:block;color:#6b7a90;margin-top:5px}.dispatchSectionHead button{border:1px solid #d7dfeb;background:#fff;padding:9px 13px;border-radius:14px}.dispatchSectionHead.compact{margin-bottom:14px}.dispatchFilters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}.dispatchFilters button{border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:14px}.dispatchFilters input{flex:1;min-width:180px;border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.dispatchPointList{display:grid;gap:10px}.dispatchPoint{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:start;border:1px solid #e3e9f2;background:#fbfdff;border-radius:18px;padding:14px;cursor:pointer;transition:all .18s ease}.dispatchPoint.selected{border-color:#2563eb;background:#f5f9ff;box-shadow:0 0 0 3px rgba(37,99,235,.1)}.dispatchPoint.locked{opacity:.58;cursor:not-allowed}.dispatchPoint label{padding-top:3px}.dispatchPointMain{display:grid;gap:7px}.dispatchPointTitle{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.dispatchPointTitle b{font-size:17px}.dispatchPointTitle span{color:#6b7a90}.dispatchPointMain p{color:#334155;line-height:1.5}.dispatchPointMeta{display:grid;justify-items:end;gap:7px;text-align:right}.dispatchPointMeta span,.dispatchPointMeta small{color:#6b7a90}.dispatchPointMeta b{padding:6px 10px;border-radius:999px;font-size:12px}.dispatchPointMeta .ready{background:#dcfce7;color:#15803d}.dispatchPointMeta .assigned{background:#e2e8f0;color:#475569}.basketList{display:grid;gap:10px;margin-bottom:16px}.basketList article{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;background:#f6f8fc;border-radius:16px;padding:12px}.basketList article span{color:#6b7a90;line-height:1.5}.basketList article button{border:1px solid #d7dfeb;background:#fff;padding:7px 10px;border-radius:12px}.emptyState{display:grid;place-items:center;height:110px;background:#f6f8fc;border-radius:16px;color:#90a0b8}.dispatchChecks{background:#f8fafc;border-radius:20px;padding:16px;display:grid;gap:10px}.dispatchChecks h3{margin-bottom:4px}.dispatchChecks div{display:flex;justify-content:space-between;background:#fff;border-radius:14px;padding:12px}.dispatchChecks span{color:#6b7a90}.workerList{display:grid;gap:10px}.workerList button{display:grid;grid-template-columns:1fr auto;border:1px solid #e3e9f2;background:#fbfdff;border-radius:18px;padding:14px;text-align:left;gap:6px}.workerList button.selected{border-color:#2563eb;background:#f5f9ff;box-shadow:0 0 0 3px rgba(37,99,235,.1)}.workerList div b,.workerList div span,.workerList small,.workerList strong,.workerList i{display:block}.workerList div span,.workerList small,.workerList i{color:#6b7a90}.workerList strong{grid-column:1/-1;margin-top:4px}.workerList i{grid-column:1/-1;font-style:normal}.workerList em{height:max-content;font-style:normal;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.workerList .online{background:#dcfce7;color:#15803d}.workerList .offline{background:#f1f5f9;color:#64748b}.selectedWorkerCard{margin-top:14px;background:#0f172a;color:#fff;border-radius:20px;padding:16px;display:grid;gap:6px}.selectedWorkerCard span,.selectedWorkerCard small{color:#cbd5e1}.dispatchSuccess{width:min(700px,92vw)}.dispatchResultPanel{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;text-align:left}.dispatchResultPanel article{background:#fff;border-radius:18px;padding:16px}.dispatchResultPanel span{display:block;color:#6b7a90}.dispatchResultPanel b{display:block;margin-top:7px}.overviewHeader,.systemHeader{align-items:flex-end}.overviewHeaderActions,.systemHeaderActions{display:flex;gap:10px}.overviewHeaderActions button,.systemHeaderActions button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.overviewHero{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:16px}.overviewHero article,.systemSummary article{background:#fff;border-radius:18px;padding:18px}.overviewHero span,.systemSummary span{display:block;color:#6b7a90}.overviewHero b,.systemSummary b{display:block;font-size:24px;margin-top:8px}.overviewHero small,.systemSummary small{display:block;color:#90a0b8;margin-top:6px}.overviewGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}.overviewBottomGrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.overviewPanel,.systemServicePanel,.systemTimelinePanel{background:#fff;border-radius:24px;padding:18px}.overviewPanelHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:16px}.overviewPanelHead h2{font-size:20px}.overviewPanelHead button{border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:14px}.projectOverviewPanel{display:grid;gap:14px}.projectOverviewPanel article{display:grid;gap:8px}.projectOverviewPanel article div{display:flex;justify-content:space-between;gap:10px}.projectOverviewPanel article span,.projectOverviewPanel article small{color:#6b7a90}.projectOverviewPanel em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.projectOverviewPanel i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.liveOverviewPanel{display:grid;gap:10px}.liveOverviewPanel article{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;background:#f6f8fc;border-radius:16px;padding:14px}.liveOverviewPanel span{display:block;color:#6b7a90;margin-top:4px}.liveOverviewPanel em{font-style:normal;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.liveOverviewPanel .online{background:#dcfce7;color:#15803d}.liveOverviewPanel .offline{background:#f1f5f9;color:#64748b}.liveOverviewPanel small{color:#90a0b8}.materialBars{display:grid;gap:12px}.materialBars article{display:grid;grid-template-columns:88px 1fr auto;gap:10px;align-items:center}.materialBars span{color:#6b7a90}.materialBars em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.materialBars i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.alertOverviewPanel{display:grid;gap:10px}.alertOverviewPanel article{display:flex;justify-content:space-between;gap:12px;align-items:center;border-radius:16px;padding:14px}.alertOverviewPanel article.high{background:#fef2f2}.alertOverviewPanel article.medium{background:#fff7ed}.alertOverviewPanel span{display:block;color:#6b7a90;line-height:1.6;margin-top:4px}.alertOverviewPanel button{border:1px solid #d7dfeb;background:#fff;padding:8px 11px;border-radius:12px;white-space:nowrap}.compactMapPanel{display:grid;align-content:start}.miniMap{position:relative;min-height:220px;border-radius:20px;background:linear-gradient(135deg,#eef7ee,#dfeaf8);overflow:hidden}.miniMap:before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(255,255,255,.28) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.28) 1px,transparent 1px);background-size:44px 44px}.miniMap i{position:absolute;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;border:3px solid #fff;box-shadow:0 6px 12px rgba(15,23,42,.18)}.miniMap .unassigned{background:#64748b}.miniMap .assigned{background:#2563eb}.miniMap .working{background:#f59e0b}.miniMap .done{background:#16a34a}.miniMap .abnormal{background:#dc2626}.recentOverviewPanel{display:grid;align-content:start}.recentOverviewPanel article,.systemTimelinePanel article{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:14px 0;border-top:1px solid #edf1f6}.recentOverviewPanel article:first-of-type,.systemTimelinePanel article:first-of-type{border-top:0;padding-top:0}.recentOverviewPanel time,.systemTimelinePanel time{color:#6b7a90}.recentOverviewPanel span,.systemTimelinePanel span{display:block;color:#6b7a90;margin-top:5px}.systemSummary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:16px}.systemLayout{display:grid;grid-template-columns:minmax(620px,1.4fr) minmax(320px,.6fr);gap:16px;margin-bottom:16px}.systemServiceGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.systemServiceGrid article{display:flex;justify-content:space-between;gap:12px;align-items:center;border-radius:18px;padding:14px}.systemServiceGrid article.ok{background:#f0fdf4}.systemServiceGrid article.warn{background:#fff7ed}.systemServiceGrid span{display:block;color:#6b7a90;line-height:1.6;margin-top:5px}.systemServiceGrid em{font-style:normal;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.systemServiceGrid .ok em{background:#dcfce7;color:#15803d}.systemServiceGrid .warn em{background:#ffedd5;color:#ea580c}.systemSidePanel{display:grid;gap:16px}.systemSidePanel article{background:#fff;border-radius:24px;padding:18px;display:grid;gap:12px}.systemSidePanel span{display:block;color:#6b7a90;line-height:1.7;margin-top:6px}.systemSidePanel button{justify-self:start;border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:12px}.placeholderPage{background:#fff;border-radius:24px;padding:28px}.placeholderPage p{margin-top:10px;color:#6b7a90;line-height:1.8}.summary article{background:#fff;border-radius:18px;padding:18px;box-shadow:0 1px 4px rgba(15,23,42,.06)}.summary span,.meta span,.meta small{display:block;color:#6b7a90}.summary b{display:block;font-size:24px;margin-top:8px}.toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;padding:14px;border-radius:18px;margin-bottom:16px;flex-wrap:wrap}.hint{width:100%;color:#6b7a90;font-size:13px;margin-bottom:2px}.toolbar .left,.toolbar .right{display:flex;align-items:center;gap:10px}.toolbar select{padding:10px 12px;border:1px solid #d7dfeb;border-radius:12px}.toolbar .primary{background:#2563eb;color:#fff;border-color:#2563eb}.grid{position:relative;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;align-content:start;min-height:420px;padding-bottom:120px;user-select:none}.selectionBox{position:absolute;z-index:5;border:1px solid #2563eb;background:rgba(37,99,235,.14);pointer-events:none;border-radius:6px}.card{position:relative;background:#fff;border:2px solid transparent;border-radius:20px;overflow:hidden;box-shadow:0 1px 4px rgba(15,23,42,.08);cursor:default}.card.checked{border-color:#2563eb;background:#f7fbff;box-shadow:0 0 0 3px rgba(37,99,235,.12),0 1px 4px rgba(15,23,42,.08)}.check{position:absolute;z-index:2;left:12px;top:12px}.check input{display:none}.check span{display:grid;place-items:center;width:24px;height:24px;border-radius:8px;background:#fff;border:1px solid #cbd5e1;font-weight:700}.checked .check span{background:#2563eb;color:#fff;border-color:#2563eb}.preview{position:relative;display:block;width:100%;padding:0;border:0;background:#e8eef7;height:170px;cursor:default}.preview img,.preview video{width:100%;height:100%;object-fit:cover}.preview em{position:absolute;left:12px;bottom:12px;background:rgba(15,23,42,.8);color:#fff;border-radius:999px;padding:5px 9px;font-style:normal;font-size:12px}.playBadge{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:52px;height:52px;border-radius:50%;background:rgba(15,23,42,.72);color:#fff;font-style:normal;font-size:22px;padding-left:3px}.fileBadge{position:absolute;right:12px;top:12px;background:rgba(37,99,235,.92);color:#fff;padding:5px 9px;border-radius:999px;font-size:12px}.durationBadge{position:absolute;right:12px;bottom:12px;background:rgba(15,23,42,.82);color:#fff;padding:5px 9px;border-radius:999px;font-size:12px}.meta{padding:14px}.meta b{display:block;font-size:16px;margin-bottom:4px}.modal{position:fixed;inset:0;background:rgba(15,23,42,.62);display:grid;place-items:center;padding:24px;z-index:30}.previewModal{width:min(1000px,96vw);background:#fff;border-radius:24px;overflow:hidden}.premiumPreview{width:min(1280px,96vw);max-height:calc(100vh - 48px);background:rgba(248,250,252,.98);border:1px solid rgba(255,255,255,.7);box-shadow:0 28px 90px rgba(15,23,42,.28);display:grid;grid-template-rows:auto minmax(0,1fr)}.previewModal header{padding:18px 20px;margin:0;border-bottom:1px solid #e5eaf1}.previewModal header small{margin-bottom:4px}.previewModal header span{display:block;color:#6b7a90;font-size:13px;margin-top:4px}.previewActions{display:flex;gap:10px;align-items:center}.previewActions button:first-child{width:auto;height:auto;padding:10px 14px;border:1px solid #d7dfeb;background:#fff;border-radius:14px;font-size:14px}.previewModal header button:not(:first-child),.detailModal header button,.editModal header button,.projectModal header button,.mobilePreviewModal header button{border:0;background:#eef3fa;width:38px;height:38px;border-radius:50%;font-size:22px}.headerActions{display:flex;align-items:center;gap:10px}.textButton{width:auto!important;height:auto!important;padding:10px 14px!important;border-radius:14px!important;font-size:14px!important;background:#fff!important;border:1px solid #d7dfeb!important}.premiumPreviewBody{display:grid;grid-template-columns:minmax(0,1fr) 280px;min-height:0;height:min(72vh,680px)}.stage{position:relative;background:radial-gradient(circle at center,#1e293b 0%,#0f172a 70%);display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;padding:22px;overflow:hidden}.stage img,.stage video{display:block;width:100%;height:100%;object-fit:contain;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.22)}.nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border:0;border-radius:50%;background:rgba(255,255,255,.86);font-size:32px;line-height:1;color:#132033}.nav.prev{left:18px}.nav.next{right:18px}.nav:disabled{opacity:.32;cursor:not-allowed}.previewInfo{background:#fff;padding:22px;display:grid;align-content:start;gap:12px;overflow:auto}.previewInfo h3{margin-bottom:6px}.previewInfo div{background:#f6f8fc;border-radius:16px;padding:14px}.previewInfo span{display:block;color:#6b7a90;font-size:13px;margin-bottom:5px}.detailOverlay{position:fixed;inset:0;z-index:20;display:grid;place-items:center;padding:28px;background:rgba(15,23,42,.34);backdrop-filter:blur(8px);animation:overlayFade .18s ease-out}.editModal,.projectModal,.importModal,.successModal,.tagManagerModal,.batchPointTagModal,.workerModal{width:min(980px,92vw);max-height:min(860px,90vh);overflow:auto;background:rgba(248,250,252,.98);border:1px solid rgba(255,255,255,.65);border-radius:28px;padding:22px;box-shadow:0 28px 90px rgba(15,23,42,.28);animation:modalRise .22s ease-out}.editModal header,.projectModal header,.importModal header,.tagManagerModal header,.batchPointTagModal header,.workerModal header{background:#fff;border-radius:22px;padding:18px 20px}.editModal header p,.projectModal header p,.importModal header p,.tagManagerModal header p,.batchPointTagModal header p,.workerModal header p{color:#6b7a90;margin-top:6px}.editGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:18px}.editGrid label{display:grid;gap:7px}.editGrid span{color:#6b7a90;font-size:13px}.editGrid input,.editGrid select,.editGrid textarea{width:100%;border:1px solid #d7dfeb;border-radius:14px;background:#fff;padding:12px 14px;font:inherit}.tagSelector{display:flex;gap:8px;flex-wrap:wrap;background:#fff;border:1px solid #d7dfeb;border-radius:16px;padding:12px}.tagSelector button{border:1px solid #d7dfeb;background:#fff;border-radius:999px;padding:8px 12px;color:#475569;font-weight:700}.tagSelector button.selected{background:#dbeafe;color:#2563eb;border-color:#93c5fd}.batchPointTagModal{width:min(760px,92vw)}.batchTagBody{display:grid;gap:16px;margin-top:18px}.batchSelector{min-height:72px}.batchTagSummary{background:#fff;border-radius:18px;padding:16px;display:grid;gap:6px}.batchTagSummary span{color:#6b7a90}.batchPointTagModal footer{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.batchPointTagModal footer button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.inlineAdd{display:flex;gap:8px}.inlineAdd input{flex:1}.inlineAdd button{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:0 14px;font-weight:700}.editGrid textarea{min-height:100px;resize:vertical}.editGrid .wide{grid-column:1/-1}.editModal footer,.projectModal footer{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.editModal footer button,.projectModal footer button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.successModal,.confirmModal{width:min(620px,92vw);display:grid;justify-items:center;text-align:center;padding:34px}.confirmLayer{z-index:35}.confirmModal{background:rgba(248,250,252,.98);border:1px solid rgba(255,255,255,.65);border-radius:28px;box-shadow:0 28px 90px rgba(15,23,42,.28);animation:modalRise .22s ease-out}.mobilePreviewLayer{z-index:34}.mobilePreviewModal{width:min(1060px,94vw);max-height:min(900px,92vh);overflow:auto;background:rgba(248,250,252,.98);border:1px solid rgba(255,255,255,.65);border-radius:28px;padding:22px;box-shadow:0 28px 90px rgba(15,23,42,.28);animation:modalRise .22s ease-out}.mobilePreviewModal header{background:#fff;border-radius:22px;padding:18px 20px}.mobilePreviewModal header p{color:#6b7a90;margin-top:6px}.mobilePreviewLayout{display:grid;grid-template-columns:280px 1fr;gap:22px;align-items:start;margin-top:18px}.mobileFlowNotes{background:#fff;border-radius:22px;padding:20px}.mobileFlowNotes h3{margin-bottom:14px}.mobileFlowNotes ol{margin:0;padding-left:20px;color:#475569;line-height:2}.mobileStateSwitch{display:grid;gap:8px;margin-top:18px}.mobileStateSwitch span{color:#6b7a90}.mobileStateSwitch button{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:10px 12px;text-align:left}.mobileStateSwitch button.active{background:#dbeafe;color:#2563eb;border-color:#93c5fd;font-weight:700}.phoneFrame{justify-self:center;width:390px;background:#0f172a;border-radius:38px;padding:12px;box-shadow:0 25px 60px rgba(15,23,42,.28)}.phoneTop{width:120px;height:26px;background:#0b1220;border-radius:0 0 18px 18px;margin:0 auto 10px}.phoneScreen{background:#f4f7fb;border-radius:28px;min-height:700px;padding:16px;display:grid;align-content:start;gap:14px}.workerMobileHeader{display:flex;justify-content:space-between;align-items:center}.workerMobileHeader small{display:block;color:#6b7a90;margin-bottom:4px}.workerMobileHeader span{background:#e0f2fe;color:#0369a1;padding:7px 10px;border-radius:999px;font-weight:700}.mobileHeaderMeta{display:flex;align-items:center;gap:8px}.mobileHeaderMeta i{font-style:normal;background:#dcfce7;color:#15803d;padding:6px 9px;border-radius:999px;font-size:12px;font-weight:700}.bindHeader span{background:#eef4ff;color:#315fd8}.bindingCard{background:#fff;border-radius:22px;padding:18px;display:grid;gap:14px}.bindingCard label{display:grid;gap:7px}.bindingCard label span{color:#6b7a90;font-size:13px}.bindingCard input,.bindingCard select{width:100%;border:1px solid #d7dfeb;border-radius:14px;background:#fff;padding:12px 14px;font:inherit}.bindingCard p{color:#6b7a90;line-height:1.7;font-size:13px}.compactSwitch{margin-top:14px}.locationCard{border-radius:20px;padding:16px;display:grid;gap:7px}.locationCard b,.locationCard span,.locationCard em{display:block}.locationCard em{font-style:normal;font-size:13px}.locationCard.locating{background:#eff6ff;color:#1d4ed8}.locationCard.active{background:#dcfce7;color:#15803d}.locationCard.denied{background:#fef2f2;color:#dc2626}.locationCard.denied div{display:flex;gap:8px;margin-top:6px}.locationCard.denied button{border:1px solid #fecaca;background:#fff;padding:8px 10px;border-radius:12px;color:#b91c1c}.mobileTaskCard{background:#fff;border-radius:22px;padding:18px;display:grid;gap:14px}.mobileTaskCard.locked{opacity:.56}.mobileTaskTop{display:flex;justify-content:space-between;align-items:center;gap:8px}.mobileTaskTop small{background:#f1f5f9;color:#475569;padding:6px 9px;border-radius:999px}.mobileTaskTop em{font-style:normal;background:#eff6ff;color:#2563eb;padding:6px 9px;border-radius:999px;font-size:12px;font-weight:700}.mobileTaskTop em.done{background:#dcfce7;color:#15803d}.mobileTaskSummary{background:#fff;border-radius:20px;padding:14px 16px;display:grid;gap:10px}.mobileTaskSummary div{display:flex;justify-content:space-between;align-items:center}.mobileTaskSummary span{color:#6b7a90}.mobileTaskSummary b{font-size:15px}.mobileTaskSummary em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.mobileTaskSummary i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.mobileTaskRail{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.mobileTaskRail button{border:1px solid #d7dfeb;background:#fff;border-radius:16px;padding:10px 8px;display:grid;gap:5px}.mobileTaskRail button b{font-size:14px}.mobileTaskRail button span{font-size:12px;color:#6b7a90}.mobileTaskRail button.active{border-color:#93c5fd;background:#eff6ff}.mobileTaskRail button.done{border-color:#bbf7d0;background:#f0fdf4}.mobileTaskRail button.done span{color:#15803d}.mobileAutoDone{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:14px;display:grid;gap:5px}.mobileAutoDone b{color:#15803d}.mobileAutoDone span{color:#166534;font-size:13px}.mobileTaskCard p{line-height:1.7;color:#475569}.mobileTagRow{display:flex;gap:8px;flex-wrap:wrap}.mobileTagRow span{background:#eef4ff;color:#315fd8;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.mobileTaskCard article{background:#f6f8fc;border-radius:16px;padding:14px;display:grid;gap:5px}.mobileTaskCard article span{color:#6b7a90;font-size:13px}.mobilePrimary{border:0;background:#2563eb;color:#fff;border-radius:16px;padding:14px;font-weight:700}.mobilePrimary:disabled{background:#cbd5e1;color:#64748b}.mobileUploadedPanel{background:#fff;border-radius:22px;padding:18px;display:grid;gap:12px}.mobileUploadedPanel.locked{opacity:.56}.mobileUploadedHead{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.mobileUploadedHead span{display:block;color:#6b7a90;margin-top:4px}.mobileUploadedHead small{background:#eff6ff;color:#2563eb;padding:6px 9px;border-radius:999px;font-weight:700}.mobileUploadItem{display:grid;grid-template-columns:54px 1fr;gap:10px;align-items:center;background:#f6f8fc;border-radius:16px;padding:10px}.mobileThumb{width:54px;height:54px;border-radius:14px;background-size:cover;background-position:center}.mobileThumb.photo{background-image:url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=180&q=80')}.mobileThumb.watermark{background-image:url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=180&q=80')}.mobileUploadItem b,.mobileUploadItem span{display:block}.mobileUploadItem span{color:#6b7a90;font-size:12px;margin-top:4px}.mobileUploadActions{grid-column:1/-1;display:flex;gap:8px}.mobileUploadActions button{border:1px solid #d7dfeb;background:#fff;border-radius:12px;padding:8px 10px}.mobileUploadActions .dangerText{color:#dc2626;border-color:#fecaca;background:#fef2f2}.mobileUploadItem.editable{border:1px solid #bfdbfe;background:#f8fbff}.mobileUploadItem.lockedItem{border:1px solid #e2e8f0}.mobileUploadEmpty{display:grid;place-items:center;min-height:74px;background:#f6f8fc;border-radius:16px;color:#90a0b8}.mobileTaskPager{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-top:2px}.mobileTaskPager button{border:1px solid #d7dfeb;background:#fff;border-radius:12px;padding:9px 10px}.mobileTaskPager button:disabled{opacity:.45}.mobileTaskPager span{text-align:center;color:#6b7a90;font-size:12px}.mobileUploadHint{font-size:12px!important;line-height:1.7!important;color:#6b7a90!important;background:#f8fafc;border-radius:14px;padding:10px 12px}.warningIcon{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:#fee2e2;color:#dc2626;font-size:30px;font-weight:700;margin-bottom:14px}.confirmModal small{color:#6b7a90;margin-bottom:6px}.confirmModal p{max-width:500px;color:#6b7a90;line-height:1.8;margin-top:10px}.confirmDetails{width:100%;display:grid;gap:10px;margin-top:18px;text-align:left}.confirmDetails div{background:#fff;border-radius:18px;padding:16px}.confirmDetails span{display:block;color:#6b7a90;margin-bottom:6px}.dangerSolid{background:#dc2626!important;color:#fff!important;border-color:#dc2626!important}.successIcon{display:grid;place-items:center;width:64px;height:64px;border-radius:50%;background:#dcfce7;color:#15803d;font-size:30px;font-weight:700;margin-bottom:14px}.successModal small{color:#6b7a90;margin-bottom:6px}.successModal p{max-width:460px;color:#6b7a90;line-height:1.8;margin-top:10px}.successActions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:22px}.successActions button{border:1px solid #d7dfeb;background:#fff;padding:11px 15px;border-radius:14px}.projectSuccess{width:min(720px,92vw)}.nextStepPanel{width:100%;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px;text-align:left}.nextStepPanel article{background:#fff;border-radius:18px;padding:16px}.nextStepPanel b,.nextStepPanel span{display:block}.nextStepPanel span{color:#6b7a90;margin-top:6px}.tagManagerModal{width:min(1080px,92vw)}.tagManagerToolbar{display:flex;gap:12px;align-items:center;margin-top:18px}.tagManagerToolbar select{border:1px solid #d7dfeb;background:#fff;border-radius:14px;padding:12px 14px}.tagAddBar{flex:1}.simpleToolbar .softButton{border:1px solid #d7dfeb;background:#fff;padding:12px 14px;border-radius:14px;font-weight:700}.recentTagStrip{display:flex;align-items:center;gap:12px;margin-top:14px}.recentTagStrip>span{color:#6b7a90;white-space:nowrap}.recentTagStrip>div{display:flex;gap:8px;flex-wrap:wrap}.recentTagStrip button{border:1px solid #d7dfeb;background:#fff;color:#315fd8;padding:8px 12px;border-radius:999px;font-weight:700}.recentTagStrip button:hover{background:#eef4ff}.bulkTagPanel{background:#fff;border-radius:20px;padding:16px;margin-top:14px;display:flex;gap:12px;align-items:flex-start}.compactBulkPanel textarea{flex:1;width:100%;min-height:84px;border:1px solid #d7dfeb;border-radius:16px;padding:12px 14px;font:inherit;resize:vertical}.compactBulkPanel button{border:1px solid #2563eb;padding:10px 14px;border-radius:14px;white-space:nowrap}.tagBatchBar{display:flex;justify-content:space-between;align-items:center;gap:12px;background:#fff;border-radius:20px;padding:14px 16px;margin-top:16px;transition:all .18s ease}.tagBatchBar:not(.active){color:#6b7a90}.tagBatchBar label{display:flex;align-items:center;gap:8px}.tagBatchBar div{display:flex;gap:8px;flex-wrap:wrap}.tagBatchBar button{border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:12px}.tagBatchBar .danger{color:#dc2626;border-color:#fecaca;background:#fef2f2}.tagManagerTable{background:#fff;border-radius:22px;padding:12px;margin-top:16px}.tagManagerTable table{width:100%;border-collapse:collapse}.tagManagerTable th,.tagManagerTable td{text-align:left;padding:16px 12px;border-bottom:1px solid #edf1f6}.tagManagerTable th:first-child,.tagManagerTable td:first-child{width:34px}.tagManagerTable tbody tr{cursor:pointer;transition:background .16s ease}.tagManagerTable tbody tr:hover{background:#f8fbff}.tagManagerTable tbody tr.selected{background:#eef5ff}.tagManagerTable tbody tr.selected td:first-child{border-left:3px solid #2563eb}.tagStatus{display:inline-flex;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700}.tagStatus.active{background:#dcfce7;color:#15803d}.tagStatus.merge{background:#fef3c7;color:#b45309}.tagActions{display:flex;gap:8px;flex-wrap:wrap}.tagActions button{border:1px solid #d7dfeb;background:#fff;padding:8px 12px;border-radius:12px}.importBody{display:grid;gap:16px;margin-top:18px}.uploadZone{display:grid;gap:10px;place-items:center;text-align:center;background:#fff;border:1px dashed #a9b8cf;border-radius:22px;padding:28px}.uploadZone span{color:#6b7a90}.uploadZone div{display:flex;gap:10px;margin-top:6px}.uploadZone button{border:1px solid #d7dfeb;background:#fff;padding:10px 14px;border-radius:14px}.importSteps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.importSteps article{background:#fff;border-radius:18px;padding:16px;display:grid;gap:8px}.importSteps b{display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:#dbeafe;color:#2563eb}.importSteps span{color:#6b7a90}.importNote{background:#fff;border-radius:20px;padding:18px;display:grid;gap:10px}.importNote div{background:#f6f8fc;border-radius:14px;padding:12px}.workerModal{width:min(1040px,92vw)}.workerModalBody{display:grid;gap:16px;margin-top:18px}.workerOverview{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.workerOverview article,.workerPanelGrid article,.workerNotePanel{background:#fff;border-radius:20px;padding:18px}.workerOverview span{display:block;color:#6b7a90}.workerOverview b{display:block;font-size:24px;margin-top:8px}.workerPanelGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.workerPanelGrid article{display:grid;gap:12px}.workerPanelGrid div{display:grid;gap:5px;background:#f6f8fc;border-radius:16px;padding:14px}.workerPanelGrid span{color:#6b7a90}.workerPanelGrid p,.workerNotePanel p{color:#6b7a90;line-height:1.8}.workerEntryActions{display:flex;gap:8px;flex-wrap:wrap}.workerPanelGrid button{justify-self:start;border:1px solid #d7dfeb;background:#fff;padding:9px 12px;border-radius:12px}.workerEntryActions button:last-child{background:#f8fafc;color:#475569}.workerEditHint{display:flex;gap:10px;align-items:flex-start;background:#fff7ed;border:1px solid #fed7aa;border-radius:18px;padding:14px 16px;margin-top:16px}.workerEditHint b{white-space:nowrap;color:#c2410c}.workerEditHint span{color:#9a3412;line-height:1.7}.projectModal{width:min(1040px,92vw)}.projectModalBody{display:grid;gap:16px;margin-top:18px}.projectOverview{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.projectOverview article,.projectPanel{background:#fff;border-radius:20px;padding:18px}.projectOverview span{display:block;color:#6b7a90}.projectOverview b{display:block;font-size:24px;margin-top:8px}.projectPanel p{color:#6b7a90;line-height:1.8;margin-top:10px}.ruleTags{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.ruleTags span{background:#e0f2fe;color:#0369a1;padding:8px 12px;border-radius:999px;font-weight:700}.projectTagEditor{background:#fff;border-radius:20px;padding:18px;margin-top:18px;display:grid;gap:14px}.projectTagEditor p{color:#6b7a90;line-height:1.7;margin-top:6px}.tagLibrary{display:flex;gap:8px;flex-wrap:wrap}.tagLibrary span{background:#eef4ff;color:#315fd8;padding:8px 12px;border-radius:999px;font-weight:700}.tagLibrary.viewLibrary{margin-top:12px}.ruleEditor{background:#fff;border-radius:20px;padding:18px;margin-top:18px}.ruleEditor h3{margin-bottom:14px}.ruleEditor{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.ruleEditor h3{grid-column:1/-1}.ruleEditor label{display:flex;align-items:center;gap:8px;background:#f6f8fc;padding:12px;border-radius:14px}.detailModal{width:min(1240px,92vw);max-height:min(860px,90vh);overflow:hidden;background:rgba(248,250,252,.96);border:1px solid rgba(255,255,255,.65);border-radius:28px;padding:22px;box-shadow:0 28px 90px rgba(15,23,42,.28);animation:modalRise .22s ease-out;display:grid;grid-template-rows:auto minmax(0,1fr)}.detailModal header{position:sticky;top:0;z-index:2;background:#fff;border-radius:22px;padding:18px 20px}.detailModal header p{color:#6b7a90;margin-top:6px}@keyframes overlayFade{from{opacity:0}to{opacity:1}}@keyframes modalRise{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}.detailLayout{display:grid;grid-template-columns:320px 1fr;gap:18px;margin-top:18px;min-height:0;overflow:auto;padding-right:4px}.detailInfo,.detailMedia,.requiredPanel,.timelinePanel{background:#fff;border-radius:22px;padding:20px}.detailInfo{display:grid;gap:12px;align-content:start;position:sticky;top:0;height:max-content}.detailBlockTitle{display:flex!important;justify-content:space-between;align-items:center;background:transparent!important;padding:0!important;margin-bottom:4px}.detailBlockTitle span{margin:0!important;background:#dbeafe;color:#2563eb;padding:6px 10px;border-radius:999px;font-weight:700}.detailInfo div:not(.detailBlockTitle){background:#f6f8fc;border-radius:16px;padding:14px}.detailInfo span{display:block;color:#6b7a90;font-size:13px;margin-bottom:5px}.detailMain{display:grid;gap:18px}.detailMetrics{display:grid;grid-template-columns:1fr .75fr 1fr;gap:14px}.detailMetrics article{background:#fff;border-radius:20px;padding:18px}.detailMetrics span,.detailMetrics small{display:block;color:#6b7a90}.detailMetrics b{display:block;font-size:22px;margin:8px 0}.detailMetrics em{display:block;height:8px;background:#e8eef7;border-radius:999px;overflow:hidden}.detailMetrics i{display:block;height:100%;background:linear-gradient(90deg,#2563eb,#22c55e)}.requiredPanel h3,.timelinePanel h3{margin-bottom:14px}.requiredPanel div{display:flex;gap:10px;flex-wrap:wrap}.requiredPanel span{padding:8px 12px;border-radius:999px;font-weight:700}.requiredPanel .done{background:#dcfce7;color:#15803d}.requiredPanel .missing{background:#fee2e2;color:#dc2626}.detailMediaGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:16px}.timelinePanel{display:grid;gap:14px}.timelinePanel div{display:grid;grid-template-columns:150px 150px 1fr;gap:12px;align-items:start;padding-top:14px;border-top:1px solid #edf1f6}.timelinePanel div:first-of-type{border-top:0;padding-top:0}.timelinePanel time{color:#6b7a90}.timelinePanel span{color:#6b7a90}.detailMediaGrid button{position:relative;height:220px;border:0;border-radius:18px;overflow:hidden;padding:0;background:#e8eef7;cursor:default}.detailMediaGrid img,.detailMediaGrid video{width:100%;height:100%;object-fit:cover}.detailMediaGrid span{position:absolute;left:12px;bottom:12px;background:rgba(15,23,42,.82);color:#fff;padding:6px 10px;border-radius:999px}.right span{font-weight:700;color:#2563eb}@media(max-width:1000px){.app{grid-template-columns:1fr}.app>aside{display:none}.mapDispatchLayout,.practicalMapLayout{min-height:auto}.mapCanvas{min-height:420px;height:auto}.summary,.grid,.detailLayout,.detailMediaGrid,.detailMetrics,.premiumPreviewBody,.projectSummary,.projectList,.projectOverview,.editGrid,.ruleEditor,.importSteps,.nextStepPanel,.dispatchSummary,.dispatchLayout,.dispatchResultPanel,.workerSummary,.workerCards,.workerOverview,.workerPanelGrid,.mapDispatchLayout,.mapSummaryPanel>div,.overviewHero,.overviewGrid,.overviewBottomGrid,.systemSummary,.systemLayout,.systemServiceGrid,.mapKpiStrip{grid-template-columns:1fr}.toolbar{display:grid}.toolbar .left,.toolbar .right,.pointToolbar,.tagManagerToolbar,.tagBatchBar,.bulkTagPanel,.mapSelectionBasket,.mapWorkflowTabs{flex-wrap:wrap}.pointToolbar input{min-height:42px}.pointTableWrap{overflow:auto}.timelinePanel div{grid-template-columns:1fr}.premiumPreview{max-height:calc(100vh - 24px)}.premiumPreviewBody{height:min(68vh,560px)}.stage{min-height:0;padding:14px}.previewInfo{order:-1}}
`;

export default App;
