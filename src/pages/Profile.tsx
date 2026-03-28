import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";

import {
  User,
  Mail,
  Calendar,
  Trophy,
  Code2,
  ChevronRight,
  Loader2,
  BookOpen,
  Settings,
  ArrowLeft,
} from "lucide-react";

interface DjangoProfile {
  user: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    created_at?: string;
  };
  avatar_url?: string | null;
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
  Beginner: "bg-rose-50 text-rose-600 border-rose-200",
  Junior: "bg-amber-50 text-amber-600 border-amber-200",
  Middle: "bg-emerald-50 text-emerald-600 border-emerald-200",
  Senior: "bg-violet-50 text-violet-600 border-violet-200",
  beginner: "bg-rose-50 text-rose-600 border-rose-200",
  junior: "bg-amber-50 text-amber-600 border-amber-200",
  middle: "bg-emerald-50 text-emerald-600 border-emerald-200",
  senior: "bg-violet-50 text-violet-600 border-violet-200",
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
  junior: "bg-amber-50 text-amber-600 border-amber-200",
  middle: "bg-emerald-50 text-emerald-600 border-emerald-200",
  senior: "bg-violet-50 text-violet-600 border-violet-200",
};

function displayLevel(r: SkillRow): string {
  return r.level || (r.result_level ? r.result_level.replace(/^./, (c) => c.toUpperCase()) : "");
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [results, setResults] = useState<SkillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DjangoProfile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
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
  };

  const displayName =
    profile?.user?.first_name || profile?.user?.last_name
      ? `${profile.user.first_name || ""} ${profile.user.last_name || ""}`.trim()
      : user?.email?.split("@")[0] || "Dev Girl";

  const bestResults = results.reduce((acc, r) => {
    const key = `${r.role}${r.language ? `-${r.language}` : ""}`;
    const lv = displayLevel(r);
    if (!acc[key] || getLevelNum(lv) > getLevelNum(displayLevel(acc[key]))) acc[key] = r;
    return acc;
  }, {} as Record<string, SkillRow>);

  const topLevel =
    results.length > 0
      ? results.reduce((best, r) =>
          getLevelNum(displayLevel(r)) > getLevelNum(displayLevel(best)) ? r : best
        )
      : null;

  const initials = (displayName || user?.email || "?")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <section className="relative overflow-hidden gradient-hero pt-14 pb-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 relative z-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-soft border-2 border-primary/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full gradient-primary flex items-center justify-center">
                    <span className="text-3xl text-white font-display font-bold">{initials}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
                {displayName}
              </h1>
              <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Mail size={13} />
                <span>{user?.email}</span>
              </div>
              {topLevel && (
                <div
                  className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-body font-semibold border ${levelColors[displayLevel(topLevel)] || "bg-muted"}`}
                >
                  <span>{levelEmoji[displayLevel(topLevel)] || "✨"}</span>
                  Top level: {displayLevel(topLevel)} — {topLevel.role}
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-10 bg-background"
          style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }}
        />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <User size={15} className="text-primary" /> Account
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Mail size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Calendar size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Joined{" "}
                      {profile?.user?.created_at
                        ? new Date(profile.user.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-body">
                    <BookOpen size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {results.length} test{results.length !== 1 ? "s" : ""} saved
                    </span>
                  </div>
                </div>
              </div>

              {Object.keys(bestResults).length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Trophy size={15} className="text-primary" /> Best levels
                  </h3>
                  <div className="space-y-2">
                    {Object.values(bestResults).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Code2 size={12} className="text-muted-foreground shrink-0" />
                          <span className="text-xs font-body text-foreground truncate">
                            {r.role}
                            {r.language ? ` / ${r.language}` : ""}
                          </span>
                        </div>
                        <span
                          className={`shrink-0 text-[11px] font-body font-semibold px-2 py-0.5 rounded-full border ${levelColors[displayLevel(r)] || "bg-muted"}`}
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
                className="flex items-center justify-between p-4 gradient-primary rounded-2xl group"
              >
                <div>
                  <p className="font-display text-sm font-bold text-white">Take a skill test</p>
                  <p className="text-white/70 text-xs font-body">Junior → Middle → Senior</p>
                </div>
                <ChevronRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="lg:col-span-2">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-primary" /> Test history
              </h3>

              {results.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <BookOpen size={22} className="text-muted-foreground" />
                  </div>
                  <p className="font-display text-base font-semibold text-foreground mb-1">No tests yet</p>
                  <p className="text-sm font-body text-muted-foreground mb-4">
                    Complete a skill test while signed in to see results here.
                  </p>
                  <Link
                    to="/test"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-body font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Start a test <ChevronRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div
                      key={r.id}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-primary/25 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-foreground">{r.role}</span>
                            {r.language && (
                              <span className="text-xs font-body text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full">
                                {r.language}
                              </span>
                            )}
                            {r.tier && (
                              <span
                                className={`text-[11px] font-body font-medium px-2 py-0.5 rounded-full border ${tierBadge[r.tier] || "bg-muted text-muted-foreground border-border"}`}
                              >
                                {r.tier}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-body text-muted-foreground mt-1">
                            {new Date(r.created_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-semibold border ${levelColors[displayLevel(r)] || "bg-muted"}`}
                          >
                            {levelEmoji[displayLevel(r)]} {displayLevel(r)}
                          </span>
                          <p className="text-xs font-body text-muted-foreground mt-1">Score: {r.score}</p>
                        </div>
                      </div>
                      {r.feedback && (
                        <p className="text-xs font-body text-muted-foreground leading-relaxed bg-secondary rounded-xl px-3 py-2 line-clamp-3">
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

      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-base font-bold text-foreground mb-1">
            Dev<span className="text-gradient">Girlzz</span>
          </p>
          <p className="text-xs font-body text-muted-foreground">Built for every IT woman</p>
        </div>
      </footer>
    </div>
  );
};

function getLevelNum(level: string): number {
  return { Beginner: 0, Junior: 1, Middle: 2, Senior: 3, beginner: 0, junior: 1, middle: 2, senior: 3 }[
    level
  ] ?? 0;
}

export default Profile;
