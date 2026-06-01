import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp } from "lucide-react";
import { careers, categories, type CareerCategory } from "@/data/careers";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useI18n } from "@/i18n/I18nProvider";
import { categoryLabel, demandLabel } from "@/i18n/careerLabels";
import { toast } from "sonner";

const Career = () => {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CareerCategory | "all">("all");

  const filteredCareers =
    selectedCategory === "all"
      ? careers
      : careers.filter((career) => career.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-4 font-display text-3xl font-bold text-foreground">{t("careerPage.title")}</h1>
          <p className="mx-auto max-w-2xl text-body text-muted-foreground">{t("careerPage.sub")}</p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg bg-muted p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {categoryLabel(locale, category.id)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (user) navigate(`/jobs?role=${encodeURIComponent(career.id)}`);
                  else toast.message(t("careerPage.loginHint"));
                }
              }}
              className="group cursor-pointer rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
              onClick={() => {
                if (user) {
                  navigate(`/jobs?role=${encodeURIComponent(career.id)}`);
                } else {
                  toast.message(t("careerPage.loginHint"));
                }
              }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-xl transition-colors group-hover:bg-primary/15">
                  {career.emoji}
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 font-body text-xs text-primary">
                  {demandLabel(locale, career.demand)}
                </span>
              </div>

              <h3 className="mb-1.5 font-display text-base font-bold text-foreground transition-colors group-hover:text-primary">
                {career.title}
              </h3>

              <p className="mb-4 line-clamp-2 font-body text-xs leading-relaxed text-muted-foreground">
                {career.tagline}
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-1 font-body text-xs text-primary">
                  {categoryLabel(locale, career.category)}
                </span>
                <span className="flex items-center font-body text-xs text-muted-foreground">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  {demandLabel(locale, career.demand)}
                </span>
              </div>

              <p className="mb-4 text-body text-muted-foreground">{career.description}</p>

              <div className="mb-4">
                <span className="font-body text-sm font-semibold text-green-600">{career.salary}</span>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 font-body text-sm font-semibold text-foreground">{t("careerPage.keySkills")}</h4>
                <div className="flex flex-wrap gap-1">
                  {career.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="rounded bg-muted px-2 py-1 font-body text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 font-body text-sm font-semibold text-foreground">{t("careerPage.toolsTech")}</h4>
                <div className="flex flex-wrap gap-1">
                  {career.tools.slice(0, 6).map((tool) => (
                    <span
                      key={tool}
                      className="rounded bg-primary/10 px-2 py-1 font-body text-xs text-primary"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="mb-2 font-body text-sm font-semibold text-foreground">{t("careerPage.languages")}</h4>
                <div className="flex flex-wrap gap-1">
                  {career.languages.map((lang) => (
                    <span
                      key={lang.name}
                      className="rounded px-2 py-1 font-body text-xs"
                      style={{
                        backgroundColor: `${lang.color}15`,
                        color: lang.color,
                        border: `1px solid ${lang.color}25`,
                      }}
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowRight className="h-5 w-5 text-primary transition-colors group-hover:text-primary/80" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <AppFooter />
    </div>
  );
};

export default Career;
