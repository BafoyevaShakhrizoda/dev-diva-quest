import { useState } from "react";
import { careers } from "@/data/careers";
import AppNav from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Circle, Loader2 } from "lucide-react";

type Level = "Beginner" | "Junior" | "Middle" | "Senior";

const questions: Record<string, { q: string; options: string[] }[]> = {
  frontend: [
    { q: "What does CSS 'box-model' consist of?", options: ["Content, Padding, Border, Margin", "Header, Body, Footer, Nav", "Width, Height, Color, Font", "Display, Position, Float, Clear"] },
    { q: "Which hook manages side effects in React?", options: ["useEffect", "useState", "useRef", "useMemo"] },
    { q: "What is the purpose of TypeScript?", options: ["Static typing for JavaScript", "Server-side rendering", "CSS preprocessing", "Database management"] },
    { q: "What does 'semantic HTML' mean?", options: ["Using meaningful tags like <article>, <section>", "Using inline styles", "Minifying HTML", "Adding ARIA only"] },
    { q: "What is a CSS Flexbox container?", options: ["An element with display:flex", "A div with float:left", "A block with position:absolute", "An element with display:grid"] },
  ],
  backend: [
    { q: "What is a REST API?", options: ["Stateless HTTP interface using standard methods", "A real-time WebSocket connection", "A database query language", "A server-side rendering framework"] },
    { q: "What does SQL 'JOIN' do?", options: ["Combines rows from two or more tables", "Deletes duplicate records", "Creates a new database", "Encrypts data"] },
    { q: "What is middleware in Express.js?", options: ["Functions that run between request and response", "Database schema definitions", "Static file servers", "HTML template engines"] },
    { q: "What is caching?", options: ["Storing data for fast retrieval", "Compressing files", "Encrypting passwords", "Load balancing requests"] },
    { q: "What is a foreign key?", options: ["A column referencing a primary key in another table", "An encrypted password field", "An auto-increment ID", "A composite index"] },
  ],
  aiml: [
    { q: "What is overfitting in ML?", options: ["Model performs well on train but poorly on test data", "Model is too simple to learn patterns", "Training data is too large", "Feature engineering is missing"] },
    { q: "What is a neural network?", options: ["Layers of connected nodes inspired by the brain", "A search algorithm", "A database indexing method", "A web scraping tool"] },
    { q: "What is the purpose of normalization in data preprocessing?", options: ["Scale features to similar ranges", "Remove duplicate rows", "Add more training data", "Reduce model layers"] },
    { q: "What is supervised learning?", options: ["Training with labeled data", "Training without any labels", "Using only images", "Running on GPU clusters"] },
    { q: "What does 'gradient descent' optimize?", options: ["Minimizes the loss function", "Maximizes accuracy on test set", "Increases training data size", "Reduces overfitting automatically"] },
  ],
  cybersecurity: [
    { q: "What is a SQL injection attack?", options: ["Injecting malicious SQL via user input", "A virus spread via email", "A DDoS attack", "An XSS attack"] },
    { q: "What does HTTPS provide over HTTP?", options: ["Encrypted communication", "Faster page loads", "Better caching", "More HTTP methods"] },
    { q: "What is a VPN?", options: ["Virtual Private Network for encrypted tunneling", "Virus Protection Node", "Variable Port Number", "Virtual Partition Network"] },
    { q: "What is two-factor authentication?", options: ["Two verification steps to log in", "Using two passwords", "Logging in from two devices", "Using two email addresses"] },
    { q: "What is a firewall?", options: ["A network security system filtering traffic", "A hardware cooling system", "A backup solution", "An encryption algorithm"] },
  ],
  devops: [
    { q: "What is Docker?", options: ["A containerization platform", "A version control system", "A cloud provider", "A CI/CD tool"] },
    { q: "What does CI/CD stand for?", options: ["Continuous Integration / Continuous Deployment", "Code Inspection / Code Delivery", "Container Integration / Container Deployment", "Cloud Infrastructure / Cloud Deployment"] },
    { q: "What is Kubernetes used for?", options: ["Container orchestration and management", "Writing backend APIs", "Database management", "Frontend bundling"] },
    { q: "What is Infrastructure as Code?", options: ["Managing infrastructure via code files", "Writing backend apps", "Documenting servers manually", "Testing code in production"] },
    { q: "What is a load balancer?", options: ["Distributes traffic across multiple servers", "Compresses large files", "Monitors server CPU usage", "Caches database queries"] },
  ],
};

