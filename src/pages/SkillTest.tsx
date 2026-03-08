import { useState } from "react";
import { careers } from "@/data/careers";
import { roleQuestionsMap, backendLanguageQuestionsMap, type Tier, type Level } from "@/data/skillQuestions";
import AppNav from "@/components/AppNav";

import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Circle, Loader2, ChevronRight } from "lucide-react";

const tierLevelCap: Record<Tier, Level[]> = {
  junior: ["Beginner", "Junior"],
  middle: ["Junior", "Middle"],
  senior: ["Middle", "Senior"],
};

const roleLanguages: Record<string, { id: string; label: string; emoji: string }[]> = {
  backend: [
    { id: "python", label: "Python", emoji: "🐍" },
    { id: "nodejs", label: "Node.js", emoji: "🟢" },
    { id: "php", label: "PHP", emoji: "🐘" },
    { id: "java", label: "Java", emoji: "☕" },
    { id: "csharp", label: "C#", emoji: "💜" },
    { id: "go", label: "Go", emoji: "🔵" },
    { id: "ruby", label: "Ruby", emoji: "💎" },
    { id: "rust", label: "Rust", emoji: "🦀" },
  ],
  frontend: [
    { id: "react", label: "React", emoji: "⚛️" },
    { id: "vue", label: "Vue.js", emoji: "💚" },
    { id: "angular", label: "Angular", emoji: "🔴" },
    { id: "vanilla", label: "Vanilla JS", emoji: "🍦" },
  ],
  mobile: [
    { id: "flutter", label: "Flutter/Dart", emoji: "💙" },
    { id: "reactnative", label: "React Native", emoji: "⚛️" },
    { id: "swift", label: "Swift (iOS)", emoji: "🍎" },
    { id: "kotlin", label: "Kotlin (Android)", emoji: "🤖" },
  ],
};

