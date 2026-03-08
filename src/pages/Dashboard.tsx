import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Calendar, MapPin, RefreshCw, TrendingUp, Zap } from "lucide-react";
import { firecrawlApi } from "@/lib/api/firecrawl";
import AppNav from "@/components/AppNav";

import { useAuth } from "@/hooks/useAuth";

interface NewsItem {
  title: string;
  url: string;
  description?: string;
  publishedDate?: string;
  source?: string;
}

interface EventItem {
  title: string;
  url: string;
  description?: string;
  date?: string;
  location?: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [newsError, setNewsError] = useState("");
  const [eventsError, setEventsError] = useState("");

  const fetchNews = async () => {
    setLoadingNews(true);
    setNewsError("");
    try {
      const res = await firecrawlApi.search(
        "women in tech IT news 2025 diversity STEM girls coding",
        { limit: 8, tbs: "qdr:m" }
      );
      if (res.success && res.data?.results) {
        setNews(
          res.data.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            description: r.description,
            publishedDate: r.publishedDate,
            source: r.source || new URL(r.url).hostname.replace("www.", ""),
          }))
        );
      } else {
        setNewsError("Could not load news at this time.");
      }
    } catch {
      setNewsError("Could not load news at this time.");
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    setEventsError("");
    try {
      const res = await firecrawlApi.search(
        "women in tech conference meetup event 2025 IT girl speaker schedule",
        { limit: 6, tbs: "qdr:m" }
      );
      if (res.success && res.data?.results) {
        setEvents(
          res.data.results.map((r: any) => ({
            title: r.title,
            url: r.url,
            description: r.description,
            date: r.publishedDate,
            location: "Online / Hybrid",
          }))
        );
      } else {
        setEventsError("Could not load events at this time.");
      }
    } catch {
      setEventsError("Could not load events at this time.");
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchEvents();
  }, []);

  const firstName = user?.email?.split("@")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "there";

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
              <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">Live Dashboard</span>
            </div>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            {user ? (
              <>Welcome back, <span className="text-gradient">{firstName}</span> 👋</>
            ) : (
              <>Women in Tech <span className="text-gradient">Hub</span></>
            )}
          </h1>
          <p className="font-body text-muted-foreground max-w-lg text-lg">
            Latest news, upcoming meetups, and conferences featuring amazing women in the industry.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { icon: TrendingUp, label: "Tech News", value: "Daily updates", color: "text-primary" },
              { icon: Calendar, label: "Events", value: "Global meetups", color: "text-primary" },
              { icon: Zap, label: "Resources", value: "Curated tools", color: "text-primary" },
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
                <h2 className="font-display text-lg font-bold text-foreground">Latest News</h2>
                <p className="text-xs font-body text-muted-foreground">Women in tech worldwide</p>
              </div>
            </div>
            <button
              onClick={fetchNews}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-secondary"
            >
              <RefreshCw size={12} />
              Refresh
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
                <h2 className="font-display text-lg font-bold text-foreground">Events & Meetups</h2>
                <p className="text-xs font-body text-muted-foreground">Connect with your community</p>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              className="flex items-center gap-1.5 text-xs font-body font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-secondary"
            >
              <RefreshCw size={12} />
              Refresh
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

          {!loadingEvents && !eventsError && (
            <div className="space-y-3">
              {events.map((event, i) => (
                <a
                  key={i}
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card border border-border rounded-2xl p-4 hover:border-primary/40 hover:shadow-card transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-body font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                      {event.title}
                    </h3>
                    <ExternalLink size={13} className="text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                  </div>
                  {event.description && (
                    <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-body text-muted-foreground">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary">
                      <MapPin size={10} />
                      {event.location}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Dashboard;
