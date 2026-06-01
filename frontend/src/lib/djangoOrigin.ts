/**
 * Django API origin without trailing slash (e.g. https://api.example.com).
 * Used for /admin redirect when the panel is served from the API host.
 */
export function getDjangoOrigin(): string {
  const explicit = import.meta.env.VITE_DJANGO_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const api = import.meta.env.VITE_API_BASE_URL?.trim();
  if (api) {
    const normalized = api.replace(/\/?$/, "/");
    const origin = normalized.replace(/\/api\/$/i, "");
    if (origin) return origin.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) return "http://127.0.0.1:8000";

  if (typeof window !== "undefined") return window.location.origin;

  return "";
}
