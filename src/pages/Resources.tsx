import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { ExternalLink, BookOpen, Code2, FileText } from "lucide-react";
import { careers } from "@/data/careers";
import { useState } from "react";

interface Resource {
  title: string;
  url: string;
  type: "course" | "docs" | "practice" | "youtube";
  free: boolean;
  description: string;
}

const resourcesByRole: Record<string, Resource[]> = {
  frontend: [
    { title: "The Odin Project", url: "https://www.theodinproject.com", type: "course", free: true, description: "Full frontend curriculum from scratch" },
    { title: "MDN Web Docs", url: "https://developer.mozilla.org", type: "docs", free: true, description: "Official HTML, CSS, JS documentation" },
    { title: "LeetCode – JS Track", url: "https://leetcode.com/tag/javascript", type: "practice", free: true, description: "Practice JavaScript coding challenges" },
    { title: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "course", free: true, description: "Comprehensive web dev curriculum" },
    { title: "React Official Docs", url: "https://react.dev", type: "docs", free: true, description: "Learn React from the official source" },
  ],
  backend: [
    { title: "Django Documentation", url: "https://docs.djangoproject.com", type: "docs", free: true, description: "Official Django framework docs" },
    { title: "LeetCode – Database", url: "https://leetcode.com/problemset/database", type: "practice", free: true, description: "SQL practice problems" },
    { title: "CS50 Web", url: "https://cs50.harvard.edu/web", type: "course", free: true, description: "Harvard's free web programming course" },
    { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs", type: "docs", free: true, description: "Master PostgreSQL" },
    { title: "Node.js Docs", url: "https://nodejs.org/en/docs", type: "docs", free: true, description: "Official Node.js documentation" },
  ],
  aiml: [
    { title: "Fast.ai", url: "https://www.fast.ai", type: "course", free: true, description: "Practical deep learning for coders" },
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn", type: "course", free: true, description: "Free ML courses with hands-on notebooks" },
    { title: "Hugging Face Docs", url: "https://huggingface.co/docs", type: "docs", free: true, description: "Transformers and NLP documentation" },
    { title: "LeetCode – ML Contests", url: "https://leetcode.com/contest", type: "practice", free: true, description: "Algorithmic problem solving" },
    { title: "PyTorch Tutorials", url: "https://pytorch.org/tutorials", type: "docs", free: true, description: "Official PyTorch learning path" },
  ],
  cybersecurity: [
    { title: "TryHackMe", url: "https://tryhackme.com", type: "practice", free: true, description: "Guided cybersecurity labs and rooms" },
    { title: "Hack The Box", url: "https://www.hackthebox.com", type: "practice", free: true, description: "Real-world penetration testing practice" },
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten", type: "docs", free: true, description: "Learn top web security vulnerabilities" },
    { title: "Cybrary", url: "https://www.cybrary.it", type: "course", free: true, description: "Free cybersecurity training platform" },
  ],
  devops: [
    { title: "Docker Docs", url: "https://docs.docker.com", type: "docs", free: true, description: "Official Docker learning resources" },
    { title: "Kubernetes Docs", url: "https://kubernetes.io/docs", type: "docs", free: true, description: "Official Kubernetes documentation" },
    { title: "AWS Skill Builder", url: "https://skillbuilder.aws", type: "course", free: true, description: "Free AWS training and certification prep" },
    { title: "GitHub Actions Docs", url: "https://docs.github.com/actions", type: "docs", free: true, description: "CI/CD with GitHub Actions" },
  ],
};

const defaultResources: Resource[] = [
  { title: "LeetCode", url: "https://leetcode.com", type: "practice", free: true, description: "Algorithm and data structure practice" },
  { title: "freeCodeCamp", url: "https://www.freecodecamp.org", type: "course", free: true, description: "Free coding curriculum" },
  { title: "Coursera", url: "https://www.coursera.org", type: "course", free: false, description: "University-grade online courses" },
  { title: "GitHub Learning Lab", url: "https://lab.github.com", type: "docs", free: true, description: "Hands-on GitHub learning" },
];

const typeIcon = {
  course: <BookOpen size={14} />,
  docs: <FileText size={14} />,
  practice: <Code2 size={14} />,
  youtube: <ExternalLink size={14} />,
};

const typeColor: Record<string, string> = {
  course: "bg-primary/10 text-primary",
  docs: "bg-secondary text-secondary-foreground",
  practice: "bg-accent text-accent-foreground",
  youtube: "bg-muted text-muted-foreground",
};

const Resources = () => {
  const [selectedRole, setSelectedRole] = useState("frontend");
  const resources = resourcesByRole[selectedRole] || defaultResources;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Header */}
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">Curated Resources</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
            Skill Up ◱
          </h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Curated docs, free courses, and LeetCode tracks — organized by your career path.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Role tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {careers.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedRole(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-body font-medium border transition-all ${
                selectedRole === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.emoji} {c.title}
            </button>
          ))}
        </div>

        {/* Resources */}
        <div className="grid gap-3">
          {resources.map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-card transition-all duration-200 group"
            >
              <div className="flex items-start gap-3 flex-1">
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-body font-medium shrink-0 ${typeColor[r.type]}`}>
                  {typeIcon[r.type]}
                  {r.type}
                </div>
                <div>
                  <h3 className="font-body font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                    {r.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground mt-0.5">{r.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 {r.free && (
                   <span className="text-xs font-body text-primary bg-primary/10 px-2 py-0.5 rounded-full">Free</span>
                 )}
                <ExternalLink size={13} className="text-muted-foreground" />
              </div>
            </a>
          ))}
        </div>

        {(resourcesByRole[selectedRole] || []).length === 0 && (
          <div className="grid gap-3">
            {defaultResources.map((r, i) => (
              <a
                key={i}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${typeColor[r.type]}`}>
                    {typeIcon[r.type]} {r.type}
                  </div>
                  <div>
                    <h3 className="font-body text-sm text-foreground group-hover:text-primary">{r.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{r.description}</p>
                  </div>
                </div>
                <ExternalLink size={13} className="text-muted-foreground" />
              </a>
            ))}
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default Resources;
