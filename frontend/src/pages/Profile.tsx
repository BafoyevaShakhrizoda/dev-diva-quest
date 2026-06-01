import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { formatUserDisplayName } from "@/lib/userDisplayName";
import { apiClient, mergeStoredUser, clearAuth, type DjangoUser } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  Code2,
  ChevronRight,
  Loader2,
  BookOpen,
  ArrowLeft,
  Pencil,
  Shield,
  Trash2,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nProvider";

const ROLE_VALUES = ["beginner", "junior", "middle", "senior"] as const;

interface DjangoProfile {
  id: number;
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: string | null;
    created_at?: string;
  };
  avatar_url?: string | null;
  bio?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  telegram?: string;
  phone?: string;
  experience_years?: number;
  resume_url?: string;
}

interface SkillRow {
  id: number;
  role: string;
  language?: string | null;
  tier?: string | null;
  level?: string;
  result_level?: string;
  feedback?: string | null;
  score?: number;
  created_at: string;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  Junior: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  Middle: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  Senior: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
  beginner: "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
  junior: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  middle: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  senior: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
};

const levelEmoji: Record<string, string> = {
  Beginner: "🌱",
  Junior: "✨",
  Middle: "💪",
  Senior: "👑",
  beginner: "🌱",
  junior: "✨",
  middle: "💪",
  senior: "👑",
};

const tierBadge: Record<string, string> = {
  junior: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  middle: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  senior: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
};

function displayLevel(r: SkillRow): string {
  return r.level || (r.result_level ? r.result_level.replace(/^./, (c) => c.toUpperCase()) : "");
}

