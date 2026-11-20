export interface Env {
  DB: D1Database;
  APP_ENV?: string;
  PUBLIC_API_BASE_URL?: string;
  LRCLIB_USER_AGENT?: string;
  LRC_RED_USER_AGENT?: string;
  ADMIN_SECRET?: string;
}

export interface AppVariables {
  requestId: string;
  apiKeyId?: string;
  tier: "anonymous" | "free" | "admin";
}
