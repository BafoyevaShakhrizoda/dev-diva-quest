export type PlatformEventRow = {
  id: number;
  title: string;
  summary: string;
  external_url: string;
  location: string;
  starts_at: string | null;
  sort_order: number;
};

function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  /** In development, requests go through Vite proxy: `/api` → Django (default http://127.0.0.1:8000). */
  const useDevProxy = import.meta.env.DEV && import.meta.env.VITE_API_DIRECT !== "true";
  if (useDevProxy) {
    return "/api/";
  }
  if (fromEnv) return fromEnv.replace(/\/?$/, "/");
  if (import.meta.env.DEV) return "/api/";
  return "";
}

const API_BASE_URL = resolveApiBase();

const AUTH_TOKEN_KEY = "devgirlz_token";
const AUTH_USER_KEY = "devgirlz_user";
const ADMIN_TOKEN_KEY = "devgirlz_admin_token";
const ADMIN_USER_KEY = "devgirlz_admin_user";

export type AdminUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
};

export type AdminStats = {
  generated_at: string;
  users: { total: number; verified: number; new_this_week: number };
  jobs: {
    total: number;
    active: number;
    applications: number;
    applications_pending: number;
    matches: number;
  };
  skills: {
    tests_total: number;
    tests_this_week: number;
    questions: number;
    by_role: { role: string; count: number }[];
  };
  cv: { total: number; active_templates: number };
  events: { total: number; active: number };
  applications_by_status: { status: string; count: number }[];
};

export type AdminCapability = {
  id: string;
  title: string;
  description: string;
  django_section: string | null;
  access: string;
  note?: string;
};

export function getStoredAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function getStoredAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function persistAdminAuth(token: string, user: AdminUser) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

