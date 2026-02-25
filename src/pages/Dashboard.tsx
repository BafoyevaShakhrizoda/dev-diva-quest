import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Calendar, MapPin, User, RefreshCw } from "lucide-react";
import { firecrawlApi } from "@/lib/api/firecrawl";
import AppNav from "@/components/AppNav";

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
  speaker?: string;
}

const Dashboard = () => {
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
            speaker: "",
            source: r.source || new URL(r.url).hostname.replace("www.", ""),
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

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Header */}
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">Live Dashboard</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Women in Tech ✦
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Latest news, upcoming meetups, and conferences featuring amazing women in the industry.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* News Section */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Newspaper size={18} className="text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">Latest News</h2>
            </div>
            <button
              onClick={fetchNews}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {loadingNews && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full mb-1" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {newsError && (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground font-body">
              <p className="text-2xl mb-2">✦</p>
              <p>{newsError}</p>
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
                  className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-body font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <ExternalLink size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  {item.description && (
                    <p className="font-body text-xs text-muted-foreground mt-1.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {item.source && (
                      <span className="text-xs font-body text-primary bg-primary/10 rounded-full px-2 py-0.5">
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
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">Events & Meetups</h2>
            </div>
            <button
              onClick={fetchEvents}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw size={12} />
              Refresh
            </button>
          </div>

          {loadingEvents && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2 mb-1" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              ))}
            </div>
          )}

          {eventsError && (
            <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground font-body">
              <p className="text-2xl mb-2">✦</p>
              <p>{eventsError}</p>
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
                  className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-body font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <ExternalLink size={12} className="text-muted-foreground shrink-0 mt-0.5" />
                  </div>
                  {event.description && (
                    <p className="font-body text-xs text-muted-foreground line-clamp-2 mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-body text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin size={10} />
                      {event.location}
                    </span>
                    {event.speaker && (
                      <span className="flex items-center gap-1">
                        <User size={10} />
                        {event.speaker}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 mt-4">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg text-foreground mb-1">Built for every IT girl 🌸</p>
          <p className="text-xs font-body text-muted-foreground">Your journey in tech starts with a single click</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
