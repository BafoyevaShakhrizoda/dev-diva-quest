import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Banknote,
} from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeJobBody } from "@/i18n/jobLocals";
import { formatSalaryUzRange } from "@/lib/formatSalaryUz";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  role: string;
  experience_level: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  remote: boolean;
  created_at: string;
  has_applied?: boolean;
}

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { locale, t } = useI18n();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const id = jobId ? parseInt(jobId, 10) : NaN;

  const load = useCallback(async () => {
    if (!Number.isFinite(id)) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    try {
      const raw = await apiClient.getJob(id);
      setJob(localizeJobBody(raw as Job, locale));
    } catch (e: unknown) {
      const status = typeof e === "object" && e !== null && "status" in e ? (e as { status?: number }).status : 0;
      if (status === 404) setNotFound(true);
      else toast.error(e instanceof Error ? e.message : t("jobs.applyFail"));
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id, locale, t]);

  useEffect(() => {
    load();
  }, [load]);

  const applyJob = async () => {
    if (!user || !job) {
      toast.message(t("jobs.mustLogin"));
      navigate("/auth");
      return;
    }

    try {
      const cvs = await apiClient.getCVs();
      if (!Array.isArray(cvs) || cvs.length === 0) {
        toast.message(t("jobs.needCv"));
        navigate("/cv");
        return;
      }
      const cvId = (cvs[0] as { id: number }).id;
      const coverLetter =
        "I would like to apply for this role. I believe my skills and experience are a strong match.";
      await apiClient.applyJob(job.id, {
        cv: cvId,
        cover_letter: coverLetter,
      });
      toast.success(t("jobs.applyOk"));
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : t("jobs.applyFail"));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Button variant="ghost" size="sm" className="-ml-2 mb-6 gap-2 rounded-full" asChild>
          <Link to="/jobs">
            <ArrowLeft className="h-4 w-4" />
            {t("jobDetail.back")}
          </Link>
        </Button>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">{t("jobDetail.loading")}</div>
        ) : notFound || !job ? (
          <div className="rounded-xl border border-border bg-card px-8 py-12 text-center shadow-card">
            <p className="text-muted-foreground">{t("jobDetail.notFound")}</p>
            <Button className="mt-6 rounded-full" asChild>
              <Link to="/jobs">{t("jobDetail.back")}</Link>
            </Button>
          </div>
        ) : (
          <article className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-10">
            <header className="border-b border-border pb-6">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {job.title}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                {job.company}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {job.role}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {job.experience_level}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
                {job.remote && (
                  <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                    {t("jobs.remote")}
                  </span>
                )}
              </div>
              {job.salary_min != null && job.salary_max != null && (
                <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  {t("jobs.salaryMonthly")}: {formatSalaryUzRange(job.salary_min, job.salary_max, locale)}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {t("jobs.posted")} {new Date(job.created_at).toLocaleDateString()}
              </p>
            </header>

            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("jobDetail.description")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-muted-foreground">
                {job.description}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-lg font-semibold text-foreground">{t("jobDetail.requirements")}</h2>
              <p className="mt-3 whitespace-pre-wrap text-body leading-relaxed text-muted-foreground">
                {job.requirements}
              </p>
            </section>

            <div className="mt-10 flex flex-wrap gap-3 border-t border-border pt-8">
              <Button
                className="rounded-full px-8"
                onClick={() => void applyJob()}
                disabled={Boolean(job.has_applied)}
              >
                {job.has_applied ? t("jobs.applied") : t("jobDetail.applyShort")}
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/jobs">{t("jobDetail.back")}</Link>
              </Button>
            </div>
          </article>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default JobDetail;
