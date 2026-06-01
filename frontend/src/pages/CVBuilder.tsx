import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useAuth } from "@/hooks/useAuth";
import { apiClient, getStoredToken } from "@/integrations/api/client";

import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/i18n/I18nProvider";
import jsPDF from "jspdf";
import {
  Loader2, Download, User, Briefcase, GraduationCap, Code2,
  Plus, Trash2, Github, Globe, Award, FolderGit2, Languages, FileDown
} from "lucide-react";

interface CVData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  summary: string;
  github: string;
  linkedin: string;
  telegram: string;
  website: string;
  experience: { company: string; title: string; duration: string; description: string }[];
  education: { school: string; degree: string; year: string }[];
  skills: string[];
  spokenLanguages: { language: string; level: string }[];
  certifications: { name: string; platform: string; link: string }[];
  projects: { name: string; tech: string; description: string; link: string }[];
}

const CERT_PLATFORMS = ["Coursera", "Udemy", "edX", "LinkedIn Learning", "Google", "AWS", "Microsoft", "Meta", "Other"];
const LANG_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Native"];

function buildDjangoCvPayload(cv: CVData, accountEmail: string) {
  const email = (cv.email || accountEmail || "").trim();
  return {
    name: cv.name.trim(),
    role: cv.role.trim(),
    email,
    phone: cv.phone || "",
    location: cv.location || "",
    github: cv.github || "",
    linkedin: cv.linkedin || "",
    telegram: cv.telegram || "",
    website: cv.website || "",
    summary: cv.summary || "",
    experience: cv.experience.filter((e) => e.company || e.title),
    education: cv.education.filter((e) => e.school || e.degree),
    projects: cv.projects.filter((p) => p.name),
    certifications: cv.certifications.filter((c) => c.name),
    skills: cv.skills.filter(Boolean),
    languages: cv.spokenLanguages
      .filter((l) => l.language)
      .map((l) => ({ language: l.language, level: l.level })),
  };
}

function parseApiError(e: unknown): string {
  if (e && typeof e === "object") {
    const err = e as { message?: string; data?: { error?: string; code?: string } };
    if (err.data?.error) return err.data.error;
    if (err.message) return err.message;
  }
  return "Something went wrong. Try again or check that the backend is running.";
}

function normalizeExternalLink(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("@")) return `https://t.me/${value.slice(1)}`;
  return `https://${value}`;
}

