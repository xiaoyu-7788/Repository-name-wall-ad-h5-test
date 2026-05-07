import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const amapKey = import.meta.env.VITE_AMAP_KEY;
const amapSecurityCode = import.meta.env.VITE_AMAP_SECURITY_CODE;
const kimiClassifyEndpoint = import.meta.env.VITE_KIMI_CLASSIFY_ENDPOINT;
const forceLocalDemo = import.meta.env.VITE_FORCE_LOCAL_DEMO === "true";

function maskValue(value) {
  if (!value) return "";
  if (value.length <= 10) return `${value.slice(0, 2)}***${value.slice(-2)}`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function validateSupabaseUrl(value) {
  if (!value) return { ok: false, reason: "未读取到 VITE_SUPABASE_URL" };
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol)) {
      return { ok: false, reason: "URL 必须以 http:// 或 https:// 开头" };
    }
    if (!url.hostname.includes(".")) {
      return { ok: false, reason: "URL 主机名格式不正确" };
    }
    return {
      ok: true,
      reason: url.hostname.endsWith(".supabase.co") ? "Supabase URL 格式正确" : "URL 可解析，可能是自定义域名",
      origin: url.origin,
      hostname: url.hostname,
    };
  } catch (err) {
    return { ok: false, reason: "URL 无法解析，请检查 VITE_SUPABASE_URL" };
  }
}

const urlValidation = validateSupabaseUrl(supabaseUrl);

export const supabaseEnv = {
  url: supabaseUrl || "",
  anonKey: supabaseAnonKey || "",
  amapKey: amapKey || "",
  amapSecurityCode: amapSecurityCode || "",
  kimiClassifyEndpoint: kimiClassifyEndpoint || "",
  hasUrl: Boolean(supabaseUrl),
  hasAnonKey: Boolean(supabaseAnonKey),
  hasAmapKey: Boolean(amapKey),
  hasAmapSecurityCode: Boolean(amapSecurityCode),
  hasKimiClassifyEndpoint: Boolean(kimiClassifyEndpoint),
  forceLocalDemo,
  maskedUrl: maskValue(supabaseUrl || ""),
  maskedAnonKey: maskValue(supabaseAnonKey || ""),
  maskedAmapKey: maskValue(amapKey || ""),
  maskedAmapSecurityCode: maskValue(amapSecurityCode || ""),
  urlValidation,
};

export const isSupabaseConfigured = !forceLocalDemo && Boolean(supabaseUrl && supabaseAnonKey && urlValidation.ok);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
