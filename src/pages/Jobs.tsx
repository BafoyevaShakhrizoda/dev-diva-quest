import { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, DollarSign, Clock, Users, Building2, ExternalLink } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import AppNav from "@/components/AppNav";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    level: "",
    location: "",
    search: ""
  });

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params: any = {};
      if (filters.role) params.role = filters.role;
      if (filters.level) params.level = filters.level;
      if (filters.location) params.location = filters.location;
      
      const response = await apiClient.getAllJobs(params);
      setJobs(response);
    } catch (err: any) {
      setError(err.message || "Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  const applyJob = async (jobId: number) => {
    if (!user) {
      alert("Please login to apply for jobs");
      return;
    }

    try {
      // First, get user's CVs
      const cvs = await apiClient.getCVs();
      
      if (cvs.length === 0) {
        alert("Please create a CV first before applying for jobs");
        return;
      }

      // Use the first CV for application
      const cvId = cvs[0].id;
      const coverLetter = `I am excited to apply for this position. My skills and experience make me a strong candidate for this role.`;
      
      await apiClient.applyJob(jobId, {
        cv: cvId,
        cover_letter: coverLetter
      });

      alert("Application submitted successfully!");
      
      // Refresh jobs to update has_applied status
      fetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to apply for job");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
    job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
    job.description.toLowerCase().includes(filters.search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Job Opportunities
          </h1>
          <p className="text-body text-muted-foreground mb-6">
            Find your dream job in tech. Filter by role, experience level, or location.
          </p>
          
          {/* Filters */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-card mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-2">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Roles</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Full Stack</option>
                  <option value="mobile">Mobile</option>
                  <option value="devops">DevOps</option>
                  <option value="designer">UI/UX Designer</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.level}
                  onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="junior">Junior</option>
                  <option value="middle">Middle</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  placeholder="City or Remote"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-body font-semibold text-foreground mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    placeholder="Search jobs, companies..."
                    className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-body text-muted-foreground">Loading jobs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-body text-red-500">{error}</p>
            <button
              onClick={fetchJobs}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">
                      {job.title}
                    </h3>
                    <p className="text-body text-muted-foreground flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {job.company}
                    </p>
                  </div>
                  <div className="text-right">
                    {job.remote && (
                      <span className="text-xs font-body bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-body bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {job.role}
                  </span>
                  <span className="text-xs font-body bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                    {job.experience_level}
                  </span>
                  <span className="text-xs font-body flex items-center text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {job.location}
                  </span>
                </div>

                {/* Description */}
                <p className="text-body text-muted-foreground mb-4 line-clamp-3">
                  {job.description}
                </p>

                {/* Requirements */}
                <div className="mb-4">
                  <h4 className="text-sm font-body font-semibold text-foreground mb-2">
                    Requirements
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {job.requirements}
                  </p>
                </div>

                {/* Salary */}
                {job.salary_min && job.salary_max && (
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span className="text-sm font-body font-semibold text-green-600">
                      ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => applyJob(job.id)}
                    disabled={job.has_applied}
                    className={`px-4 py-2 rounded-lg font-body font-medium transition-colors ${
                      job.has_applied
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    {job.has_applied ? 'Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredJobs.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-body text-muted-foreground">
              Try adjusting your filters or check back later for new opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
