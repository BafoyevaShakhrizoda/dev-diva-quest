import { useState } from "react";
import { CareerPath } from "@/data/careers";
import { Briefcase, ArrowRight, TrendingUp, Users, Target } from "lucide-react";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";
import AppNav from "@/components/AppNav";

const Career = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(false);

  const filteredCareers = selectedCategory === "all" 
    ? careers 
    : careers.filter(career => career.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Career Paths
          </h1>
          <p className="text-body text-muted-foreground max-w-2xl mx-auto">
            Explore different career paths in tech. Find your perfect match and see the skills, salary, and demand for each role.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg bg-muted p-1">
            {["all", "development", "design", "data", "infrastructure", "management", "qa"].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Career Paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career) => (
            <div
              key={career.id}
              className="group bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              onClick={() => {
                if (user) {
                  // Navigate to jobs page filtered by this career role
                  window.location.href = `/jobs?role=${career.id}`;
                } else {
                  alert("Please login to explore career paths");
                }
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary/15 transition-colors">
                  {career.emoji}
                </div>
                <div className="text-right">
                  <span className="text-xs font-body bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {career.demand}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h3 className="font-display text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                {career.title}
              </h3>

              {/* Tagline */}
              <p className="text-xs font-body text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                {career.tagline}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-body bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {career.category}
                </span>
                <span className="text-xs font-body bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  High Demand
                </span>
                <span className="text-xs font-body flex items-center text-muted-foreground">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {career.demand}
                </span>
              </div>

              {/* Description */}
              <p className="text-body text-muted-foreground mb-4">
                {career.description}
              </p>

              {/* Salary */}
              <div className="flex items-center mb-4">
                <span className="text-sm font-body font-semibold text-green-600">
                  {career.salary}
                </span>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-body font-semibold text-foreground mb-2">
                  Key Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {career.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-body bg-muted px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="mb-4">
                <h4 className="text-sm font-body font-semibold text-foreground mb-2">
                  Tools & Technologies
                </h4>
                <div className="flex flex-wrap gap-1">
                  {career.tools.slice(0, 6).map((tool) => (
                    <span
                      key={tool}
                      className="text-xs font-body bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="mb-4">
                <h4 className="text-sm font-body font-semibold text-foreground mb-2">
                  Languages
                </h4>
                <div className="flex flex-wrap gap-1">
                  {career.languages.map((lang) => (
                    <span
                      key={lang.name}
                      className="text-xs font-body px-2 py-1 rounded"
                      style={{
                        backgroundColor: lang.color + "15",
                        color: lang.color,
                        border: `1px solid ${lang.color}25`,
                      }}
                    >
                      {lang.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Career;