async function adminRequest(
  method: string,
  endpoint: string,
  body?: unknown,
  auth = false,
): Promise<unknown> {
  if (!API_BASE_URL) {
    const err = new Error("VITE_API_BASE_URL is not set.") as Error & { status?: number; data?: unknown };
    err.status = 0;
    throw err;
  }
  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const t = getStoredAdminToken();
    if (t) headers.Authorization = `Token ${t}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    credentials: "omit",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parseJson(res);
  if (!res.ok) {
    const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const err = new Error(String(o.error || o.detail || res.statusText)) as Error & {
      status?: number;
      data?: unknown;
    };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export type DjangoUser = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string | null;
  email_verified?: boolean;
  created_at?: string;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser(): DjangoUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DjangoUser;
  } catch {
    return null;
  }
}

export function persistAuth(token: string, user: DjangoUser) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/** Merge into the signed-in user stored after profile API updates (name, role, etc.). */
export function mergeStoredUser(updates: Partial<DjangoUser>) {
  const token = getStoredToken();
  const user = getStoredUser();
  if (!token || !user) return;
  const next: DjangoUser = { ...user };
  (Object.keys(updates) as (keyof DjangoUser)[]).forEach((k) => {
    const v = updates[k];
    if (v !== undefined) (next as Record<string, unknown>)[k as string] = v as unknown;
  });
  persistAuth(token, next);
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text };
  }
}

async function request(
  method: string,
  endpoint: string,
  body?: unknown,
  auth = false
): Promise<unknown> {
  if (!API_BASE_URL) {
    const err = new Error(
      "VITE_API_BASE_URL is not set. For production builds, set it to your Django API base URL (must end with /api/).",
    ) as Error & { status?: number; data?: unknown };
    err.status = 0;
    err.data = { detail: err.message };
    throw err;
  }
  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const t = getStoredToken();
    if (t) headers.Authorization = `Token ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: "omit",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    const hint =
      typeof cause === "object" && cause !== null && "message" in cause
        ? String((cause as Error).message)
        : String(cause);
    const isNetwork =
      hint.includes("fetch") ||
      hint.includes("NetworkError") ||
      hint.includes("Failed to fetch");
    const msg = isNetwork
      ? `Cannot reach the API (${API_BASE_URL}). On production, set VITE_API_BASE_URL to your Django /api/ URL when building the frontend, and ensure the backend allows this site in CORS.`
      : hint;
    const err = new Error(msg) as Error & { status?: number; data?: unknown };
    err.status = 0;
    err.data = { detail: msg };
    throw err;
  }
  const data = await parseJson(res);
  if (!res.ok) {
    const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const err = new Error(
      String(o.detail || o.error || (typeof data === "object" ? JSON.stringify(data) : data) || res.statusText)
    ) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function requestForm(
  method: string,
  endpoint: string,
  formData: FormData,
  auth: boolean,
): Promise<unknown> {
  if (!API_BASE_URL) {
    const err = new Error(
      "VITE_API_BASE_URL is not set. For production builds, set it to your Django API base URL (must end with /api/).",
    ) as Error & { status?: number; data?: unknown };
    err.status = 0;
    err.data = { detail: err.message };
    throw err;
  }
  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {};
  if (auth) {
    const t = getStoredToken();
    if (t) headers.Authorization = `Token ${t}`;
  }
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      credentials: "omit",
      body: formData,
    });
  } catch (cause) {
    const hint =
      typeof cause === "object" && cause !== null && "message" in cause
        ? String((cause as Error).message)
        : String(cause);
    const err = new Error(hint) as Error & { status?: number; data?: unknown };
    err.status = 0;
    err.data = { detail: hint };
    throw err;
  }
  const data = await parseJson(res);
  if (!res.ok) {
    const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const err = new Error(
      String(o.detail || o.error || (typeof data === "object" ? JSON.stringify(data) : data) || res.statusText)
    ) as Error & { status?: number; data?: unknown };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiClient = {
  get(endpoint: string, auth = false) {
    return request("GET", endpoint, undefined, auth);
  },

  post(endpoint: string, data?: unknown, auth = false) {
    return request("POST", endpoint, data, auth);
  },

  patch(endpoint: string, data?: unknown, auth = false) {
    return request("PATCH", endpoint, data, auth);
  },

  async register(payload: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
  }) {
    return this.post("users/register/", payload, false);
  },

  async login(email: string, password: string) {
    const raw = await this.post(
      "users/login/",
      { email_or_username: email, email, password },
      false,
    );
    const data = raw as { token?: string; user?: DjangoUser };
    if (data.token && data.user) {
      persistAuth(data.token, data.user);
    }
    return data;
  },

  async logout() {
    try {
      await this.post("users/logout/", {}, true);
    } finally {
      clearAuth();
    }
  },

  async verifyEmail(uid: string, token: string) {
    return this.post(`users/verify-email/${encodeURIComponent(uid)}/${encodeURIComponent(token)}/`, {});
  },

  async resendVerification(email: string) {
    return this.post("users/resend-verification/", { email }, false);
  },

  async getProfile() {
    return this.get("users/profile/", true);
  },

  async updateProfile(data: Record<string, unknown>) {
    return this.patch("users/profile/update/", data, true);
  },

  async updateProfileForm(formData: FormData) {
    return requestForm("PATCH", "users/profile/update/", formData, true);
  },

  async changePassword(body: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) {
    return this.post("users/change-password/", body, true);
  },

  async deleteAccount(password: string) {
    return this.post("users/delete-account/", { password }, true);
  },

  async getMySkillTests() {
    const raw = await this.get("skills/my-tests/", true);
    return Array.isArray(raw) ? raw : [];
  },

  async saveSkillResult(payload: {
    role: string;
    /** SPA career id — backend maps to Job.role for recommendations */
    career_id?: string;
    language?: string | null;
    tier?: string;
    level: string;
    feedback: string;
    score: string;
    questions?: unknown[];
    answers?: Record<number, number>;
  }) {
    return this.post("skills/save-result/", payload, true);
  },

  async generateSkillSession(body: {
    role: string;
    tier: string;
    language?: string | null;
    career_title?: string;
    count?: number;
  }) {
    return this.post("skills/generate-session/", body, false);
  },

  async evaluateSkill(body: {
    role: string;
    tier: string;
    questions: { q: string; options: string[]; correct: number }[];
    answers: number[];
  }) {
    return this.post(
      "skills/evaluate/",
      {
        role: body.role,
        tier: body.tier,
        questions: body.questions.map((q) => ({
          q: q.q,
          options: q.options,
          correct: q.correct,
        })),
        answers: body.answers,
      },
      false,
    );
  },

  async getRecommendedJobs() {
    return this.get("jobs/recommended/", true);
  },

  async getEvents(): Promise<PlatformEventRow[]> {
    const raw = await this.get("events/", false);
    return Array.isArray(raw) ? (raw as PlatformEventRow[]) : [];
  },

  async getAllJobs(filters?: Record<string, string>) {
    const query =
      filters && Object.keys(filters).length
        ? `?${new URLSearchParams(filters)}`
        : "";
    return this.get(`jobs/all/${query}`);
  },

  async getJob(jobId: number) {
    return this.get(`jobs/${jobId}/`, Boolean(getStoredToken()));
  },

  async applyJob(jobId: number, data: Record<string, unknown>) {
    return this.post(`jobs/apply/${jobId}/`, data, true);
  },

  async getCVs() {
    return this.get("cv/my-cvs/", true);
  },

  async generateCV(data: unknown) {
    return this.post("cv/generate/", data, true);
  },

  async adminLogin(username: string, password: string) {
    const raw = await adminRequest("POST", "admin/login/", { username, password }, false);
    const data = raw as { token?: string; user?: AdminUser };
    if (data.token && data.user) {
      persistAdminAuth(data.token, data.user);
    }
    return data;
  },

  async adminLogout() {
    try {
      await adminRequest("POST", "admin/logout/", {}, true);
    } finally {
      clearAdminAuth();
    }
  },

  async adminStats(): Promise<AdminStats> {
    return adminRequest("GET", "admin/stats/", undefined, true) as Promise<AdminStats>;
  },

  async adminPermissions(): Promise<{ role: string; capabilities: AdminCapability[] }> {
    return adminRequest("GET", "admin/permissions/", undefined, true) as Promise<{
      role: string;
      capabilities: AdminCapability[];
    }>;
  },
};