// Generic questions for roles without specific ones
const genericQuestions = [
  { q: "What is version control?", options: ["Tracking changes to code over time (e.g. Git)", "A database backup system", "A CSS versioning tool", "An API versioning standard"] },
  { q: "What is agile methodology?", options: ["Iterative, flexible software development process", "A waterfall development approach", "A database schema pattern", "A CI/CD pipeline"] },
  { q: "What is a code review?", options: ["Peer review of code for quality and correctness", "Automated testing of code", "A performance benchmark", "A deployment process"] },
  { q: "What is documentation?", options: ["Written explanations of code and systems", "Test coverage reports", "Performance monitoring", "API endpoints"] },
  { q: "What is debugging?", options: ["Finding and fixing errors in code", "Writing new features", "Deploying to production", "Code refactoring"] },
];

const SkillTest = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ level: Level; feedback: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const roleQuestions = selectedRole
    ? (questions[selectedRole] || genericQuestions)
    : [];

  const handleAnswer = (qIndex: number, aIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qIndex]: aIndex }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < roleQuestions.length) return;
    setLoading(true);

    const career = careers.find((c) => c.id === selectedRole);
    const answersText = roleQuestions.map((q, i) => (
      `Q: ${q.q}\nSelected: ${q.options[answers[i]]}`
    )).join("\n\n");

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-skill", {
        body: {
          role: career?.title || selectedRole,
          questions: roleQuestions,
          answers: answers,
        },
      });

      if (error) throw error;
      setResult(data);
      setSubmitted(true);
    } catch {
      // Fallback: simple scoring
      const correct = Object.values(answers).filter((a, i) => a === 0).length;
      const pct = correct / roleQuestions.length;
      let level: Level = "Beginner";
      if (pct >= 0.8) level = "Senior";
      else if (pct >= 0.6) level = "Middle";
      else if (pct >= 0.4) level = "Junior";
      setResult({ level, feedback: `You answered ${correct} out of ${roleQuestions.length} correctly.` });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Header */}
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">AI-Powered Evaluation</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Skill Test ◉
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Take a role-specific test. Our AI will evaluate your answers and assign you a level: Beginner, Junior, Middle, or Senior.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {/* Role Selection */}
        {!selectedRole && (
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground mb-5 text-center">
              Choose your role to test
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {careers.map((career) => (
                <button
                  key={career.id}
                  onClick={() => setSelectedRole(career.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-card transition-all duration-200 group"
                >
                  <span className="text-2xl">{career.emoji}</span>
                  <span className="font-body text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors leading-tight">
                    {career.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quiz */}
        {selectedRole && !submitted && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => { setSelectedRole(null); setAnswers({}); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Change role
              </button>
              <span className="font-display text-lg font-semibold text-foreground">
                {careers.find((c) => c.id === selectedRole)?.title} Test
              </span>
            </div>

            <div className="space-y-5">
              {roleQuestions.map((q, qi) => (
                <div key={qi} className="bg-card border border-border rounded-xl p-5">
                  <p className="font-body font-medium text-sm text-foreground mb-3">
                    {qi + 1}. {q.q}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button
                        key={oi}
                        onClick={() => handleAnswer(qi, oi)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-body transition-all duration-150 border ${
                          answers[qi] === oi
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                        }`}
                      >
                        {answers[qi] === oi
                          ? <CheckCircle size={14} className="shrink-0" />
                          : <Circle size={14} className="shrink-0" />}
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground font-body mb-3">
                {Object.keys(answers).length} / {roleQuestions.length} answered
              </p>
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < roleQuestions.length || loading}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-body font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-soft"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" />
                    AI is evaluating...
                  </span>
                ) : "Submit & Get Evaluated"}
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
                You're a{" "}
                <span className={levelColors[result.level]}>{result.level}</span>
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-5">
                {careers.find((c) => c.id === selectedRole)?.title}
              </p>
              <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
                <p className="font-body text-sm text-foreground leading-relaxed">{result.feedback}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => { setSelectedRole(null); setAnswers({}); setSubmitted(false); setResult(null); }}
                  className="px-5 py-2 bg-primary text-primary-foreground rounded-full font-body text-sm hover:bg-primary/90 transition-colors"
                >
                  Test another role
                </button>
                <button
                  onClick={() => { setAnswers({}); setSubmitted(false); setResult(null); }}
                  className="px-5 py-2 border border-border rounded-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-border bg-card/50 py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg text-foreground mb-1">Built for every IT girl 🌸</p>
          <p className="text-xs font-body text-muted-foreground">Your journey in tech starts with a single click</p>
        </div>
      </footer>
    </div>
  );
};

export default SkillTest;
