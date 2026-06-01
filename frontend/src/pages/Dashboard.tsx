import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Calendar, MapPin, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { firecrawlApi } from "@/lib/api/firecrawl";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiClient, type PlatformEventRow } from "@/integrations/api/client";
import { formatUserDisplayName } from "@/lib/userDisplayName";
import { useI18n } from "@/i18n/I18nProvider";

interface NewsItem {
  title: string;
  url: string;
  description?: string;
  publishedDate?: string;
  source?: string;
}

type FirecrawlSearchHit = {
  title?: string;
  url?: string;
  description?: string;
  publishedDate?: string;
  source?: string;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<PlatformEventRow[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [eventsError, setEventsError] = useState("");
  const platformNews: NewsItem = {
    title: t("dashboard.platformNewsTitle"),
    url: "https://devgirlzz.com.uz",
    description: t("dashboard.platformNewsDesc"),
    source: t("dashboard.platformNewsSource"),
  };

  const fetchNews = async () => {
    setLoadingNews(true);
    setNewsError("");
    try {
      const res = await firecrawlApi.search(
        "Uzbekistan women in tech latest news girls STEM IT Uzbekistan",
        { limit: 8, tbs: "qdr:m" }
      );
      const results = res.data && typeof res.data === "object" && "results" in res.data
        ? (res.data as { results?: FirecrawlSearchHit[] }).results
        : undefined;
      if (res.success && results?.length) {
        setNews([
          platformNews,
          ...results.map((r) => ({
            title: String(r.title ?? ""),
            url: String(r.url ?? ""),
            description: r.description,
            publishedDate: r.publishedDate,
            source:
              r.source ||
              (r.url ? new URL(r.url).hostname.replace("www.", "") : ""),
          })),
        ]);
      } else {
        setNews([platformNews]);
      }
    } catch {
      setNews([platformNews]);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const rows = await apiClient.getEvents();
      setEvents(rows);
      if (rows.length === 0) setEventsError(t("dashboard.eventsEmpty"));
      else setEventsError("");
    } catch {
      setEventsError(t("dashboard.eventsFail"));
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchEvents();
  }, []);

  const greetingName = formatUserDisplayName(user ?? null);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero pt-16 pb-20">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/6 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">{t("dashboard.liveBadge")}</span>
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            {user ? (
              <>
                {t("dashboard.welcomeBack")} <span className="text-gradient">{greetingName}</span>{" "}
                {t("dashboard.wave")}
              </>
            ) : (
              <>
                {t("dashboard.guestTitle")} <span className="text-gradient">{t("dashboard.guestAccent")}</span>
              </>
            )}
          </h1>
          <p className="font-body text-muted-foreground max-w-lg text-lg">
            {t("dashboard.heroSub")}
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              {
                icon: TrendingUp,
                label: t("dashboard.statNews"),
                value: t("dashboard.statNewsVal"),
                color: "text-primary",
              },
              {
                icon: Calendar,
                label: t("dashboard.statEvents"),
                value: t("dashboard.statEventsVal"),
                color: "text-primary",
              },
              {
                icon: Zap,
                label: t("dashboard.statRes"),
                value: t("dashboard.statResVal"),
                color: "text-primary",
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-background border border-border rounded-2xl px-4 py-3 shadow-card">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon size={16} className={item.color} />
                </div>
                <div>
                  <div className="text-xs font-body text-muted-foreground">{item.label}</div>
                  <div className="text-sm font-body font-semibold text-foreground">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* News Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Newspaper size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">{t("dashboard.newsTitle")}</h2>
                <p className="text-xs font-body text-muted-foreground">{t("dashboard.newsSub")}</p>
              </div>
            </div>
            <button
              onClick={fetchNews}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-secondary"
            >
              <RefreshCw size={12} />
              {t("common.refresh")}
            </button>
          </div>

          {loadingNews && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded-lg w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded-lg w-full mb-1" />
                  <div className="h-3 bg-muted rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          )}

          {newsError && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground font-body">
              <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center">
                <Newspaper size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm">{newsError}</p>
            </div>
          )}

          {!loadingNews && !newsError && (
            <div className="space-y-3">
              {news.map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-card transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-body font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {item.title}
                    </h3>
                    <ExternalLink size={13} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                  </div>
                  {item.description && (
                    <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    {item.source && (
                      <span className="text-xs font-body font-medium px-2.5 py-1 rounded-full bg-primary/8 text-primary border border-primary/15">
                        {item.source}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">{t("dashboard.eventsTitle")}</h2>
                <p className="text-xs font-body text-muted-foreground">{t("dashboard.eventsSub")}</p>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-secondary"
            >
              <RefreshCw size={12} />
              {t("common.refresh")}
            </button>
          </div>

          {loadingEvents && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded-lg w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded-lg w-1/2 mb-1" />
                  <div className="h-3 bg-muted rounded-lg w-2/3" />
                </div>
              ))}
            </div>
          )}

          {eventsError && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground font-body">
              <div className="w-12 h-12 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center">
                <Calendar size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm">{eventsError}</p>
            </div>
          )}

          {!loadingEvents && !eventsError && events.length > 0 && (
            <div className="space-y-3">
              {events.map((event) => {
                const href = event.external_url?.trim() || "#";
                const inner = (
                  <>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 font-body text-sm font-semibold leading-relaxed text-foreground transition-colors group-hover:text-primary">
                        {event.title}
                      </h3>
                      {event.external_url ? (
                        <ExternalLink
                          size={13}
                          className="mt-0.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                        />
                      ) : null}
                    </div>
                    {event.summary ? (
                      <p className="mb-3 line-clamp-2 font-body text-xs leading-relaxed text-muted-foreground">
                        {event.summary}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2 font-body text-xs text-muted-foreground">
                      {event.location ? (
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1">
                          <MapPin size={10} />
                          {event.location}
                        </span>
                      ) : null}
                      {event.starts_at ? (
                        <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-foreground/80">
                          {new Date(event.starts_at + "T12:00:00").toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      ) : null}
                    </div>
                  </>
                );
                return event.external_url ? (
                  <a
                    key={event.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-card"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/25"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Dashboard;
