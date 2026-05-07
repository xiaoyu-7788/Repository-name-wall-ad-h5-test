export const supabaseEnv = {
  dataMode: String(import.meta.env.VITE_DATA_MODE || "local").toLowerCase(),
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL || ""),
  amapKey: import.meta.env.VITE_AMAP_KEY || "",
  amapSecurityCode: import.meta.env.VITE_AMAP_SECURITY_CODE || "",
  kimiClassifyEndpoint: import.meta.env.VITE_KIMI_CLASSIFY_ENDPOINT || "",
  hasAmapKey: Boolean(import.meta.env.VITE_AMAP_KEY),
  hasAmapSecurityCode: Boolean(import.meta.env.VITE_AMAP_SECURITY_CODE),
  hasKimiClassifyEndpoint: Boolean(import.meta.env.VITE_KIMI_CLASSIFY_ENDPOINT),
  forceLocalDemo: import.meta.env.VITE_FORCE_LOCAL_DEMO === "true",
};

export const isSupabaseConfigured = false;
export const supabase = null;
