import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { careers, categories, CareerPath, CareerCategory } from "@/data/careers";
import CareerCard from "@/components/CareerCard";
import CareerDetail from "@/components/CareerDetail";
import AppNav from "@/components/AppNav";

const Index = () => {
  const [selected, setSelected] = useState<CareerPath | null>(null);
  const [activeCategory, setActiveCategory] = useState<CareerCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = careers.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.languages.some((l) => l.name.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero pt-20 pb-28">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/6 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Sparkles size={12} className="text-primary" />
            <span className="text-xs font-body font-medium text-primary tracking-wider uppercase">
              Your IT Career Journey
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-5 leading-tight animate-fade-up">
            Find your path
            <br />
            <span className="text-gradient">in tech, girl</span>
          </h1>

          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Explore every IT career path — from backend engineering to AI research. Discover the skills, languages, and roadmap to land your dream job.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto animate-fade-up" style={{ animationDelay: "200ms" }}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search roles or languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-2xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-card transition-all"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-12 animate-fade-up" style={{ animationDelay: "300ms" }}>
            {[
              { label: "Career Paths", value: "15+" },
              { label: "Languages Covered", value: "20+" },
              { label: "Tools & Frameworks", value: "80+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs font-body text-muted-foreground mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 bg-background" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-body font-medium border transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-primary hover:bg-secondary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-center text-sm font-body text-muted-foreground mb-8">
          <span className="font-semibold text-foreground">{filtered.length}</span> career path{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((career, i) => (
            <CareerCard
              key={career.id}
              career={career}
              index={i}
              onClick={() => setSelected(career)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-24 text-muted-foreground font-body">
            <div className="w-16 h-16 rounded-3xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Search size={24} className="text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-foreground mb-1">No careers found</p>
            <p className="text-sm">Try a different search query or category</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg font-bold text-foreground mb-1">
            Dev<span className="text-gradient">Girlzz</span>
          </p>
          <p className="text-xs font-body text-muted-foreground">Built for every IT woman 💜 Your journey starts here.</p>
        </div>
      </footer>

      {/* Detail Modal */}
      {selected && (
        <CareerDetail career={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default Index;
