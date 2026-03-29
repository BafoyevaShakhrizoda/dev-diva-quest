import { useEffect, useMemo, useState } from "react";

/**
 * Django admin lives on the API origin (e.g. https://xxx.onrender.com/admin/), not on the SPA.
 * Visiting /admin on the frontend redirects there.
 */
function apiOriginFromEnv(): string {
  const explicit = import.meta.env.VITE_DJANGO_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const api = (
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:8000/api/"
  ).replace(/\/?$/, "/");
  return api.replace(/\/api\/$/, "") || "http://localhost:8000";
}

const AdminRedirect = () => {
  const target = useMemo(() => `${apiOriginFromEnv()}/admin/`, []);
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      window.location.replace(target);
    } catch {
      setErr("Could not redirect. Open the admin URL on your API host.");
    }
  }, [target]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center font-body">
      <p className="text-muted-foreground text-sm">
        {err || "Redirecting to Django admin…"}
      </p>
      {!err && (
        <a href={target} className="mt-4 text-primary text-sm underline">
          If nothing happens, click here
        </a>
      )}
    </div>
  );
};

export default AdminRedirect;
