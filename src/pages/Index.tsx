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

  console.log('Careers data:', careers);
  console.log('Search term:', search);
  console.log('Active category:', activeCategory);

  const filtered = careers.filter((c) => {
    const matchCat = activeCategory === "all" || c.category === activeCategory;
    const matchSearch =
      search === "" ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.languages.some((l) => l.name.toLowerCase().includes(search.toLowerCase())) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.tagline.toLowerCase().includes(search.toLowerCase()) ||
      c.tools.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    
    // Debug logging
    if (search !== "") {
      console.log('Search:', search);
      console.log('Career:', c.title);
      console.log('Match Category:', matchCat);
      console.log('Match Search:', matchSearch);
      console.log('---');
    }
    
    return matchCat && matchSearch;
  });

  console.log('Filtered careers:', filtered);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Hero — full purple gradient background */}
      <section className="relative overflow-hidden pt-20 pb-32" style={{ background: "linear-gradient(135deg, hsl(265 84% 54%) 0%, hsl(280 75% 45%) 50%, hsl(250 90% 40%) 100%)" }}>
        {/* Geometric decoration */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl pointer-events-none" />

        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }} />

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Sparkles size={12} className="text-white" />
            <span className="text-xs font-body font-medium text-white tracking-wider uppercase">
              Your IT Career Journey
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-5 leading-tight animate-fade-up drop-shadow-lg">
            Find your path
            <br />
            <span className="text-white/80">in tech, girl</span>
          </h1>

          <p className="font-body text-lg text-white/75 max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
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
              className="w-full pl-11 pr-4 py-3.5 bg-white border-0 rounded-2xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/50 shadow-2xl transition-all"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-up" style={{ animationDelay: "300ms" }}>
            {[
              { label: "Career Paths", value: "15+" },
              { label: "Languages Covered", value: "20+" },
              { label: "Tools & Frameworks", value: "80+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-3 text-center">
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs font-body text-white/70 mt-0.5 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave cut */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="hsl(var(--background))" />
          </svg>
        </div>
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
