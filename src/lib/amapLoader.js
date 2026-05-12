const AMAP_VERSION = "2.0";
const AMAP_SCRIPT_ID = "amap-js-sdk-v2";

let amapPromise = null;

function envValue(name) {
  return String(import.meta.env[name] || "").trim();
}

function buildScriptUrl(key, redact = false) {
  const scriptKey = redact ? "__AMAP_KEY_SET__" : encodeURIComponent(key);
  return `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${scriptKey}&plugin=AMap.Scale,AMap.ToolBar`;
}

export function getAmapDiagnostics() {
  const key = envValue("VITE_AMAP_KEY");
  const securityCode = envValue("VITE_AMAP_SECURITY_CODE");

  return {
    hasKey: Boolean(key),
    hasSecurityCode: Boolean(securityCode),
    scriptUrl: key ? buildScriptUrl(key, true) : "",
    version: AMAP_VERSION,
    hostname: typeof window !== "undefined" ? window.location.hostname : "",
    protocol: typeof window !== "undefined" ? window.location.protocol : "",
  };
}

export function loadAmapSdk() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("AMap SDK can only load in browser."));
  }

  const key = envValue("VITE_AMAP_KEY");
  const securityCode = envValue("VITE_AMAP_SECURITY_CODE");
  if (!key) return Promise.reject(new Error("缺少 VITE_AMAP_KEY"));
  if (!securityCode) return Promise.reject(new Error("缺少 VITE_AMAP_SECURITY_CODE"));
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapPromise) return amapPromise;

  window._AMapSecurityConfig = {
    securityJsCode: securityCode,
  };

  amapPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(AMAP_SCRIPT_ID);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.AMap));
      existing.addEventListener("error", () => reject(new Error("高德 JS SDK 加载失败")));
      return;
    }

    const script = document.createElement("script");
    script.id = AMAP_SCRIPT_ID;
    script.src = buildScriptUrl(key);
    script.async = true;
    script.onload = () => {
      if (window.AMap) resolve(window.AMap);
      else reject(new Error("高德 JS SDK 已加载但 window.AMap 不存在"));
    };
    script.onerror = () => reject(new Error("高德 JS SDK 加载失败"));
    document.head.appendChild(script);
  });

  amapPromise = amapPromise.catch((error) => {
    amapPromise = null;
    throw error;
  });

  return amapPromise;
}
