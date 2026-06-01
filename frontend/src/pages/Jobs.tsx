import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, MapPin, Briefcase, Building2, ChevronRight } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useI18n } from "@/i18n/I18nProvider";
import { localizeJobBody } from "@/i18n/jobLocals";
import { formatSalaryUzRange } from "@/lib/formatSalaryUz";
import { Button } from "@/components/ui/button";

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
  active: boolean;
  created_at: string;
  has_applied?: boolean;
}

const Jobs = () => {
  const { locale, t } = useI18n();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    level: "",
    location: "",
    search: "",
  });

  useEffect(() => {
    const r = searchParams.get("role");
    if (r) setFilters((prev) => ({ ...prev, role: r }));
  }, [searchParams]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params: Record<string, string> = {};
      if (filters.role) params.role = filters.role;
      if (filters.level) params.level = filters.level;
      if (filters.location) params.location = filters.location;

      const response = await apiClient.getAllJobs(params);
      setJobs(response as Job[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("jobs.fetchFailed"));
    } finally {
      setLoading(false);
    }
  }, [filters.role, filters.level, filters.location, t]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const localizedJobs = useMemo(() => jobs.map((j) => localizeJobBody(j, locale)), [jobs, locale]);

  const filteredJobs = useMemo(
    () =>
      localizedJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.description.toLowerCase().includes(filters.search.toLowerCase()),
      ),
    [localizedJobs, filters.search],
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">{t("jobs.title")}</h1>
          <p className="text-body mb-6 text-muted-foreground">{t("jobs.subtitle")}</p>

          <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-card">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-2 block font-body text-sm font-semibold text-foreground">{t("jobs.filterRole")}</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("jobs.allRoles")}</option>
                  <option value="frontend">{t("jobs.role.frontend")}</option>
                  <option value="backend">{t("jobs.role.backend")}</option>
                  <option value="fullstack">{t("jobs.role.fullstack")}</option>
                  <option value="mobile">{t("jobs.role.mobile")}</option>
                  <option value="devops">{t("jobs.role.devops")}</option>
                  <option value="designer">{t("jobs.role.designer")}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-body text-sm font-semibold text-foreground">{t("jobs.filterLevel")}</label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">{t("jobs.allLevels")}</option>
                  <option value="beginner">{t("jobs.level.beginner")}</option>
                  <option value="junior">{t("jobs.level.junior")}</option>
                  <option value="middle">{t("jobs.level.middle")}</option>
                  <option value="senior">{t("jobs.level.senior")}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-body text-sm font-semibold text-foreground">{t("jobs.filterLocation")}</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder={t("jobs.locationPh")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-2 block font-body text-sm font-semibold text-foreground">{t("jobs.filterSearch")}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder={t("jobs.searchPh")}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 font-body text-muted-foreground">{t("jobs.loading")}</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
            <p className="font-body text-sm text-destructive">{error}</p>
            <p className="mt-3 text-left font-body text-xs leading-relaxed text-muted-foreground">{t("jobs.errorHint")}</p>
            <Button type="button" className="mt-5 rounded-lg" onClick={fetchJobs}>
              {t("jobs.retry")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group block rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-hover"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg font-bold text-foreground group-hover:text-primary">{job.title}</h2>
                    <p className="mt-1 flex items-center gap-1 text-body text-muted-foreground">
                      <Building2 className="size-4 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {job.remote && (
                      <span className="inline-block rounded-full bg-green-500/15 px-2 py-1 text-xs font-body font-medium text-green-700 dark:text-green-400">
                        {t("jobs.remote")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-body text-primary">{job.role}</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs font-body text-muted-foreground">
                    {job.experience_level}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                    <MapPin className="size-3" />
                    {job.location}
                  </span>
                </div>

                <p className="mb-6 line-clamp-3 font-body text-sm leading-relaxed text-muted-foreground">{job.description}</p>

                {job.salary_min != null && job.salary_max != null && (
                  <p className="mb-4 text-xs font-semibold text-foreground">
                    {t("jobs.salaryMonthly")}: {formatSalaryUzRange(job.salary_min, job.salary_max, locale)}
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs text-muted-foreground">
                    {t("jobs.posted")} {new Date(job.created_at).toLocaleDateString()}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {t("jobs.viewDetails")}
                    <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !loading && !error && (
          <div className="py-12 text-center">
            <Briefcase className="mx-auto mb-4 size-12 text-muted-foreground" />
            <h3 className="mb-2 font-display text-xl font-bold text-foreground">{t("jobs.noJobs")}</h3>
            <p className="font-body text-muted-foreground">{t("jobs.adjustFilters")}</p>
          </div>
        )}
      </div>

      <AppFooter />
    </div>
  );
};

export default Jobs;
