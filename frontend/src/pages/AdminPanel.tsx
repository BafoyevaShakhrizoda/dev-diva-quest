import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  ExternalLink,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Pencil,
  Shield,
  Users,
} from "lucide-react";
import AdminContentSection from "@/components/admin/AdminContentSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  apiClient,
  getStoredAdminToken,
  getStoredAdminUser,
  type AdminCapability,
  type AdminStats,
  type AdminUser,
} from "@/integrations/api/client";
import { getDjangoOrigin } from "@/lib/djangoOrigin";
import { useI18n } from "@/i18n/I18nProvider";

const AdminPanel = () => {
  const { t } = useI18n();
  const [user, setUser] = useState<AdminUser | null>(() => getStoredAdminUser());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [capabilities, setCapabilities] = useState<AdminCapability[]>([]);
  const [role, setRole] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState("");

  const djangoAdminUrl = useMemo(() => {
    const origin = getDjangoOrigin();
    return origin ? `${origin}/django-admin/` : "";
  }, []);

  const loadDashboard = useCallback(async () => {
    if (!getStoredAdminToken()) return;
    setLoadingData(true);
    setDataError("");
    try {
      const [statsRes, permRes] = await Promise.all([
        apiClient.adminStats(),
        apiClient.adminPermissions(),
      ]);
      setStats(statsRes);
      setCapabilities(permRes.capabilities);
      setRole(permRes.role);
    } catch (e) {
      setDataError(e instanceof Error ? e.message : t("admin.loadFail"));
      if ((e as { status?: number }).status === 401 || (e as { status?: number }).status === 403) {
        setUser(null);
      }
    } finally {
      setLoadingData(false);
    }
  }, [t]);

  useEffect(() => {
    if (user && getStoredAdminToken()) {
      loadDashboard();
    }
  }, [user, loadDashboard]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await apiClient.adminLogin(username.trim(), password);
      if (res.user) {
        setUser(res.user);
        setPassword("");
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : t("admin.loginFail"));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await apiClient.adminLogout();
    setUser(null);
    setStats(null);
    setCapabilities([]);
    setRole("");
  };

  if (!user || !getStoredAdminToken()) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-secondary/40 to-background">
        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <Card className="w-full max-w-md border-border shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-display text-xl">{t("admin.panelTitle")}</CardTitle>
              <CardDescription>{t("admin.loginSub")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-user">{t("admin.username")}</Label>
                  <Input
                    id="admin-user"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-pass">{t("admin.password")}</Label>
                  <Input
                    id="admin-pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                {loginError ? (
                  <p className="text-sm text-destructive">{loginError}</p>
                ) : null}
                <Button type="submit" className="w-full" disabled={loggingIn}>
                  {loggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("admin.signingIn")}
                    </>
                  ) : (
                    t("admin.signIn")
                  )}
                </Button>
              </form>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">{t("common.note")}</span>{" "}
                {t("admin.staffNote")}
              </p>
              <Link
                to="/dashboard"
                className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {t("admin.backSite")}
              </Link>
            </CardContent>
          </Card>
        </main>
        <AppFooter />
      </div>
    );
  }

  const statCards = stats
    ? [
        {
          label: t("admin.statUsers"),
          value: stats.users.total,
          sub: t("admin.statUsersSub", { verified: stats.users.verified, new: stats.users.new_this_week }),
          icon: Users,
        },
        {
          label: t("admin.statJobs"),
          value: stats.jobs.active,
          sub: t("admin.statJobsSub", {
            total: stats.jobs.total,
            apps: stats.jobs.applications,
            pending: stats.jobs.applications_pending,
          }),
          icon: Briefcase,
        },
        {
          label: t("admin.statTests"),
          value: stats.skills.tests_total,
          sub: t("admin.statTestsSub", {
            week: stats.skills.tests_this_week,
            questions: stats.skills.questions,
          }),
          icon: BarChart3,
        },
        {
          label: t("admin.statCvEvents"),
          value: stats.cv.total,
          sub: t("admin.statCvEventsSub", {
            templates: stats.cv.active_templates,
            events: stats.events.active,
          }),
          icon: FileText,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-wider text-primary">
              {t("admin.badge")}
            </p>
            <h1 className="font-display text-xl font-bold text-foreground">{t("admin.panelTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("admin.signedInAs")} <span className="font-medium text-foreground">{user.username}</span>
              {role ? ` · ${role}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {djangoAdminUrl ? (
              <Button variant="outline" size="sm" asChild>
                <a href={djangoAdminUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t("admin.openDjango")}
                </a>
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => loadDashboard()} disabled={loadingData}>
              {loadingData ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.refresh")}
            </Button>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t("admin.signOut")}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        {dataError ? (
          <p className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {dataError}
          </p>
        ) : null}

        {loadingData && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-8 flex h-auto flex-wrap gap-1">
              <TabsTrigger value="content" className="gap-1.5">
                <Pencil className="h-4 w-4" />
                {t("admin.tabContent")}
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="gap-1.5">
                <LayoutDashboard className="h-4 w-4" />
                {t("admin.tabMonitoring")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0">
              <AdminContentSection />
            </TabsContent>

            <TabsContent value="monitoring" className="mt-0">
            <section>
              <h2 className="font-display text-lg font-semibold text-foreground">{t("admin.statsTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("admin.statsSub")}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map(({ label, value, sub, icon: Icon }) => (
                  <Card key={label}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                      <Icon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <p className="font-display text-3xl font-bold text-foreground">{value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {stats?.skills.by_role?.length ? (
              <section className="mt-10">
                <h3 className="font-display text-base font-semibold">{t("admin.topRoles")}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stats.skills.by_role.map((r) => (
                    <li
                      key={r.role}
                      className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium"
                    >
                      {r.role}: {r.count}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-12">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("admin.rightsTitle")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("admin.rightsSub")}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {capabilities.map((cap) => (
                  <Card key={cap.id} className={cap.access === "granted" ? "border-primary/20" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{cap.title}</CardTitle>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            cap.access === "granted"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {cap.access === "granted" ? t("admin.accessGranted") : t("admin.accessLimited")}
                        </span>
                      </div>
                      {cap.django_section ? (
                        <CardDescription>{cap.django_section}</CardDescription>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">{cap.description}</p>
                      {cap.note ? (
                        <p className="mt-2 text-xs text-muted-foreground">{cap.note}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            </TabsContent>
          </Tabs>
        )}

        <Link
          to="/dashboard"
          className="mt-12 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t("admin.backSite")}
        </Link>
      </main>
      <AppFooter />
    </div>
  );
};

export default AdminPanel;
