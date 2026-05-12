import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabaseEnv = {
  dataMode: String(import.meta.env.VITE_DATA_MODE || "").toLowerCase(),
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL || ""),
  amapKey: import.meta.env.VITE_AMAP_KEY || "",
  amapSecurityCode: import.meta.env.VITE_AMAP_SECURITY_CODE || "",
  kimiClassifyEndpoint: import.meta.env.VITE_KIMI_CLASSIFY_ENDPOINT || "",
  supabaseUrl,
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasSupabaseAnonKey: Boolean(supabaseAnonKey),
  hasSupabaseConfig: isSupabaseConfigured,
  hasAmapKey: Boolean(import.meta.env.VITE_AMAP_KEY),
  hasAmapSecurityCode: Boolean(import.meta.env.VITE_AMAP_SECURITY_CODE),
  hasKimiClassifyEndpoint: Boolean(import.meta.env.VITE_KIMI_CLASSIFY_ENDPOINT),
  forceLocalDemo: import.meta.env.VITE_FORCE_LOCAL_DEMO === "true",
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

export function requireSupabaseClient() {
  if (!supabase) {
    const error = new Error("当前未配置 Supabase 环境变量，已进入演示模式。");
    error.category = "数据库未连接";
    error.detail = "请在 Vercel 环境变量中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。";
    throw error;
  }
  return supabase;
}
