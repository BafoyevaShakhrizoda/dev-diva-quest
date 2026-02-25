import { useState } from "react";
import AppNav from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Download, User, Briefcase, GraduationCap, Code2, Plus, Trash2 } from "lucide-react";

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  summary: string;
  experience: { company: string; title: string; duration: string; description: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string[];
  languages: string[];
}

const CVBuilder = () => {
  const [cv, setCv] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    summary: "",
    experience: [{ company: "", title: "", duration: "", description: "" }],
    education: [{ school: "", degree: "", year: "" }],
    skills: [""],
    languages: [""],
  });
  const [generatedCV, setGeneratedCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");

  const update = (field: keyof CVData, value: any) => setCv((prev) => ({ ...prev, [field]: value }));

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-cv", { body: { cv } });
      if (error) throw error;
      setGeneratedCV(data.cvText);
      setStep("preview");
    } catch {
      // Fallback: simple template
      const text = buildSimpleCV(cv);
      setGeneratedCV(text);
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const buildSimpleCV = (cv: CVData) => `${cv.name}
${cv.role}
${cv.email} | ${cv.phone} | ${cv.location}

SUMMARY
${cv.summary}

EXPERIENCE
${cv.experience.map((e) => `${e.title} @ ${e.company} (${e.duration})\n${e.description}`).join("\n\n")}

EDUCATION
${cv.education.map((e) => `${e.degree} — ${e.school} (${e.year})`).join("\n")}

SKILLS
${cv.skills.filter(Boolean).join(" • ")}

LANGUAGES
${cv.languages.filter(Boolean).join(" • ")}
`;

  const handleDownload = () => {
    const blob = new Blob([generatedCV], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cv.name.replace(/\s+/g, "_")}_CV.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Header */}
      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">AI-Powered</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">CV Builder △</h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Fill in your details — our AI will craft a professional, polished CV tailored to your IT career.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        {step === "form" && (
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-primary" />
                <h3 className="font-body font-semibold text-foreground">Personal Info</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(["name", "email", "phone", "location", "role"] as const).map((field) => (
                  <input
                    key={field}
                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={cv[field]}
                    onChange={(e) => update(field, e.target.value)}
                    className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                ))}
                <textarea
                  placeholder="Professional summary..."
                  value={cv.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  rows={3}
                  className="sm:col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-primary" />
                  <h3 className="font-body font-semibold text-foreground">Experience</h3>
                </div>
                <button onClick={() => update("experience", [...cv.experience, { company: "", title: "", duration: "", description: "" }])}
                  className="flex items-center gap-1 text-xs text-primary hover:opacity-80">
                  <Plus size={12} /> Add
                </button>
              </div>
              {cv.experience.map((exp, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 pb-3 border-b border-border last:border-0 last:pb-0 last:mb-0">
                  <input placeholder="Company" value={exp.company} onChange={(e) => { const ex = [...cv.experience]; ex[i].company = e.target.value; update("experience", ex); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <input placeholder="Job Title" value={exp.title} onChange={(e) => { const ex = [...cv.experience]; ex[i].title = e.target.value; update("experience", ex); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <input placeholder="Duration (e.g. 2022–2024)" value={exp.duration} onChange={(e) => { const ex = [...cv.experience]; ex[i].duration = e.target.value; update("experience", ex); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <div className="flex gap-2">
                    <textarea placeholder="Description" value={exp.description} onChange={(e) => { const ex = [...cv.experience]; ex[i].description = e.target.value; update("experience", ex); }} rows={2} className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none" />
                    {cv.experience.length > 1 && <button onClick={() => update("experience", cv.experience.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-primary" />
                  <h3 className="font-body font-semibold text-foreground">Education</h3>
                </div>
                <button onClick={() => update("education", [...cv.education, { school: "", degree: "", year: "" }])} className="flex items-center gap-1 text-xs text-primary hover:opacity-80"><Plus size={12} /> Add</button>
              </div>
              {cv.education.map((edu, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input placeholder="School" value={edu.school} onChange={(e) => { const ed = [...cv.education]; ed[i].school = e.target.value; update("education", ed); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <input placeholder="Degree" value={edu.degree} onChange={(e) => { const ed = [...cv.education]; ed[i].degree = e.target.value; update("education", ed); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                  <input placeholder="Year" value={edu.year} onChange={(e) => { const ed = [...cv.education]; ed[i].year = e.target.value; update("education", ed); }} className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
              ))}
            </div>

            {/* Skills & Languages */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Code2 size={16} className="text-primary" /><h3 className="font-body font-semibold text-foreground text-sm">Skills</h3></div>
                  <button onClick={() => update("skills", [...cv.skills, ""])} className="flex items-center gap-1 text-xs text-primary"><Plus size={12} /> Add</button>
                </div>
                {cv.skills.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g. React" value={s} onChange={(e) => { const sk = [...cv.skills]; sk[i] = e.target.value; update("skills", sk); }} className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    {cv.skills.length > 1 && <button onClick={() => update("skills", cv.skills.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>}
                  </div>
                ))}
              </div>
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Code2 size={16} className="text-primary" /><h3 className="font-body font-semibold text-foreground text-sm">Languages</h3></div>
                  <button onClick={() => update("languages", [...cv.languages, ""])} className="flex items-center gap-1 text-xs text-primary"><Plus size={12} /> Add</button>
                </div>
                {cv.languages.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g. Python" value={l} onChange={(e) => { const la = [...cv.languages]; la[i] = e.target.value; update("languages", la); }} className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                    {cv.languages.length > 1 && <button onClick={() => update("languages", cv.languages.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!cv.name || !cv.role || loading}
              className="w-full py-3 bg-primary text-primary-foreground rounded-full font-body font-medium text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-soft"
            >
              {loading ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />AI is crafting your CV...</span> : "✦ Generate CV with AI"}
            </button>
          </div>
        )}

        {step === "preview" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setStep("form")} className="text-xs text-muted-foreground hover:text-foreground">← Edit</button>
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-body hover:bg-primary/90 transition-colors">
                <Download size={14} /> Download CV
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <pre className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">{generatedCV}</pre>
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

export default CVBuilder;
