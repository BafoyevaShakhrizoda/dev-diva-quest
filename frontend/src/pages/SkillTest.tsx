import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { careers } from "@/data/careers";
import {
  roleQuestionsMap,
  backendLanguageQuestionsMap,
  type Tier,
  type Level,
  type Question,
} from "@/data/skillQuestions";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/integrations/api/client";
import { skillRoleForApi } from "@/lib/skillRoleMap";
import { shuffleSkillQuestions } from "@/lib/shuffleSkillQuestions";
import { useI18n } from "@/i18n/I18nProvider";
import { CheckCircle, Circle, Loader2, ChevronRight, Briefcase, Sparkles } from "lucide-react";

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

type EvalResult = {
  level: Level;
  feedback: string;
  weakTopics: string[];
  nextSteps: string[];
  usedAiQuestions: boolean;
};

type RecJobRow = {
  id: number;
  match_score: number;
  skill_level: string;
  is_recommended: boolean;
  job: {
    id: number;
    title: string;
    company: string;
    location: string;
    role: string;
    remote: boolean;
  };
};

function parseLevel(s: string | undefined): Level {
  const v = (s || "").trim();
  const lower = v.toLowerCase();
  const map: Record<string, Level> = {
    beginner: "Beginner",
    junior: "Junior",
    middle: "Middle",
    senior: "Senior",
  };
  if (map[lower]) return map[lower];
  if (v === "Beginner" || v === "Junior" || v === "Middle" || v === "Senior") return v;
  return "Junior";
}

function mapJobsToRecRows(jobs: unknown[], skillLevelLabel: string): RecJobRow[] {
  if (!Array.isArray(jobs)) return [];
  const sl = skillLevelLabel.toLowerCase();
  return jobs.slice(0, 8).map((raw) => {
    const row = raw as Record<string, unknown>;
    const id = typeof row.id === "number" ? row.id : Number(row.id);
    return {
      id: -(Math.abs(id) + 1),
      match_score: 50,
      skill_level: sl,
      is_recommended: false,
      job: {
        id,
        title: String(row.title ?? ""),
        company: String(row.company ?? row.company_name ?? ""),
        location: String(row.location ?? ""),
        role: String(row.role ?? ""),
        remote: Boolean(row.remote),
      },
    };
  });
}

