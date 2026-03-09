import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";

import {
  User, Mail, Calendar, Trophy, Code2, ChevronRight,
  Loader2, BookOpen, Settings, ArrowLeft, Camera
} from "lucide-react";

interface TestResult {
  id: number;
  role: string;
  result_level: string;
  score: number;
  feedback: string;
  created_at: string;
}

interface UserProfile {
  id: number;
  role: string;
  summary: string;
  skills: string[];
  spoken_languages: string[];
}

interface UserInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  location: string;
  github: string;
  linkedin: string;
  telegram: string;
  website: string;
}

const levelColors: Record<string, string> = {
  beginner: "bg-rose-50 text-rose-600 border-rose-200",
  junior: "bg-amber-50 text-amber-600 border-amber-200",
  middle: "bg-emerald-50 text-emerald-600 border-emerald-200",
  senior: "bg-violet-50 text-violet-600 border-violet-200",
};

const levelEmoji: Record<string, string> = {
  beginner: "🌱", junior: "✨", middle: "💪", senior: "👑",
};

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, testRes] = await Promise.all([
        apiClient.getProfile(),
        apiClient.getMyTests(),
      ]);
      
      setUserInfo(profileRes.user);
      setUserProfile(profileRes);
      setResults(testRes);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingName(true);
    try {
      await apiClient.updateProfile(userProfile);
      setEditingName(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSavingName(false);
    }
  };

  const bestResults = results.reduce((acc, r) => {
    const key = r.role;
    if (!acc[key] || getLevelNum(r.result_level) > getLevelNum(acc[key].result_level)) acc[key] = r;
    return acc;
  }, {} as Record<string, TestResult>);

  const topLevel = results.length > 0
    ? results.reduce((best, r) => getLevelNum(r.result_level) > getLevelNum(best.result_level) ? r : best)
    : null;

  const initials = (userInfo?.first_name || userInfo?.email || "?")[0]?.toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero pt-14 pb-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-body text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-soft border-2 border-primary/20">
                <div className="w-full h-full gradient-primary flex items-center justify-center">
                  <span className="text-3xl text-white font-display font-bold">{initials}</span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    value={userProfile?.role || ""}
                    onChange={(e) => setUserProfile(prev => prev ? {...prev, role: e.target.value} : null)}
                    className="font-display text-2xl font-bold bg-background border border-primary/40 rounded-xl px-3 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleSaveProfile()}
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingName}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-medium"
                  >
                    {savingName ? <Loader2 size={14} className="animate-spin" /> : "Save"}
                  </button>
                  <button onClick={() => setEditingName(false)} className="px-3 py-1.5 border border-border rounded-lg text-sm font-body text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    {userInfo?.first_name || userInfo?.username || "Dev Girl"}
                  </h1>
                  <button onClick={() => setEditingName(true)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Settings size={15} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Mail size={13} />
                <span>{userInfo?.email}</span>
              </div>
              {topLevel && (
                <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-body font-semibold border ${levelColors[topLevel.result_level]}`}>
                  <span>{levelEmoji[topLevel.result_level]}</span>
                  Top Level: {topLevel.result_level} — {topLevel.role}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Stats */}
            <div className="space-y-4">
              {/* Account info */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <User size={15} className="text-primary" /> Account
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Mail size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-foreground truncate">{userInfo?.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-body">
                    <Calendar size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      Joined {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-body">
                    <BookOpen size={13} className="text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{results.length} test{results.length !== 1 ? "s" : ""} taken</span>
                  </div>
                </div>
              </div>

              {/* Best results summary */}
              {Object.keys(bestResults).length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <h3 className="font-display text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Trophy size={15} className="text-primary" /> Best Levels
                  </h3>
                  <div className="space-y-2">
                    {Object.values(bestResults).map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Code2 size={12} className="text-muted-foreground shrink-0" />
                          <span className="text-xs font-body text-foreground truncate">
                            {r.role}
                          </span>
                        </div>
                        <span className={`shrink-0 text-[11px] font-body font-semibold px-2 py-0.5 rounded-full border ${levelColors[r.result_level]}`}>
                          {levelEmoji[r.result_level]} {r.result_level}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <Link
                to="/test"
                className="flex items-center justify-between p-4 gradient-primary rounded-2xl group"
              >
                <div>
                  <p className="font-display text-sm font-bold text-white">Take a Skill Test</p>
                  <p className="text-white/70 text-xs font-body">Junior → Middle → Senior</p>
                </div>
                <ChevronRight size={18} className="text-white/70 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Right: Full test history */}
            <div className="lg:col-span-2">
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy size={16} className="text-primary" /> Test History
              </h3>

              {results.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-10 text-center">
                  <div className="w-14 h-14 rounded-3xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                    <BookOpen size={22} className="text-muted-foreground" />
                  </div>
                  <p className="font-display text-base font-semibold text-foreground mb-1">No tests yet</p>
                  <p className="text-sm font-body text-muted-foreground mb-4">Take your first skill test to see your results here.</p>
                  <Link to="/test" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-body font-semibold hover:bg-primary/90 transition-colors">
                    Start a test <ChevronRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((r) => (
                    <div key={r.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/25 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-display text-sm font-bold text-foreground">{r.role}</span>
                          </div>
                          <p className="text-xs font-body text-muted-foreground mt-1">
                            {new Date(r.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body font-semibold border ${levelColors[r.result_level]}`}>
                            {levelEmoji[r.result_level]} {r.result_level}
                          </span>
                          <p className="text-xs font-body text-muted-foreground mt-1">Score: {r.score}</p>
                        </div>
                      </div>
                      {r.feedback && (
                        <p className="text-xs font-body text-muted-foreground leading-relaxed bg-secondary rounded-xl px-3 py-2 line-clamp-2">
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
          <p className="font-display text-base font-bold text-foreground mb-1">Dev<span className="text-gradient">Girlzz</span></p>
          <p className="text-xs font-body text-muted-foreground">Built for every IT woman 💜</p>
        </div>
      </footer>
    </div>
  );
};

function getLevelNum(level: string): number {
  return { beginner: 0, junior: 1, middle: 2, senior: 3 }[level] ?? 0;
}

export default Profile;
