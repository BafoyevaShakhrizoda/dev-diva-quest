import { X, Briefcase, ExternalLink, MapPin, DollarSign } from "lucide-react";
import { CareerPath } from "@/data/careers";
import { useState, useEffect } from "react";
import { apiClient } from "@/integrations/api/client";

interface CareerDetailProps {
  career: CareerPath;
  onClose: () => void;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  remote: boolean;
  requirements: string;
  description: string;
}

const demandColors: Record<string, string> = {
  "Very High": "bg-rose text-primary-foreground",
  "High": "bg-sand text-foreground",
  "Growing": "bg-accent text-foreground",
};

const CareerDetail = ({ career, onClose }: CareerDetailProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs'>('overview');

  useEffect(() => {
    if (activeTab === 'jobs') {
      fetchJobs();
    }
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const response = await apiClient.getAllJobs({ 
        role: career.title.toLowerCase().replace(' ', '') 
      });
      setJobs(response.slice(0, 5)); // Show only 5 jobs
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const applyJob = async (jobId: number) => {
    try {
      const cvs = await apiClient.getCVs();
      if (cvs.length === 0) {
        alert('Please create a CV first before applying for jobs');
        return;
      }
      
      await apiClient.applyJob(jobId, {
        cv: cvs[0].id,
        cover_letter: `I am interested in this ${career.title} position.`
      });
      
      alert('Application submitted successfully!');
    } catch (error) {
      alert('Failed to apply for job');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto gradient-card rounded-t-3xl sm:rounded-2xl shadow-hover border border-border animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 gradient-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">
              {career.emoji}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                {career.title}
              </h2>
              <p className="text-xs font-body text-muted-foreground">
                {career.demand} demand
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 text-sm font-body font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 px-6 py-3 text-sm font-body font-medium transition-colors ${
              activeTab === 'jobs'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Jobs ({jobs.length})
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {activeTab === 'overview' ? (
            // Original career content
            <div className="space-y-6">
              {/* Tagline */}
              <p className="font-display text-lg italic text-primary">{career.tagline}</p>

              {/* Description */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  About this Career
                </h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {career.description}
                </p>
              </div>

              {/* Languages */}
              {career.languages.length > 0 && (
                <div>
                  <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                    Languages & Technologies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {career.languages.map((lang) => (
                      <span
                        key={lang.name}
                        className="px-3 py-1.5 rounded-full text-sm font-body font-medium border"
                        style={{
                          backgroundColor: lang.color + "22",
                          borderColor: lang.color + "44",
                          color: lang.color,
                        }}
                      >
                        {lang.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools */}
              <div>
                <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                  Tools & Frameworks
                </h3>
                <div className="flex flex-wrap gap-2">
                  {career.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1.5 rounded-full text-sm font-body bg-muted text-foreground border border-border"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                  Core Skills
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {career.skills.map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-sm font-body text-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              {/* Roadmap */}
              <div>
                <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
                  Learning Roadmap
                </h3>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-3 pl-8">
                    {career.roadmap.map((step, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-5 w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                          <span className="text-[8px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-sm font-body text-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Salary */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Salary Range
                </h3>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-body text-foreground font-semibold">
                    {career.salary}
                  </span>
                </div>
              </div>

              {/* Growth */}
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-3">
                  Career Growth
                </h3>
                <p className="text-body text-muted-foreground leading-relaxed">
                  {career.growth}
                </p>
              </div>
            </div>
          ) : (
            // Jobs content
            <div className="space-y-4">
              {loadingJobs ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="mt-3 text-sm text-muted-foreground">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    No jobs available
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Check back later for new {career.title} opportunities.
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card rounded-xl p-4 border border-border shadow-card"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display text-base font-bold text-foreground mb-1">
                          {job.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      {job.remote && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Remote
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      {job.salary_min && job.salary_max && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Posted recently
                      </div>
                      <button
                        onClick={() => applyJob(job.id)}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-body font-medium hover:bg-primary/90 transition-colors"
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Roadmap */}
          <div>
            <h3 className="font-body font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
              Learning Roadmap
            </h3>
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-3 pl-8">
                {career.roadmap.map((step, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-5 w-4 h-4 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                      <span className="text-[8px] font-bold text-primary">{i + 1}</span>
                    </div>
                    <p className="text-sm font-body text-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;
