import { useCallback, useEffect, useState } from "react";
import { Calendar, Loader2, Newspaper, Plus, Save, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  apiClient,
  type AdminCommunityRow,
  type AdminEventRow,
  type AdminNewsRow,
} from "@/integrations/api/client";
import { useI18n } from "@/i18n/I18nProvider";

type ContentKind = "events" | "news" | "communities";

const COMMUNITY_TYPES = ["telegram", "discord", "facebook", "linkedin", "website", "other"] as const;

const emptyEvent = (): Partial<AdminEventRow> => ({
  title: "",
  summary: "",
  external_url: "",
  location: "",
  starts_at: "",
  is_active: true,
  sort_order: 0,
});

const emptyNews = (): Partial<AdminNewsRow> => ({
  title: "",
  summary: "",
  external_url: "",
  source: "",
  published_at: "",
  is_active: true,
  sort_order: 0,
});

const emptyCommunity = (): Partial<AdminCommunityRow> => ({
  name: "",
  description: "",
  external_url: "",
  community_type: "telegram",
  is_active: true,
  sort_order: 0,
});

const AdminContentSection = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<ContentKind>("events");
  const [events, setEvents] = useState<AdminEventRow[]>([]);
  const [news, setNews] = useState<AdminNewsRow[]>([]);
  const [communities, setCommunities] = useState<AdminCommunityRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [communityForm, setCommunityForm] = useState(emptyCommunity);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ev, nw, cm] = await Promise.all([
        apiClient.adminListEvents(),
        apiClient.adminListNews(),
        apiClient.adminListCommunities(),
      ]);
      setEvents(ev);
      setNews(nw);
      setCommunities(cm);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.contentLoadFail"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const resetForms = () => {
    setEditingId(null);
    setEventForm(emptyEvent());
    setNewsForm(emptyNews());
    setCommunityForm(emptyCommunity());
  };

  const startNew = (kind: ContentKind) => {
    setEditingId("new");
    if (kind === "events") setEventForm(emptyEvent());
    if (kind === "news") setNewsForm(emptyNews());
    if (kind === "communities") setCommunityForm(emptyCommunity());
  };

  const startEditEvent = (row: AdminEventRow) => {
    setTab("events");
    setEditingId(row.id);
    setEventForm({
      ...row,
      starts_at: row.starts_at ?? "",
    });
  };

  const startEditNews = (row: AdminNewsRow) => {
    setTab("news");
    setEditingId(row.id);
    setNewsForm({
      ...row,
      published_at: row.published_at ?? "",
    });
  };

  const startEditCommunity = (row: AdminCommunityRow) => {
    setTab("communities");
    setEditingId(row.id);
    setCommunityForm({ ...row });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (tab === "events") {
        const payload = {
          ...eventForm,
          starts_at: eventForm.starts_at || null,
        };
        if (editingId === "new") await apiClient.adminCreateEvent(payload);
        else if (typeof editingId === "number") await apiClient.adminUpdateEvent(editingId, payload);
      } else if (tab === "news") {
        const payload = {
          ...newsForm,
          published_at: newsForm.published_at || null,
        };
        if (editingId === "new") await apiClient.adminCreateNews(payload);
        else if (typeof editingId === "number") await apiClient.adminUpdateNews(editingId, payload);
      } else if (tab === "communities") {
        if (editingId === "new") await apiClient.adminCreateCommunity(communityForm);
        else if (typeof editingId === "number")
          await apiClient.adminUpdateCommunity(editingId, communityForm);
      }
      resetForms();
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.contentSaveFail"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (kind: ContentKind, id: number) => {
    if (!window.confirm(t("admin.contentDeleteConfirm"))) return;
    setSaving(true);
    setError("");
    try {
      if (kind === "events") await apiClient.adminDeleteEvent(id);
      if (kind === "news") await apiClient.adminDeleteNews(id);
      if (kind === "communities") await apiClient.adminDeleteCommunity(id);
      if (editingId === id) resetForms();
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("admin.contentDeleteFail"));
    } finally {
      setSaving(false);
    }
  };

  const renderList = (
    kind: ContentKind,
    rows: { id: number; title?: string; name?: string; is_active: boolean }[],
    onEdit: (row: AdminEventRow | AdminNewsRow | AdminCommunityRow) => void,
  ) => (
    <ul className="space-y-2">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("admin.contentEmpty")}</p>
      ) : (
        rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {"title" in row && row.title ? row.title : "name" in row ? row.name : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {row.is_active ? t("admin.contentActive") : t("admin.contentInactive")}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(row as never)}>
                {t("admin.contentEdit")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleDelete(kind, row.id)}
                disabled={saving}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))
      )}
    </ul>
  );

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{t("admin.contentTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.contentSub")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => loadAll()} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("common.refresh")}
        </Button>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={(v) => { setTab(v as ContentKind); resetForms(); }}>
        <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
          <TabsTrigger value="events" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            {t("admin.tabEvents")}
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-1.5">
            <Newspaper className="h-4 w-4" />
            {t("admin.tabNews")}
          </TabsTrigger>
          <TabsTrigger value="communities" className="gap-1.5">
            <Users className="h-4 w-4" />
            {t("admin.tabCommunities")}
          </TabsTrigger>
        </TabsList>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">{t("admin.contentList")}</CardTitle>
                <CardDescription>{t("admin.contentListSub")}</CardDescription>
              </div>
              <Button type="button" size="sm" onClick={() => startNew(tab)}>
                <Plus className="mr-1 h-4 w-4" />
                {t("admin.contentAdd")}
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : tab === "events" ? (
                renderList("events", events, startEditEvent)
              ) : tab === "news" ? (
                renderList("news", news, startEditNews)
              ) : (
                renderList("communities", communities, startEditCommunity)
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {editingId === "new"
                  ? t("admin.contentNew")
                  : editingId
                    ? t("admin.contentEditItem")
                    : t("admin.contentPick")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingId === null ? (
                <p className="text-sm text-muted-foreground">{t("admin.contentPickHint")}</p>
              ) : (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                >
                  {tab === "events" && (
                    <>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldTitle")}</Label>
                        <Input
                          value={eventForm.title ?? ""}
                          onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldSummary")}</Label>
                        <Textarea
                          value={eventForm.summary ?? ""}
                          onChange={(e) => setEventForm((f) => ({ ...f, summary: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldUrl")}</Label>
                        <Input
                          type="url"
                          value={eventForm.external_url ?? ""}
                          onChange={(e) => setEventForm((f) => ({ ...f, external_url: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>{t("admin.fieldLocation")}</Label>
                          <Input
                            value={eventForm.location ?? ""}
                            onChange={(e) => setEventForm((f) => ({ ...f, location: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("admin.fieldDate")}</Label>
                          <Input
                            type="date"
                            value={eventForm.starts_at ?? ""}
                            onChange={(e) => setEventForm((f) => ({ ...f, starts_at: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>{t("admin.fieldSort")}</Label>
                          <Input
                            type="number"
                            value={eventForm.sort_order ?? 0}
                            onChange={(e) =>
                              setEventForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <label className="flex items-center gap-2 pt-6 text-sm">
                          <input
                            type="checkbox"
                            checked={eventForm.is_active ?? true}
                            onChange={(e) => setEventForm((f) => ({ ...f, is_active: e.target.checked }))}
                          />
                          {t("admin.fieldActive")}
                        </label>
                      </div>
                    </>
                  )}

                  {tab === "news" && (
                    <>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldTitle")}</Label>
                        <Input
                          value={newsForm.title ?? ""}
                          onChange={(e) => setNewsForm((f) => ({ ...f, title: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldSummary")}</Label>
                        <Textarea
                          value={newsForm.summary ?? ""}
                          onChange={(e) => setNewsForm((f) => ({ ...f, summary: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldUrl")}</Label>
                        <Input
                          type="url"
                          value={newsForm.external_url ?? ""}
                          onChange={(e) => setNewsForm((f) => ({ ...f, external_url: e.target.value }))}
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>{t("admin.fieldSource")}</Label>
                          <Input
                            value={newsForm.source ?? ""}
                            onChange={(e) => setNewsForm((f) => ({ ...f, source: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>{t("admin.fieldDate")}</Label>
                          <Input
                            type="date"
                            value={newsForm.published_at ?? ""}
                            onChange={(e) => setNewsForm((f) => ({ ...f, published_at: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>{t("admin.fieldSort")}</Label>
                          <Input
                            type="number"
                            value={newsForm.sort_order ?? 0}
                            onChange={(e) =>
                              setNewsForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <label className="flex items-center gap-2 pt-6 text-sm">
                          <input
                            type="checkbox"
                            checked={newsForm.is_active ?? true}
                            onChange={(e) => setNewsForm((f) => ({ ...f, is_active: e.target.checked }))}
                          />
                          {t("admin.fieldActive")}
                        </label>
                      </div>
                    </>
                  )}

                  {tab === "communities" && (
                    <>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldName")}</Label>
                        <Input
                          value={communityForm.name ?? ""}
                          onChange={(e) => setCommunityForm((f) => ({ ...f, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldSummary")}</Label>
                        <Textarea
                          value={communityForm.description ?? ""}
                          onChange={(e) =>
                            setCommunityForm((f) => ({ ...f, description: e.target.value }))
                          }
                          rows={3}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>{t("admin.fieldUrl")}</Label>
                        <Input
                          type="url"
                          value={communityForm.external_url ?? ""}
                          onChange={(e) =>
                            setCommunityForm((f) => ({ ...f, external_url: e.target.value }))
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>{t("admin.fieldType")}</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={communityForm.community_type ?? "telegram"}
                            onChange={(e) =>
                              setCommunityForm((f) => ({ ...f, community_type: e.target.value }))
                            }
                          >
                            {COMMUNITY_TYPES.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label>{t("admin.fieldSort")}</Label>
                          <Input
                            type="number"
                            value={communityForm.sort_order ?? 0}
                            onChange={(e) =>
                              setCommunityForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                            }
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={communityForm.is_active ?? true}
                          onChange={(e) =>
                            setCommunityForm((f) => ({ ...f, is_active: e.target.checked }))
                          }
                        />
                        {t("admin.fieldActive")}
                      </label>
                    </>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {t("admin.contentSave")}
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetForms}>
                      {t("admin.contentCancel")}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </section>
  );
};

export default AdminContentSection;