const tierInfo: Record<Tier, { label: string; emoji: string; description: string; color: string }> = {
  junior: { label: "Junior", emoji: "✨", description: "Foundational concepts & basic implementation", color: "text-amber-400 border-amber-400/30 bg-amber-400/10" },
  middle: { label: "Middle", emoji: "💪", description: "Intermediate patterns, tools & problem-solving", color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" },
  senior: { label: "Senior", emoji: "👑", description: "Advanced architecture, performance & system design", color: "text-violet-400 border-violet-400/30 bg-violet-400/10" },
};

const levelColors: Record<Level, string> = {
  Beginner: "text-rose-400",
  Junior: "text-amber-400",
  Middle: "text-emerald-400",
  Senior: "text-violet-400",
};

const levelEmoji: Record<Level, string> = {
  Beginner: "🌱",
  Junior: "✨",
  Middle: "💪",
  Senior: "👑",
};

const SkillTest = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ level: Level; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const availableLanguages = selectedRole ? (roleLanguages[selectedRole] || []) : [];
  const needsLanguagePick = availableLanguages.length > 0 && !selectedLanguage;

  const getQuestions = () => {
    if (!selectedRole || !selectedTier) return [];
    const langMap = selectedRole === "backend" && selectedLanguage
      ? backendLanguageQuestionsMap[selectedLanguage]
      : null;
    const map = langMap || roleQuestionsMap[selectedRole];
    return map?.[selectedTier] || [];
  };

  const roleQuestions = selectedRole && selectedTier && !needsLanguagePick ? getQuestions() : [];

  const handleAnswer = (qIndex: number, aIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: aIndex }));
  };

  const saveResult = async (level: Level, feedback: string, score: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const career = careers.find((c) => c.id === selectedRole);
    const langLabel = availableLanguages.find((l) => l.id === selectedLanguage)?.label;
    await supabase.from("skill_test_results").insert({
      user_id: user.id,
      role: career?.title || selectedRole || "",
      language: langLabel || null,
      tier: selectedTier || "",
      level,
      score,
      feedback,
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < roleQuestions.length) return;
    setLoading(true);
    const career = careers.find((c) => c.id === selectedRole);
    const langLabel = availableLanguages.find((l) => l.id === selectedLanguage)?.label;
    const correct = roleQuestions.filter((q, i) => answers[i] === q.correct).length;
    const pct = correct / roleQuestions.length;
    const scoreStr = `${correct}/${roleQuestions.length}`;

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-skill", {
        body: {
          role: langLabel ? `${career?.title} (${langLabel})` : career?.title || selectedRole,
          tier: selectedTier,
          questions: roleQuestions.map(q => ({ q: q.q, options: q.options })),
          answers,
          score: scoreStr,
        },
      });
      if (error) throw error;
      // Enforce tier cap client-side as well
      const allowed = selectedTier ? tierLevelCap[selectedTier] : null;
      let level: Level = data.level;
      if (allowed && !allowed.includes(level)) level = allowed[allowed.length - 1];
      setResult({ level, feedback: data.feedback });
      await saveResult(level, data.feedback, scoreStr);
    } catch {
      // Fallback evaluation capped to tier
      const allowed = selectedTier ? tierLevelCap[selectedTier] : (["Beginner", "Junior", "Middle", "Senior"] as Level[]);
      let level: Level = allowed[0];
      if (pct >= 0.7 && allowed.includes("Senior")) level = "Senior";
      else if (pct >= 0.7 && allowed.includes("Middle")) level = "Middle";
      else if (pct >= 0.7 && allowed.includes("Junior")) level = "Junior";
      else if (pct >= 0.4 && allowed.length > 1) level = allowed[1] as Level;
      else level = allowed[0] as Level;
      const feedback = `You answered ${correct} out of ${roleQuestions.length} correctly on the ${selectedTier} tier. ${pct >= 0.7 ? "Great work! You demonstrate solid knowledge at this level." : "Keep practicing — review the topics you found challenging."}`;
      setResult({ level, feedback });
      await saveResult(level, feedback, scoreStr);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const resetAll = () => { setSelectedRole(null); setSelectedLanguage(null); setSelectedTier(null); setAnswers({}); setSubmitted(false); setResult(null); };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">AI-Powered Evaluation</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">Skill Test ◉</h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Choose your role, stack, and difficulty level. Answer 10+ questions and get your professional level evaluation.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-2xl">

        {/* Step 1: Role */}
        {!selectedRole && (
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-5 text-center">Choose your role</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {careers.map((career) => (
                <button key={career.id} onClick={() => setSelectedRole(career.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-card transition-all duration-200 group">
                  <span className="text-2xl">{career.emoji}</span>
                  <span className="font-body text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight">{career.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Language */}
        {selectedRole && needsLanguagePick && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={resetAll} className="text-xs text-muted-foreground hover:text-foreground">← Change role</button>
              <span className="font-display text-lg font-semibold text-foreground">{careers.find(c => c.id === selectedRole)?.title}</span>
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2 text-center">Choose your primary stack</h2>
            <p className="text-xs text-muted-foreground text-center font-body mb-5">Questions will be tailored to your technology</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {availableLanguages.map((lang) => (
                <button key={lang.id} onClick={() => setSelectedLanguage(lang.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-card transition-all duration-200 group">
                  <span className="text-2xl">{lang.emoji}</span>
                  <span className="font-body text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Tier */}
        {selectedRole && !needsLanguagePick && !selectedTier && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => { if (availableLanguages.length > 0) setSelectedLanguage(null); else setSelectedRole(null); }}
                className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
              <span className="font-display text-lg font-semibold text-foreground">
                {careers.find(c => c.id === selectedRole)?.title}
                {selectedLanguage && <span className="text-primary ml-1 text-sm">— {availableLanguages.find(l => l.id === selectedLanguage)?.label}</span>}
              </span>
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-2 text-center">Choose your difficulty level</h2>
            <p className="text-xs text-muted-foreground text-center font-body mb-5">Each level has 10–12 questions designed for that experience tier</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(["junior", "middle", "senior"] as Tier[]).map((tier) => (
                <button key={tier} onClick={() => setSelectedTier(tier)}
                  className="flex flex-col items-start gap-3 p-5 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-card transition-all duration-200 text-left group">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-body font-medium ${tierInfo[tier].color}`}>
                    <span>{tierInfo[tier].emoji}</span>
                    {tierInfo[tier].label}
                  </div>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">{tierInfo[tier].description}</p>
                  <span className="text-xs text-primary font-body flex items-center gap-1 group-hover:gap-2 transition-all">
                    Start test <ChevronRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Quiz */}
        {selectedRole && !needsLanguagePick && selectedTier && !submitted && roleQuestions.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => { setSelectedTier(null); setAnswers({}); }} className="text-xs text-muted-foreground hover:text-foreground">← Change level</button>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-semibold text-foreground">
                  {careers.find(c => c.id === selectedRole)?.title}
                  {selectedLanguage && <span className="text-primary ml-1">— {availableLanguages.find(l => l.id === selectedLanguage)?.label}</span>}
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-body ${tierInfo[selectedTier].color}`}>
                  {tierInfo[selectedTier].emoji} {tierInfo[selectedTier].label}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {roleQuestions.map((q, qi) => (
                <div key={qi} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-body font-medium text-sm text-foreground mb-3">{qi + 1}. {q.q}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => handleAnswer(qi, oi)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-body transition-all duration-150 border ${
                          answers[qi] === oi
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}>
                        {answers[qi] === oi ? <CheckCircle size={14} className="shrink-0" /> : <Circle size={14} className="shrink-0" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground font-body mb-3">{Object.keys(answers).length} / {roleQuestions.length} answered</p>
              <button onClick={handleSubmit}
                disabled={Object.keys(answers).length < roleQuestions.length || loading}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-body font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-soft">
                {loading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />AI is evaluating...</span> : "Submit & Get Evaluated"}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {submitted && result && (
          <div className="text-center">
            <div className="bg-card border border-border rounded-2xl p-8 shadow-card">
              <div className="text-6xl mb-4">{levelEmoji[result.level]}</div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-1">
                You're a <span className={levelColors[result.level]}>{result.level}</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-1">
                {careers.find(c => c.id === selectedRole)?.title}
                {selectedLanguage && ` — ${availableLanguages.find(l => l.id === selectedLanguage)?.label}`}
              </p>
              <p className="font-body text-xs text-muted-foreground mb-5">
                {selectedTier && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs ${tierInfo[selectedTier].color}`}>{tierInfo[selectedTier].emoji} {tierInfo[selectedTier].label} tier</span>}
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                <p className="font-body text-sm text-foreground leading-relaxed">{result.feedback}</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={resetAll} className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-body text-sm hover:bg-primary/90 transition-colors">Test another role</button>
                <button onClick={() => { setSelectedTier(null); setAnswers({}); setSubmitted(false); setResult(null); }}
                  className="px-5 py-2 border border-border rounded-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Try different level</button>
                <button onClick={() => { setAnswers({}); setSubmitted(false); setResult(null); }}
                  className="px-5 py-2 border border-border rounded-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Retry</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-card py-10 mt-4">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="font-display text-lg font-bold text-foreground">Dev<span className="text-gradient">Girlzz</span></span>
          </div>
          <p className="text-xs font-body text-muted-foreground">Built for every IT woman 💜 Your journey starts here.</p>
        </div>
      </footer>
    </div>
  );
};

export default SkillTest;