const SkillTest = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[] | null>(null);
  const [usedAiQuestions, setUsedAiQuestions] = useState(false);
  const [recommended, setRecommended] = useState<RecJobRow[]>([]);

  const tierInfo = useMemo(
    (): Record<Tier, { label: string; emoji: string; description: string; color: string }> => ({
      junior: {
        label: t("jobs.level.junior"),
        emoji: "✨",
        description: t("skill.tierJuniorDesc"),
        color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
      },
      middle: {
        label: t("jobs.level.middle"),
        emoji: "💪",
        description: t("skill.tierMiddleDesc"),
        color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
      },
      senior: {
        label: t("jobs.level.senior"),
        emoji: "👑",
        description: t("skill.tierSeniorDesc"),
        color: "text-violet-400 border-violet-400/30 bg-violet-400/10",
      },
    }),
    [t],
  );

  const availableLanguages = selectedRole ? roleLanguages[selectedRole] || [] : [];
  const needsLanguagePick = availableLanguages.length > 0 && !selectedLanguage;

  const getStaticQuestions = useCallback((): Question[] => {
    if (!selectedRole || !selectedTier) return [];
    const langMap =
      selectedRole === "backend" && selectedLanguage
        ? backendLanguageQuestionsMap[selectedLanguage]
        : null;
    const map = langMap || roleQuestionsMap[selectedRole];
    return map?.[selectedTier] || [];
  }, [selectedRole, selectedTier, selectedLanguage]);

  const roleQuestions = useMemo(() => {
    if (generatedQuestions?.length) return generatedQuestions;
    return getStaticQuestions();
  }, [generatedQuestions, getStaticQuestions]);

  const quizQuestions = useMemo(() => {
    if (roleQuestions.length === 0) return [];
    return shuffleSkillQuestions(roleQuestions);
  }, [roleQuestions]);

  useEffect(() => {
    if (!selectedRole || !selectedTier || needsLanguagePick) {
      setGeneratedQuestions(null);
      setUsedAiQuestions(false);
      setGenError("");
      return;
    }

    let cancelled = false;
    (async () => {
      setGenLoading(true);
      setGenError("");
      setGeneratedQuestions(null);
      setAnswers({});
      const fallback = getStaticQuestions();

      try {
        const career = careers.find((c) => c.id === selectedRole);
        const langs = selectedRole ? roleLanguages[selectedRole] || [] : [];
        const langLabel = langs.find((l) => l.id === selectedLanguage)?.label;
        const raw = (await apiClient.generateSkillSession({
          role: selectedRole,
          tier: selectedTier,
          language: langLabel || undefined,
          career_title: career?.title,
          count: 10,
        })) as { questions?: Question[] };

        if (cancelled) return;
        if (raw.questions && raw.questions.length >= 5) {
          setGeneratedQuestions(raw.questions);
          setUsedAiQuestions(true);
        } else {
          setGeneratedQuestions(fallback.length ? fallback : null);
          setUsedAiQuestions(false);
        }
      } catch {
        if (!cancelled) {
          setGeneratedQuestions(fallback.length ? fallback : null);
          setUsedAiQuestions(false);
          setGenError("AI questions could not load (API key or network). Using the local question bank.");
        }
      } finally {
        if (!cancelled) setGenLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedRole, selectedTier, selectedLanguage, needsLanguagePick, getStaticQuestions]);

  const handleAnswer = (qIndex: number, aIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: aIndex }));
  };

  const saveResult = async (level: Level, feedback: string, score: string, qs: Question[]) => {
    if (!user) return;
    const langLabel = availableLanguages.find((l) => l.id === selectedLanguage)?.label;
    try {
      await apiClient.saveSkillResult({
        role: skillRoleForApi(selectedRole || "fullstack"),
        career_id: selectedRole || undefined,
        language: langLabel || null,
        tier: selectedTier || "",
        level,
        feedback,
        score,
        questions: qs,
        answers,
      });
    } catch (e) {
      console.error("Failed to save skill result", e);
    }
  };

  const fetchJobRecommendations = async (level: Level) => {
    if (!user) return;
    const apiRole = skillRoleForApi(selectedRole || "fullstack");
    const loadFallbackRows = async (): Promise<RecJobRow[]> => {
      const byRole = (await apiClient.getAllJobs({ role: apiRole })) as unknown[];
      let rows = mapJobsToRecRows(byRole, level);
      if (rows.length === 0) {
        const anyJobs = (await apiClient.getAllJobs()) as unknown[];
        rows = mapJobsToRecRows(anyJobs, level);
      }
      return rows;
    };
    try {
      const rec = (await apiClient.getRecommendedJobs()) as { jobs?: RecJobRow[] };
      let rows = rec.jobs || [];
      if (rows.length === 0) {
        rows = await loadFallbackRows();
      }
      setRecommended(rows);
    } catch {
      try {
        setRecommended(await loadFallbackRows());
      } catch {
        setRecommended([]);
      }
    }
  };

  const handleSubmit = async () => {
    const qs = quizQuestions;
    if (qs.length === 0 || Object.keys(answers).length < qs.length) return;
    setLoading(true);
    setRecommended([]);
    const scoreStr = `${qs.filter((q, i) => answers[i] === q.correct).length}/${qs.length}`;
    const answersList = qs.map((_, i) => answers[i] ?? -1);
    if (answersList.some((a) => a < 0)) {
      setLoading(false);
      return;
    }

    try {
      let level: Level;
      let feedback: string;
      let weakTopics: string[] = [];
      let nextSteps: string[] = [];

      try {
        const data = (await apiClient.evaluateSkill({
          role: skillRoleForApi(selectedRole || "fullstack"),
          tier: selectedTier || "junior",
          questions: qs,
          answers: answersList,
        })) as {
          level_display?: string;
          level?: string;
          feedback?: string;
          weak_topics?: string[];
          next_steps?: string[];
        };

        level = parseLevel(data.level_display || data.level);
        feedback =
          (typeof data.feedback === "string" && data.feedback.trim()) ||
          `Assessment complete. Level: ${level}.`;
        weakTopics = Array.isArray(data.weak_topics) ? data.weak_topics : [];
        nextSteps = Array.isArray(data.next_steps) ? data.next_steps : [];
      } catch {
        const correct = qs.filter((q, i) => answers[i] === q.correct).length;
        const pct = qs.length ? correct / qs.length : 0;
        const allowed = selectedTier
          ? tierLevelCap[selectedTier]
          : (["Beginner", "Junior", "Middle", "Senior"] as Level[]);
        let lv: Level = allowed[0];
        if (pct >= 0.7 && allowed.includes("Senior")) lv = "Senior";
        else if (pct >= 0.7 && allowed.includes("Middle")) lv = "Middle";
        else if (pct >= 0.7 && allowed.includes("Junior")) lv = "Junior";
        else if (pct >= 0.4 && allowed.length > 1) lv = allowed[1] as Level;
        else lv = allowed[0] as Level;
        level = lv;
        feedback = `You answered ${correct}/${qs.length} questions correctly. ${pct >= 0.7 ? "Great work!" : "Review the topics above and practise with small projects."}`;
        weakTopics = [];
        nextSteps = [];
      }

      setResult({
        level,
        feedback,
        weakTopics,
        nextSteps,
        usedAiQuestions,
      });

      try {
        await saveResult(level, feedback, scoreStr, qs);
      } catch (e) {
        console.error("Failed to save skill result", e);
      }

      await fetchJobRecommendations(level);
    } catch (e) {
      console.error(e);
      setResult({
        level: "Junior",
        feedback:
          "We could not finish saving your results. Check your connection and try again shortly.",
        weakTopics: [],
        nextSteps: [],
        usedAiQuestions,
      });
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  const resetAll = () => {
    setSelectedRole(null);
    setSelectedLanguage(null);
    setSelectedTier(null);
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    setGeneratedQuestions(null);
    setUsedAiQuestions(false);
    setGenError("");
    setRecommended([]);
  };

  const showQuiz =
    selectedRole &&
    !needsLanguagePick &&
    selectedTier &&
    !submitted &&
    !genLoading &&
    quizQuestions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
              {t("skill.heroBadge")}
            </span>
          </div>
          <h1 className="mb-3 font-display text-4xl font-bold text-foreground md:text-5xl">{t("skill.pageTitle")}</h1>
          <p className="mx-auto max-w-lg font-body text-muted-foreground">{t("skill.heroSub")}</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-[50%] bg-background" />
      </section>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        {!selectedRole && (
          <div>
            <h2 className="mb-5 text-center font-display text-xl font-semibold text-foreground">{t("skill.pickRole")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {careers.map((career) => (
                <button
                  key={career.id}
                  type="button"
                  onClick={() => setSelectedRole(career.id)}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-card"
                >
                  <span className="text-2xl">{career.emoji}</span>
                  <span className="text-center font-body text-xs leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
                    {career.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRole && needsLanguagePick && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("skill.trackBack")}
              </button>
              <span className="font-display text-lg font-semibold text-foreground">
                {careers.find((c) => c.id === selectedRole)?.title}
              </span>
            </div>
            <h2 className="mb-2 text-center font-display text-xl font-semibold text-foreground">{t("skill.stack")}</h2>
            <p className="mb-5 text-center font-body text-xs text-muted-foreground">{t("skill.stackHelp")}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.id)}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-card"
                >
                  <span className="text-2xl">{lang.emoji}</span>
                  <span className="text-center font-body text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRole && !needsLanguagePick && !selectedTier && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (availableLanguages.length > 0) setSelectedLanguage(null);
                  else setSelectedRole(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← {t("skill.back")}
              </button>
              <span className="font-display text-lg font-semibold text-foreground">
                {careers.find((c) => c.id === selectedRole)?.title}
                {selectedLanguage && (
                  <span className="ml-1 text-sm text-primary">
                    — {availableLanguages.find((l) => l.id === selectedLanguage)?.label}
                  </span>
                )}
              </span>
            </div>
            <h2 className="mb-2 text-center font-display text-xl font-semibold text-foreground">{t("skill.difficultyLabel")}</h2>
            <p className="mb-5 text-center font-body text-xs text-muted-foreground">{t("skill.difficultyHelp")}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(["junior", "middle", "senior"] as Tier[]).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className="group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-card"
                >
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-body text-xs font-medium ${tierInfo[tier].color}`}
                  >
                    <span>{tierInfo[tier].emoji}</span>
                    {tierInfo[tier].label}
                  </div>
                  <p className="font-body text-xs leading-relaxed text-muted-foreground">
                    {tierInfo[tier].description}
                  </p>
                  <span className="flex items-center gap-1 font-body text-xs text-primary transition-all group-hover:gap-2">
                    Start <ChevronRight size={12} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRole && !needsLanguagePick && selectedTier && !submitted && genLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="font-body text-sm text-muted-foreground">{t("skill.generating")}</p>
          </div>
        )}

        {genError && selectedTier && !submitted && !genLoading && (
          <p className="mb-4 text-center font-body text-xs text-amber-700 dark:text-amber-400">{genError}</p>
        )}

        {showQuiz && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTier(null);
                  setAnswers({});
                  setGeneratedQuestions(null);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("skill.difficultyBack")}
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-semibold text-foreground">
                  {careers.find((c) => c.id === selectedRole)?.title}
                  {selectedLanguage && (
                    <span className="ml-1 text-primary">
                      — {availableLanguages.find((l) => l.id === selectedLanguage)?.label}
                    </span>
                  )}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-body text-xs ${tierInfo[selectedTier].color}`}
                >
                  {tierInfo[selectedTier].emoji} {tierInfo[selectedTier].label}
                </span>
                {usedAiQuestions ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-body text-[10px] font-medium text-primary">
                    AI authored
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-body text-[10px] text-muted-foreground">
                    Local bank
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qi) => (
                <div key={qi} className="rounded-xl border border-border bg-card p-5">
                  <p className="mb-3 font-body text-sm font-medium text-foreground">
                    {qi + 1}. {q.q}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => handleAnswer(qi, oi)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left font-body text-sm transition-all duration-150 ${
                          answers[qi] === oi
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {answers[qi] === oi ? (
                          <CheckCircle size={14} className="shrink-0" />
                        ) : (
                          <Circle size={14} className="shrink-0" />
                        )}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="mb-3 font-body text-xs text-muted-foreground">
                {t("skill.answered", { answered: Object.keys(answers).length, total: quizQuestions.length })}
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quizQuestions.length || loading}
                className="rounded-full bg-primary px-8 py-3 font-body text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    {t("skill.scoringShort")}
                  </span>
                ) : (
                  t("skill.submitResults")
                )}
              </button>
            </div>
          </div>
        )}

        {submitted && result && (
          <div className="text-center">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
              <div className="mb-4 text-6xl">{levelEmoji[result.level]}</div>
              <h2 className="mb-1 font-display text-3xl font-bold text-foreground">
                {t("skill.yourLevel")}{" "}
                <span className={levelColors[result.level]}>{result.level}</span>
              </h2>
              <p className="mb-1 font-body text-sm text-muted-foreground">
                {careers.find((c) => c.id === selectedRole)?.title}
                {selectedLanguage &&
                  ` — ${availableLanguages.find((l) => l.id === selectedLanguage)?.label}`}
              </p>
              {selectedTier && (
                <p className="mb-5 font-body text-xs text-muted-foreground">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tierInfo[selectedTier].color}`}
                  >
                    {tierInfo[selectedTier].emoji} {tierInfo[selectedTier].label}{" "}
                    {t("skill.tierSuffix")}
                  </span>
                </p>
              )}
              <div className="mb-6 rounded-xl bg-muted/50 p-4 text-left">
                <p className="font-body text-sm leading-relaxed text-foreground">{result.feedback}</p>
              </div>

              {(result.weakTopics.length > 0 || result.nextSteps.length > 0) && (
                <div className="mb-6 grid gap-4 text-left sm:grid-cols-2">
                  {result.weakTopics.length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <h3 className="mb-2 font-display text-sm font-semibold text-foreground">
                        {t("skill.weakTopics")}
                      </h3>
                      <ul className="list-inside list-disc font-body text-xs text-muted-foreground">
                        {result.weakTopics.map((topic) => (
                          <li key={topic}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.nextSteps.length > 0 && (
                    <div className="rounded-xl border border-border p-4">
                      <h3 className="mb-2 font-display text-sm font-semibold text-foreground">{t("skill.nextSteps")}</h3>
                      <ul className="list-inside list-disc font-body text-xs text-muted-foreground">
                        {result.nextSteps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!user && (
                <p className="mb-4 font-body text-xs text-muted-foreground">
                  Sign in to save results and unlock job suggestions —{" "}
                  <Link to="/auth" className="text-primary underline">
                    create an account
                  </Link>
                  .
                </p>
              )}

              {user && recommended.length > 0 && (
                <div className="mb-6 text-left">
                  <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Roles that fit your score
                  </h3>
                  <div className="space-y-3">
                    {recommended.slice(0, 6).map((row) => (
                      <Link
                        key={row.id}
                        to="/jobs"
                        className="block rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="font-body text-sm font-semibold text-foreground">{row.job.title}</p>
                            <p className="font-body text-xs text-muted-foreground">
                              {row.job.company} · {row.job.location}
                              {row.job.remote ? " · Remote" : ""}
                            </p>
                          </div>
                          <span className="rounded-full bg-primary/10 px-2 py-1 font-body text-xs font-medium text-primary">
                            {row.match_score}% match
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/jobs"
                    className="mt-3 inline-block font-body text-sm font-medium text-primary underline"
                  >
                    Browse every role →
                  </Link>
                </div>
              )}

              {user && recommended.length === 0 && (
                <p className="mb-4 font-body text-xs text-muted-foreground">
                  We could not find a close match yet — the job board may still be growing.{" "}
                  <Link to="/jobs" className="text-primary underline">
                    Open the Jobs page
                  </Link>{" "}
                  to browse everything listed.
                </p>
              )}

              <div className="flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={resetAll}
                  className="rounded-full bg-primary px-5 py-2 font-body text-sm text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Choose another track
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier(null);
                    setAnswers({});
                    setSubmitted(false);
                    setResult(null);
                    setRecommended([]);
                  }}
                  className="rounded-full border border-border px-5 py-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Change difficulty
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                    setResult(null);
                    setRecommended([]);
                  }}
                  className="rounded-full border border-border px-5 py-2 font-body text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Retake
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default SkillTest;
