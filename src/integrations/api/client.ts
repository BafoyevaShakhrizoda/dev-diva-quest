const rawBase =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "http://localhost:8000/api/";
const API_BASE_URL = rawBase.replace(/\/?$/, "/");

const AUTH_TOKEN_KEY = "devgirlz_token";
const AUTH_USER_KEY = "devgirlz_user";

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
  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth) {
    const t = getStoredToken();
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
    const raw = await this.post("users/login/", { email, password }, false);
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

  async getMySkillTests() {
    const raw = await this.get("skills/my-tests/", true);
    return Array.isArray(raw) ? raw : [];
  },

  async saveSkillResult(payload: {
    role: string;
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

  async getAllJobs(filters?: Record<string, string>) {
    const query =
      filters && Object.keys(filters).length
        ? `?${new URLSearchParams(filters)}`
        : "";
    return this.get(`jobs/all/${query}`);
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
};