const CVBuilder = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [cv, setCv] = useState<CVData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    summary: "",
    github: "",
    linkedin: "",
    telegram: "",
    website: "",
    experience: [{ company: "", title: "", duration: "", description: "" }],
    education: [{ school: "", degree: "", year: "" }],
    skills: [""],
    spokenLanguages: [{ language: "", level: "B1" }],
    certifications: [{ name: "", platform: "Coursera", link: "" }],
    projects: [{ name: "", tech: "", description: "", link: "" }],
  });
  const [generatedCV, setGeneratedCV] = useState("");
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [pdfReady, setPdfReady] = useState(false);
  const [step, setStep] = useState<"form" | "preview">("form");

  useEffect(() => {
    if (user?.email && !cv.email) {
      setCv((prev) => ({ ...prev, email: user.email || prev.email }));
    }
    if (user?.first_name && !cv.name) {
      const full = [user.first_name, user.last_name].filter(Boolean).join(" ");
      if (full) setCv((prev) => ({ ...prev, name: full }));
    }
  }, [user, cv.email, cv.name]);

  const update = <K extends keyof CVData>(field: K, value: CVData[K]) =>
    setCv((prev) => ({ ...prev, [field]: value }));

  const inputCls = "bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";
  const selectCls = "bg-background border border-border rounded-lg px-3 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  const buildSimpleCV = (data: CVData) => {
    const links = [data.linkedin, data.github, data.telegram, data.website].filter(Boolean).join(" | ");
    const contact = [data.email, data.phone, data.location].filter(Boolean).join(" | ");
    return `${data.name.toUpperCase()}
${data.role}
${contact}
${links}

SUMMARY
${data.summary}

WORK EXPERIENCE
${data.experience.map((e) => `${e.title} — ${e.company} (${e.duration})\n${e.description}`).join("\n\n")}

EDUCATION
${data.education.map((e) => `${e.degree} — ${e.school} (${e.year})`).join("\n")}

PROJECTS
${data.projects.filter(p => p.name).map((p) => `${p.name} | ${p.tech}\n${p.description}${p.link ? `\n${p.link}` : ""}`).join("\n\n")}

CERTIFICATES
${data.certifications.filter(c => c.name).map((c) => `${c.name} — ${c.platform}${c.link ? ` (${c.link})` : ""}`).join("\n")}

SKILLS
${data.skills.filter(Boolean).join(" • ")}

LANGUAGES
${data.spokenLanguages.filter(l => l.language).map(l => `${l.language} — ${l.level}`).join(" | ")}
`;
  };

  const downloadPdf = (text?: string) => {
    const body = (text ?? generatedCV).trim();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 44;
    const contentWidth = pageWidth - margin * 2;
    let y = 58;

    const ensureSpace = (needed = 16) => {
      if (y + needed <= pageHeight - 48) return;
      doc.addPage();
      y = 56;
    };

    const addWrappedText = (
      line: string,
      fontSize: number,
      isBold = false,
      color: [number, number, number] = [30, 20, 50],
      indent = 0,
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      doc.setTextColor(...color);
      const wrapped = doc.splitTextToSize(line, contentWidth - indent);
      wrapped.forEach((w: string) => {
        ensureSpace(fontSize * 1.6);
        doc.text(w, margin + indent, y);
        y += fontSize * 1.5;
      });
    };

    const addDivider = () => {
      ensureSpace(14);
      doc.setDrawColor(160, 120, 220);
      doc.setLineWidth(0.6);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;
    };

    const addSection = (title: string) => {
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(110, 40, 180);
      ensureSpace(18);
      doc.text(title.toUpperCase(), margin, y);
      y += 4;
      addDivider();
    };

    const addClickableLabelLink = (label: string, linkValue: string) => {
      const href = normalizeExternalLink(linkValue);
      if (!href) return;
      ensureSpace(14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(85, 75, 115);
      const base = `${label}: `;
      doc.text(base, margin, y);
      const x = margin + doc.getTextWidth(base);
      doc.setTextColor(65, 45, 170);
      doc.textWithLink(linkValue.trim(), x, y, { url: href });
      y += 13;
    };

    const addParagraphWithAutoLinks = (paragraph: string) => {
      const lines = doc.splitTextToSize(paragraph, contentWidth);
      const urlRegex = /(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      for (const line of lines as string[]) {
        ensureSpace(14);
        let x = margin;
        let lastIndex = 0;
        const matches = [...line.matchAll(urlRegex)];
        if (!matches.length) {
          doc.setTextColor(40, 35, 55);
          doc.text(line, x, y);
          y += 13;
          continue;
        }
        for (const m of matches) {
          const start = m.index ?? 0;
          const urlText = m[0];
          const before = line.slice(lastIndex, start);
          if (before) {
            doc.setTextColor(40, 35, 55);
            doc.text(before, x, y);
            x += doc.getTextWidth(before);
          }
          doc.setTextColor(65, 45, 170);
          doc.textWithLink(urlText, x, y, { url: normalizeExternalLink(urlText) });
          x += doc.getTextWidth(urlText);
          lastIndex = start + urlText.length;
        }
        const tail = line.slice(lastIndex);
        if (tail) {
          doc.setTextColor(40, 35, 55);
          doc.text(tail, x, y);
        }
        y += 13;
      }
    };

    // Header block
    doc.setFillColor(246, 241, 255);
    doc.roundedRect(margin - 8, y - 26, contentWidth + 16, 78, 10, 10, "F");
    addWrappedText(cv.name || "Your Name", 22, true, [30, 20, 50]);
    if (cv.role) addWrappedText(cv.role, 13, false, [110, 40, 180]);
    const contactLine = [cv.email, cv.phone, cv.location].filter(Boolean).join("  |  ");
    if (contactLine) addWrappedText(contactLine, 9, false, [95, 85, 120]);
    addClickableLabelLink("LinkedIn", cv.linkedin);
    addClickableLabelLink("GitHub", cv.github);
    addClickableLabelLink("Portfolio", cv.website);
    addClickableLabelLink("Telegram", cv.telegram);
    y += 2;
    addDivider();

    if (body) {
      addSection("Generated CV");
      body
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => {
          addParagraphWithAutoLinks(p);
          y += 2;
        });
      doc.save(`${(cv.name || "CV").replace(/\s+/g, "_")}_CV.pdf`);
      setPdfReady(true);
      return;
    }

    if (cv.summary) { addSection("Summary"); addWrappedText(cv.summary, 10, false, [50, 40, 70]); }
    if (cv.experience.some(e => e.company)) {
      addSection("Work Experience");
      cv.experience.filter(e => e.company).forEach(e => {
        addWrappedText(`${e.title} — ${e.company}  (${e.duration})`, 10, true, [30, 20, 50]);
        if (e.description) addWrappedText(e.description, 10, false, [80, 70, 100], 8);
        y += 4;
      });
    }
    if (cv.education.some(e => e.school)) {
      addSection("Education");
      cv.education.filter(e => e.school).forEach(e => {
        addWrappedText(`${e.degree} — ${e.school} (${e.year})`, 10, false, [50, 40, 70]);
      });
    }
    if (cv.projects.some(p => p.name)) {
      addSection("Projects");
      cv.projects.filter(p => p.name).forEach(p => {
        addWrappedText(`${p.name}  |  ${p.tech}`, 10, true, [30, 20, 50]);
        if (p.description) addWrappedText(p.description, 10, false, [80, 70, 100], 8);
        if (p.link) {
          const projectLink = normalizeExternalLink(p.link);
          ensureSpace(14);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(65, 45, 170);
          doc.textWithLink(p.link.trim(), margin + 8, y, { url: projectLink });
          y += 13;
        }
        y += 4;
      });
    }
    if (cv.certifications.some(c => c.name)) {
      addSection("Certifications");
      cv.certifications.filter(c => c.name).forEach(c => {
        addWrappedText(`${c.name} — ${c.platform}`, 10, false, [50, 40, 70]);
        if (c.link) {
          const certLink = normalizeExternalLink(c.link);
          ensureSpace(14);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(65, 45, 170);
          doc.textWithLink(c.link.trim(), margin + 8, y, { url: certLink });
          y += 13;
        }
      });
    }
    if (cv.skills.some(Boolean)) {
      addSection("Skills");
      addWrappedText(cv.skills.filter(Boolean).join("  •  "), 10, false, [50, 40, 70]);
    }
    if (cv.spokenLanguages.some(l => l.language)) {
      addSection("Languages");
      addWrappedText(cv.spokenLanguages.filter(l => l.language).map(l => `${l.language} — ${l.level}`).join("   |   "), 10, false, [50, 40, 70]);
    }

    doc.save(`${(cv.name || "CV").replace(/\s+/g, "_")}_CV.pdf`);
    setPdfReady(true);
  };

  const handleGenerate = async () => {
    setGenError("");
    setPdfReady(false);
    setLoading(true);
    try {
      const token = getStoredToken();
      const accountEmail = user?.email?.trim() || "";

      if (user && token) {
        const payload = buildDjangoCvPayload(cv, accountEmail);
        if (!payload.email) {
          setGenError("Email is required — add it in the form or update your profile.");
          return;
        }
        const raw = (await apiClient.generateCV(payload)) as { cv?: { generated_cv?: string } };
        const text = raw?.cv?.generated_cv?.trim();
        if (!text) {
          throw new Error("The server response did not include CV text.");
        }
        setGeneratedCV(text);
        setStep("preview");
        window.setTimeout(() => downloadPdf(text), 400);
        return;
      }

      if (supabase) {
        const { data, error } = await supabase.functions.invoke("generate-cv", { body: { cv } });
        if (!error) {
          const t = (data as { cvText?: string })?.cvText?.trim();
          const finalText = t || buildSimpleCV(cv);
          setGeneratedCV(finalText);
          if (!t) setGenError("Edge function returned no text — a simple template was shown.");
          setStep("preview");
          window.setTimeout(() => downloadPdf(finalText), 400);
          return;
        }
      }

      setGenError("Sign in to use AI CV generation (Django + Gemini). You can still download a basic template.");
      const fallback = buildSimpleCV(cv);
      setGeneratedCV(fallback);
      setStep("preview");
      window.setTimeout(() => downloadPdf(fallback), 400);
    } catch (e) {
      setGenError(parseApiError(e));
      setStep("form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <section className="relative py-14 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">{t("cv.badge")}</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">{t("cv.title")}</h1>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">{t("cv.sub")}</p>
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
                    className={inputCls}
                  />
                ))}
                <textarea
                  placeholder="Summary (short notes are fine — AI will polish into professional English)"
                  value={cv.summary}
                  onChange={(e) => update("summary", e.target.value)}
                  rows={3}
                  className={`sm:col-span-2 ${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Social & Links */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Github size={16} className="text-primary" />
                <h3 className="font-body font-semibold text-foreground">Links & Profiles</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder="GitHub URL (e.g. github.com/username)" value={cv.github} onChange={(e) => update("github", e.target.value)} className={inputCls} />
                <input placeholder="LinkedIn URL (e.g. linkedin.com/in/...)" value={cv.linkedin} onChange={(e) => update("linkedin", e.target.value)} className={inputCls} />
                <input placeholder="Telegram (e.g. @username)" value={cv.telegram} onChange={(e) => update("telegram", e.target.value)} className={inputCls} />
                <input placeholder="Personal website / portfolio URL" value={cv.website} onChange={(e) => update("website", e.target.value)} className={inputCls} />
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
                  <input placeholder="Company" value={exp.company} onChange={(e) => { const ex = [...cv.experience]; ex[i].company = e.target.value; update("experience", ex); }} className={inputCls} />
                  <input placeholder="Job Title" value={exp.title} onChange={(e) => { const ex = [...cv.experience]; ex[i].title = e.target.value; update("experience", ex); }} className={inputCls} />
                  <input placeholder="Duration (e.g. Jan 2026 – Present)" value={exp.duration} onChange={(e) => { const ex = [...cv.experience]; ex[i].duration = e.target.value; update("experience", ex); }} className={inputCls} />
                  <div className="flex gap-2">
                    <textarea placeholder="Responsibilities & achievements..." value={exp.description} onChange={(e) => { const ex = [...cv.experience]; ex[i].description = e.target.value; update("experience", ex); }} rows={2} className={`flex-1 ${inputCls} resize-none`} />
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
                  <input placeholder="University / School" value={edu.school} onChange={(e) => { const ed = [...cv.education]; ed[i].school = e.target.value; update("education", ed); }} className={inputCls} />
                  <input placeholder="Degree / Specialization" value={edu.degree} onChange={(e) => { const ed = [...cv.education]; ed[i].degree = e.target.value; update("education", ed); }} className={inputCls} />
                  <input placeholder="Year (e.g. 2022–Present)" value={edu.year} onChange={(e) => { const ed = [...cv.education]; ed[i].year = e.target.value; update("education", ed); }} className={inputCls} />
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 size={16} className="text-primary" />
                  <h3 className="font-body font-semibold text-foreground">Projects</h3>
                </div>
                <button onClick={() => update("projects", [...cv.projects, { name: "", tech: "", description: "", link: "" }])} className="flex items-center gap-1 text-xs text-primary hover:opacity-80"><Plus size={12} /> Add</button>
              </div>
              {cv.projects.map((proj, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 pb-3 border-b border-border last:border-0 last:pb-0 last:mb-0">
                  <input placeholder="Project name" value={proj.name} onChange={(e) => { const pr = [...cv.projects]; pr[i].name = e.target.value; update("projects", pr); }} className={inputCls} />
                  <input placeholder="Technologies used (e.g. Django, PostgreSQL)" value={proj.tech} onChange={(e) => { const pr = [...cv.projects]; pr[i].tech = e.target.value; update("projects", pr); }} className={inputCls} />
                  <textarea placeholder="What you built and achieved..." value={proj.description} onChange={(e) => { const pr = [...cv.projects]; pr[i].description = e.target.value; update("projects", pr); }} rows={2} className={`${inputCls} resize-none`} />
                  <div className="flex gap-2">
                    <input placeholder="GitHub / live link (optional)" value={proj.link} onChange={(e) => { const pr = [...cv.projects]; pr[i].link = e.target.value; update("projects", pr); }} className={`flex-1 ${inputCls}`} />
                    {cv.projects.length > 1 && <button onClick={() => update("projects", cv.projects.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-primary" />
                  <h3 className="font-body font-semibold text-foreground">Certifications</h3>
                </div>
                <button onClick={() => update("certifications", [...cv.certifications, { name: "", platform: "Coursera", link: "" }])} className="flex items-center gap-1 text-xs text-primary hover:opacity-80"><Plus size={12} /> Add</button>
              </div>
              {cv.certifications.map((cert, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                  <input placeholder="Certificate name (e.g. Meta Back-end Developer)" value={cert.name} onChange={(e) => { const cs = [...cv.certifications]; cs[i].name = e.target.value; update("certifications", cs); }} className={`sm:col-span-1 ${inputCls}`} />
                  <select value={cert.platform} onChange={(e) => { const cs = [...cv.certifications]; cs[i].platform = e.target.value; update("certifications", cs); }} className={selectCls}>
                    {CERT_PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <input placeholder="Certificate link (optional)" value={cert.link} onChange={(e) => { const cs = [...cv.certifications]; cs[i].link = e.target.value; update("certifications", cs); }} className={`flex-1 ${inputCls}`} />
                    {cv.certifications.length > 1 && <button onClick={() => update("certifications", cv.certifications.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>}
                  </div>
                </div>
              ))}
            </div>

            {/* Skills & Spoken Languages */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Code2 size={16} className="text-primary" /><h3 className="font-body font-semibold text-foreground text-sm">Technical Skills</h3></div>
                  <button onClick={() => update("skills", [...cv.skills, ""])} className="flex items-center gap-1 text-xs text-primary"><Plus size={12} /> Add</button>
                </div>
                {cv.skills.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g. Django REST Framework" value={s} onChange={(e) => { const sk = [...cv.skills]; sk[i] = e.target.value; update("skills", sk); }} className={`flex-1 ${inputCls}`} />
                    {cv.skills.length > 1 && <button onClick={() => update("skills", cv.skills.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>}
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Languages size={16} className="text-primary" /><h3 className="font-body font-semibold text-foreground text-sm">Spoken Languages</h3></div>
                  <button onClick={() => update("spokenLanguages", [...cv.spokenLanguages, { language: "", level: "B1" }])} className="flex items-center gap-1 text-xs text-primary"><Plus size={12} /> Add</button>
                </div>
                {cv.spokenLanguages.map((l, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input placeholder="e.g. English" value={l.language} onChange={(e) => { const la = [...cv.spokenLanguages]; la[i].language = e.target.value; update("spokenLanguages", la); }} className={`flex-1 ${inputCls}`} />
                    <select value={l.level} onChange={(e) => { const la = [...cv.spokenLanguages]; la[i].level = e.target.value; update("spokenLanguages", la); }} className={`w-20 ${selectCls}`}>
                      {LANG_LEVELS.map((lvl) => <option key={lvl}>{lvl}</option>)}
                    </select>
                    {cv.spokenLanguages.length > 1 && <button onClick={() => update("spokenLanguages", cv.spokenLanguages.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>}
                  </div>
                ))}
              </div>
            </div>

            {!user && (
              <p className="text-center font-body text-xs text-amber-700 dark:text-amber-400">
                For AI generation,{" "}
                <Link to="/auth" className="underline text-primary">
                  sign in
                </Link>
                — requests go through the Django server and Gemini.
              </p>
            )}

            {genError && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center font-body text-xs text-destructive">
                {genError}
              </p>
            )}

            <button
              onClick={handleGenerate}
              disabled={!cv.name || !cv.role || loading || (!cv.email.trim() && !user?.email)}
              className="w-full py-3 bg-primary text-primary-foreground rounded-full font-body font-medium text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-soft"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Generating your CV with AI…
                </span>
              ) : (
                "✦ Generate professional CV & download PDF"
              )}
            </button>
          </div>
        )}

        {step === "preview" && (
          <div>
            {genError && (
              <p className="mb-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 font-body text-xs text-amber-900 dark:text-amber-200">
                {genError}
              </p>
            )}
            {pdfReady && !genError && (
              <p className="mb-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 font-body text-xs text-foreground">
                <FileDown className="mr-1 inline h-3.5 w-3.5 text-primary" />
                PDF downloaded. Use the button below to save again if needed.
              </p>
            )}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { setStep("form"); setPdfReady(false); }} className="text-xs text-muted-foreground hover:text-foreground">← Edit</button>
              <button onClick={() => downloadPdf()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-body hover:bg-primary/90 transition-colors">
                <Download size={14} /> Download PDF again
              </button>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <pre className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">{generatedCV}</pre>
            </div>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default CVBuilder;
