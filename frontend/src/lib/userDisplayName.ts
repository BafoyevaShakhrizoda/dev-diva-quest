import type { DjangoUser } from "@/integrations/api/client";

/** Full name from Django user; falls back to email local-part, then a generic greeting token. */
export function formatUserDisplayName(user: DjangoUser | null | undefined): string {
  if (!user) return "there";
  const first = (user.first_name ?? "").trim();
  const last = (user.last_name ?? "").trim();
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) return combined;
  const local = user.email?.split("@")[0]?.trim();
  if (local) return local;
  return "there";
}