const Profile = () => {
  const { t } = useI18n();
  const roleOptions = useMemo(
    () => [
      { value: "", label: t("profile.role.none") },
      { value: "beginner", label: t("profile.role.beginner") },
      { value: "junior", label: t("profile.role.junior") },
      { value: "middle", label: t("profile.role.middle") },
      { value: "senior", label: t("profile.role.senior") },
    ],
    [t],
  );

  const roleLabel = (code: string | null | undefined) => {
    if (!code) return null;
    return roleOptions.find((o) => o.value === code)?.label ?? code;
  };

  const { user, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DjangoProfile | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"profile" | "security">("profile");
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [telegram, setTelegram] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [avatarUrlExternal, setAvatarUrlExternal] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [clearAvatar, setClearAvatar] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [pwdBusy, setPwdBusy] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const syncFormFromProfile = useCallback((p: DjangoProfile | null) => {
    if (!p) return;
    setFirstName(p.user.first_name || "");
    setLastName(p.user.last_name || "");
    const rawRole = (p.user.role || "").toLowerCase();
    const allowed = new Set(ROLE_VALUES);
    setRole(rawRole && allowed.has(rawRole) ? rawRole : "");
    setBio(p.bio || "");
    setLocation(p.location || "");
    setPhone(p.phone || "");
    setGithubUrl(p.github_url || "");
    setLinkedinUrl(p.linkedin_url || "");
    setTelegram(p.telegram || "");
    setResumeUrl(p.resume_url || "");
    setAvatarUrlExternal("");
    setExperienceYears(p.experience_years != null ? String(p.experience_years) : "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setClearAvatar(false);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [p, tests] = await Promise.all([
        apiClient.getProfile() as Promise<DjangoProfile>,
        apiClient.getMySkillTests() as Promise<SkillRow[]>,
      ]);
      setProfile(p);
      setResults(tests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user?.id, navigate, fetchData]);

  useEffect(() => {
    if (settingsOpen && profile) syncFormFromProfile(profile);
  }, [settingsOpen, profile, syncFormFromProfile]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const displayName =
    profile?.user?.first_name || profile?.user?.last_name
      ? `${profile.user.first_name || ""} ${profile.user.last_name || ""}`.trim()
      : formatUserDisplayName(user ?? null);

  const bestResults = results.reduce((acc, r) => {
    const key = `${r.role}${r.language ? `-${r.language}` : ""}`;
    const lv = displayLevel(r);
    if (!acc[key] || getLevelNum(lv) > getLevelNum(displayLevel(acc[key]))) acc[key] = r;
    return acc;
  }, {} as Record<string, SkillRow>);

  const topLevel =
    results.length > 0
      ? results.reduce((best, r) =>
          getLevelNum(displayLevel(r)) > getLevelNum(displayLevel(best)) ? r : best,
        )
      : null;

  const initials = (displayName || user?.email || "?")[0].toUpperCase();

  const heroAvatarSrc = avatarPreview || profile?.avatar_url || undefined;

  const formatApiErrors = (data: Record<string, unknown> | undefined): string => {
    if (!data) return "";
    const parts: string[] = [];
    for (const [k, v] of Object.entries(data)) {
      if (k === "detail" && typeof v === "string") parts.push(v);
      else if (Array.isArray(v) && v.length) parts.push(`${k}: ${v.map(String).join(", ")}`);
      else if (typeof v === "string") parts.push(`${k}: ${v}`);
      else if (v && typeof v === "object" && !Array.isArray(v)) parts.push(`${k}: ${JSON.stringify(v)}`);
    }
    return parts.join(" · ") || "Request failed";
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      let updated: DjangoProfile;

      if (avatarFile) {
        const fd = new FormData();
        fd.append("first_name", firstName.trim());
        fd.append("last_name", lastName.trim());
        fd.append("role", role || "");
        fd.append("bio", bio);
        fd.append("location", location);
        fd.append("phone", phone);
        fd.append("github_url", githubUrl.trim());
        fd.append("linkedin_url", linkedinUrl.trim());
        fd.append("telegram", telegram.trim());
        fd.append("resume_url", resumeUrl.trim());
        if (avatarUrlExternal.trim()) fd.append("avatar_url", avatarUrlExternal.trim());
        if (experienceYears.trim() !== "") {
          const n = parseInt(experienceYears, 10);
          if (!Number.isNaN(n)) fd.append("experience_years", String(n));
        }
        if (clearAvatar) fd.append("clear_avatar", "true");
        fd.append("avatar", avatarFile);
        updated = (await apiClient.updateProfileForm(fd)) as DjangoProfile;
      } else {
        const body: Record<string, unknown> = {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: role || null,
          bio,
          location,
          phone,
          github_url: githubUrl.trim(),
          linkedin_url: linkedinUrl.trim(),
          telegram: telegram.trim(),
          resume_url: resumeUrl.trim(),
          clear_avatar: clearAvatar,
        };
        if (avatarUrlExternal.trim()) body.avatar_url = avatarUrlExternal.trim();
        if (experienceYears.trim() !== "") {
          const n = parseInt(experienceYears, 10);
          if (!Number.isNaN(n)) body.experience_years = n;
        }
        updated = (await apiClient.updateProfile(body)) as DjangoProfile;
      }

      setProfile(updated);
      if (updated.user) {
        mergeStoredUser({
          first_name: updated.user.first_name,
          last_name: updated.user.last_name,
          role: updated.user.role ?? undefined,
        } as Partial<DjangoUser>);
        refreshUser();
      }
      toast.success(t("profile.saved"));
      setSettingsOpen(false);
    } catch (err: unknown) {
      const e = err as { message?: string; data?: Record<string, unknown> };
      const detail = formatApiErrors(e.data);
      toast.error(detail || e.message || t("profile.toastSaveFail"));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdBusy(true);
    try {
      await apiClient.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword2,
      });
      toast.success(t("profile.toastPwdOk"));
      clearAuth();
      setSettingsOpen(false);
      navigate("/auth");
    } catch (err: unknown) {
      const e = err as { message?: string; data?: Record<string, unknown> };
      const d = e.data;
      const msg =
        (d && typeof d === "object" && (String(d.old_password?.[0] || d.new_password?.[0] || d.detail || ""))) ||
        e.message ||
        t("profile.toastPwdFail");
      toast.error(msg);
    } finally {
      setPwdBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteBusy(true);
    try {
      await apiClient.deleteAccount(deletePassword);
      toast.success(t("profile.toastDeleted"));
      clearAuth();
      setSettingsOpen(false);
      navigate("/auth");
    } catch (err: unknown) {
      const e = err as { message?: string; data?: { error?: string } };
      toast.error(e.data?.error || e.message || t("profile.toastDeleteFail"));
    } finally {
      setDeleteBusy(false);
    }
  };

  const inputCls =
    "rounded-xl border border-border bg-background px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <section className="relative overflow-hidden gradient-hero pt-14 pb-20">
        <div className="absolute top-0 right-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/8 blur-3xl" />
        <div className="container relative z-10 mx-auto px-4">
          <Link
            to="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft size={14} /> {t("profile.back")}
          </Link>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="h-24 w-24 overflow-hidden rounded-3xl border-2 border-primary/20 shadow-soft sm:h-28 sm:w-28">
                {heroAvatarSrc && !clearAvatar ? (
                  <img src={heroAvatarSrc} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center gradient-primary">
                    <span className="font-display text-3xl font-bold text-white sm:text-4xl">{initials}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0">
                  <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">{displayName}</h1>
                  <div className="mt-1 flex items-center gap-2 font-body text-sm text-muted-foreground">
                    <Mail size={13} />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  {profile?.bio ? (
                    <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {profile.bio}
                    </p>
                  ) : null}
                  {roleLabel(profile?.user?.role) ? (
                    <p className="mt-2 font-body text-xs text-muted-foreground">
                      {t("profile.selfLevel")}{" "}
                      <span className="font-medium text-foreground">{roleLabel(profile?.user?.role)}</span>
                    </p>
                  ) : null}
                  {topLevel && (
                    <div
                      className={`mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-body text-xs font-semibold ${levelColors[displayLevel(topLevel)] || "bg-muted"}`}
                    >
                      <span>{levelEmoji[displayLevel(topLevel)] || "✨"}</span>
                      {t("profile.topTest")} {displayLevel(topLevel)} — {topLevel.role}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0 rounded-full gap-2"
                  onClick={() => {
                    setSettingsTab("profile");
                    setSettingsOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  {t("profile.editProfile")}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 bg-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-foreground">
                  <User size={15} className="text-primary" /> {t("profile.account")}
                </h3>
                <div className="space-y-3 font-body text-sm">
                  <div className="flex items-center gap-3">
                    <Mail size={13} className="shrink-0 text-muted-foreground" />
                    <span className="truncate text-foreground">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar size={13} className="shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("profile.joined")}{" "}
                      {profile?.user?.created_at
                        ? new Date(profile.user.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <BookOpen size={13} className="shrink-0 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {results.length}{" "}
                      {results.length === 1 ? t("profile.testsSaved") : t("profile.testsSavedPlural")}{" "}
                      {t("profile.savedSuffix")}
                    </span>
                  </div>
                  {profile?.phone ? (
                    <p className="text-muted-foreground">
                      {t("profile.phone")} <span className="text-foreground">{profile.phone}</span>
                    </p>
                  ) : null}
                  {profile?.location ? (
                    <p className="text-muted-foreground">
                      {t("profile.location")} <span className="text-foreground">{profile.location}</span>
                    </p>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    className="w-full rounded-full gap-2"
                    onClick={() => {
                      setSettingsTab("profile");
                      setSettingsOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t("profile.editPhoto")}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full rounded-full gap-2"
                    onClick={() => {
                      setSettingsTab("security");
                      setSettingsOpen(true);
                    }}
                  >
                    <Shield className="h-4 w-4" />
                    {t("profile.passwordSecurity")}
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full rounded-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={async () => {
                      await signOut();
                      navigate("/auth");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signOut")}
                  </Button>
                </div>
              </div>

              {Object.keys(bestResults).length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-5">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-foreground">
                    <Trophy size={15} className="text-primary" /> {t("profile.bestLevels")}
                  </h3>
                  <div className="space-y-2">
                    {Object.values(bestResults).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <Code2 size={12} className="shrink-0 text-muted-foreground" />
                          <span className="truncate font-body text-xs text-foreground">
                            {r.role}
                            {r.language ? ` / ${r.language}` : ""}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2 py-0.5 font-body text-[11px] font-semibold ${levelColors[displayLevel(r)] || "bg-muted"}`}
                        >
                          {levelEmoji[displayLevel(r)]} {displayLevel(r)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link
                to="/test"
                className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-primary/90 p-4 text-white shadow-soft"
              >
                <div>
                  <p className="font-display text-sm font-bold">{t("profile.takeTest")}</p>
                  <p className="text-xs text-white/80 font-body">{t("profile.takeTestSub")}</p>
                </div>
                <ChevronRight size={18} className="text-white/80 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="lg:col-span-2">
              <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Trophy size={16} className="text-primary" /> {t("profile.testHistory")}
              </h3>

              {results.length === 0 ? (
                <div className="rounded-2xl border border-border bg-card p-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-secondary">
                    <BookOpen size={22} className="text-muted-foreground" />
                  </div>
                  <p className="mb-1 font-display text-base font-semibold text-foreground">{t("profile.noTests")}</p>
                  <p className="mb-4 font-body text-sm text-muted-foreground">{t("profile.noTestsHint")}</p>
                  <Link
                    to="/test"
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-body text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {t("profile.startTest")} <ChevronRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/25"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-sm font-bold text-foreground">{r.role}</span>
                            {r.language && (
                              <span className="rounded-full border border-primary/15 bg-primary/8 px-2 py-0.5 font-body text-xs text-primary">
                                {r.language}
                              </span>
                            )}
                            {r.tier && (
                              <span
                                className={`rounded-full border px-2 py-0.5 font-body text-[11px] font-medium ${tierBadge[r.tier] || "border-border bg-muted text-muted-foreground"}`}
                              >
                                {r.tier}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-body text-xs font-semibold ${levelColors[displayLevel(r)] || "bg-muted"}`}
                          >
                            {levelEmoji[displayLevel(r)]} {displayLevel(r)}
                          </span>
                          <p className="mt-1 font-body text-xs text-muted-foreground">
                            {t("profile.score")} {r.score}
                          </p>
                        </div>
                      </div>
                      {r.feedback && (
                        <p className="line-clamp-3 rounded-xl bg-secondary px-3 py-2 font-body text-xs leading-relaxed text-muted-foreground">
                          {r.feedback}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{t("profile.settingsTitle")}</DialogTitle>
            <DialogDescription>{t("profile.settingsDesc")}</DialogDescription>
          </DialogHeader>

          <Tabs value={settingsTab} onValueChange={(v) => setSettingsTab(v as "profile" | "security")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">{t("profile.tabProfile")}</TabsTrigger>
              <TabsTrigger value="security">{t("profile.tabSecurity")}</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fn">{t("profile.firstName")}</Label>
                  <Input id="fn" className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">{t("profile.lastName")}</Label>
                  <Input id="ln" className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("profile.careerStage")}</Label>
                <Select value={role || "__none__"} onValueChange={(v) => setRole(v === "__none__" ? "" : v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder={t("profile.selectLevel")} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((o) => (
                      <SelectItem key={o.value || "none"} value={o.value || "__none__"}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">{t("profile.bio")}</Label>
                <Textarea
                  id="bio"
                  className={`min-h-[88px] ${inputCls} resize-y`}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("profile.bioPh")}
                />
                <p className="text-right text-[11px] text-muted-foreground">{bio.length}/500</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="loc">{t("profile.labelLocation")}</Label>
                  <Input id="loc" className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ph">{t("profile.labelPhone")}</Label>
                  <Input id="ph" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ey">{t("profile.yearsExp")}</Label>
                <Input
                  id="ey"
                  type="number"
                  min={0}
                  max={80}
                  className={inputCls}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gh">{t("profile.github")}</Label>
                  <Input id="gh" className={inputCls} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="li">{t("profile.linkedin")}</Label>
                  <Input
                    id="li"
                    className={inputCls}
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tg">{t("profile.telegram")}</Label>
                  <Input
                    id="tg"
                    className={inputCls}
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder={t("profile.phTg")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rs">{t("profile.resumeLink")}</Label>
                  <Input id="rs" className={inputCls} value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <Label className="text-base">{t("profile.photoTitle")}</Label>
                <p className="mt-1 text-xs text-muted-foreground">{t("profile.photoHelp")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-background">
                    {(avatarPreview || profile?.avatar_url) && !clearAvatar ? (
                      <img
                        src={avatarPreview || profile?.avatar_url || ""}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-display text-lg text-muted-foreground">
                        {initials}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="max-w-xs text-xs"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        setAvatarFile(f || null);
                        setClearAvatar(false);
                      }}
                    />
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="clr"
                        checked={clearAvatar}
                        onCheckedChange={(c) => {
                          setClearAvatar(c === true);
                          if (c === true) setAvatarFile(null);
                        }}
                      />
                      <label htmlFor="clr" className="text-sm text-muted-foreground">
                        {t("profile.removePhoto")}
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="exturl">{t("profile.imageUrl")}</Label>
                  <Input
                    id="exturl"
                    className={inputCls}
                    value={avatarUrlExternal}
                    onChange={(e) => setAvatarUrlExternal(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4 space-y-6">
              <div className="rounded-xl border border-border p-4">
                <h4 className="font-display text-sm font-semibold text-foreground">{t("profile.changePassword")}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{t("profile.pwdNote")}</p>
                <div className="mt-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="op">{t("profile.currentPwd")}</Label>
                    <Input
                      id="op"
                      type="password"
                      autoComplete="current-password"
                      className={inputCls}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np">{t("profile.newPwd")}</Label>
                    <Input
                      id="np"
                      type="password"
                      autoComplete="new-password"
                      className={inputCls}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="np2">{t("profile.confirmPwd")}</Label>
                    <Input
                      id="np2"
                      type="password"
                      autoComplete="new-password"
                      className={inputCls}
                      value={newPassword2}
                      onChange={(e) => setNewPassword2(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    className="rounded-full"
                    disabled={pwdBusy || !oldPassword || !newPassword || newPassword !== newPassword2}
                    onClick={handleChangePassword}
                  >
                    {pwdBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.updatePwd")}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <h4 className="flex items-center gap-2 font-display text-sm font-semibold text-destructive">
                  <Trash2 className="h-4 w-4" /> {t("profile.deleteTitle")}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">{t("profile.deleteHelp")}</p>
                <div className="mt-3 space-y-2">
                  <Label htmlFor="delpwd">{t("profile.confirmDeletePwd")}</Label>
                  <Input
                    id="delpwd"
                    type="password"
                    className={inputCls}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-3 rounded-full"
                  disabled={deleteBusy || !deletePassword}
                  onClick={handleDeleteAccount}
                >
                  {deleteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : t("profile.deleteBtn")}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {settingsTab === "profile" && (
            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setSettingsOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="button" className="rounded-full" disabled={saving} onClick={handleSaveProfile}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.saveChanges")}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AppFooter />
    </div>
  );
};

function getLevelNum(level: string): number {
  return { Beginner: 0, Junior: 1, Middle: 2, Senior: 3, beginner: 0, junior: 1, middle: 2, senior: 3 }[
    level
  ] ?? 0;
}

export default Profile;
