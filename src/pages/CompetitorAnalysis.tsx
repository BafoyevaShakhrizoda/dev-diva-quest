import { useState, useRef } from "react";
import { Search, Brain, Newspaper, Package, Shield, Target, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import agentLogo from "@/assets/competitor-agent-logo.png";

interface CompanyOverview {
  founded: string | null;
  headquarters: string | null;
  employees: string | null;
  funding: string | null;
  valuation: string | null;
  description: string;
}

interface NewsItem {
  headline: string;
  detail: string;
}

interface Product {
  name: string;
  description: string;
}

interface Report {
  companyName: string;
  summary: string;
  overview: CompanyOverview;
  recentNews: NewsItem[];
  products: Product[];
  strengths: string[];
  weaknesses: string[];
  marketPosition: string;
  competitors: string[];
  parseError?: boolean;
  raw?: string;
}

interface Step {
  label: string;
  progress: number;
  done: boolean;
}

const CompetitorAnalysis = () => {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const analyze = async () => {
    if (!company.trim()) return;
    setLoading(true);
    setReport(null);
    setError(null);
    setSteps([]);

    abortRef.current = new AbortController();

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/competitor-analysis`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ company: company.trim() }),
        signal: abortRef.current.signal,
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (eventType === 'step') {
              setSteps(prev => {
                const existing = prev.map(s => ({ ...s, done: true }));
                return [...existing, { label: data.step, progress: data.progress, done: data.progress === 100 }];
              });
            } else if (eventType === 'report') {
              setReport(data);
            } else if (eventType === 'error') {
              setError(data.message);
            }
          }
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error && e.name !== 'AbortError') {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const overviewItems = report?.overview ? [
    { label: "Founded", value: report.overview.founded },
    { label: "HQ", value: report.overview.headquarters },
    { label: "Employees", value: report.overview.employees },
    { label: "Funding", value: report.overview.funding },
    { label: "Valuation", value: report.overview.valuation },
  ].filter(i => i.value) : [];

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24" style={{ background: "linear-gradient(135deg, hsl(265 84% 54%) 0%, hsl(220 80% 40%) 50%, hsl(200 90% 35%) 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        <div className="relative container mx-auto px-4 text-center">
          <img src={agentLogo} alt="Agent Logo" width={64} height={64} className="mx-auto mb-6" />

          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
            <Sparkles size={12} className="text-white" />
            <span className="text-xs font-body font-medium text-white tracking-wider uppercase">AI Competitor Agent</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Competitor Intel
            <br />
            <span className="text-white/80">in 30 seconds</span>
          </h1>

          <p className="font-body text-lg text-white/70 max-w-lg mx-auto mb-10">
            Type a company name. Our AI agent autonomously searches, analyzes, and delivers a structured competitive intelligence report.
          </p>

          {/* Search Input */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Enter a company name... e.g. Notion"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loading && analyze()}
              className="w-full pl-11 pr-28 py-4 bg-white border-0 rounded-2xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 shadow-2xl"
              disabled={loading}
            />
            <button
              onClick={analyze}
              disabled={loading || !company.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-body font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
              {loading ? "Working..." : "Analyze"}
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Steps */}
        {steps.length > 0 && (
          <div className="mb-10 bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Agent Progress</h3>
            <div className="space-y-3">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 size={18} className="text-primary shrink-0" />
                  ) : (
                    <Loader2 size={18} className="text-primary animate-spin shrink-0" />
                  )}
                  <span className={`font-body text-sm ${step.done ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
            {loading && (
              <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${steps[steps.length - 1]?.progress || 0}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-8 bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
            <p className="font-body text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Report */}
        {report && !report.parseError && (
          <div className="space-y-6 animate-fade-up">
            {/* Executive Summary */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-2xl font-bold text-foreground mb-1">{report.companyName}</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{report.summary}</p>
            </div>

            {/* Overview Grid */}
            {overviewItems.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={18} className="text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Company Overview</h3>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-4">{report.overview.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {overviewItems.map(item => (
                    <div key={item.label} className="bg-secondary/50 rounded-xl p-3">
                      <div className="text-xs font-body text-muted-foreground uppercase tracking-wide">{item.label}</div>
                      <div className="font-body text-sm font-semibold text-foreground mt-0.5">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent News */}
            {report.recentNews?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper size={18} className="text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Recent News & Funding</h3>
                </div>
                <div className="space-y-3">
                  {report.recentNews.map((n, i) => (
                    <div key={i} className="border-l-2 border-primary/30 pl-4">
                      <div className="font-body text-sm font-semibold text-foreground">{n.headline}</div>
                      <div className="font-body text-xs text-muted-foreground mt-0.5">{n.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products */}
            {report.products?.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={18} className="text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Key Products & Features</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {report.products.map((p, i) => (
                    <div key={i} className="bg-secondary/50 rounded-xl p-4">
                      <div className="font-body text-sm font-semibold text-foreground">{p.name}</div>
                      <div className="font-body text-xs text-muted-foreground mt-1">{p.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              {report.strengths?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={18} className="text-green-600" />
                    <h3 className="font-display text-lg font-bold text-foreground">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.strengths.map((s, i) => (
                      <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {report.weaknesses?.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={18} className="text-orange-500" />
                    <h3 className="font-display text-lg font-bold text-foreground">Weaknesses</h3>
                  </div>
                  <ul className="space-y-2">
                    {report.weaknesses.map((w, i) => (
                      <li key={i} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Market Position */}
            {report.marketPosition && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-primary" />
                  <h3 className="font-display text-lg font-bold text-foreground">Market Position</h3>
                </div>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{report.marketPosition}</p>
                {report.competitors?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="font-body text-xs text-muted-foreground font-medium">Competitors:</span>
                    {report.competitors.map((c, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-secondary text-xs font-body text-secondary-foreground">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Raw fallback */}
        {report?.parseError && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold text-foreground mb-3">Analysis Result</h3>
            <pre className="font-body text-sm text-muted-foreground whitespace-pre-wrap">{report.raw}</pre>
          </div>
        )}
      </section>

      <AppFooter />
    </div>
  );
};

export default CompetitorAnalysis;
