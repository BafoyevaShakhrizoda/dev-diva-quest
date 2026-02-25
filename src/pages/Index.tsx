import { useState } from "react";
import { Search } from "lucide-react";
import { careers, categories, CareerPath, CareerCategory } from "@/data/careers";
import CareerCard from "@/components/CareerCard";
import CareerDetail from "@/components/CareerDetail";
import heroBg from "@/assets/hero-bg.jpg";

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
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Subtle bg image overlay */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">
              Your IT Career Journey Starts Here
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-5 leading-tight animate-fade-up">
            Find your path in
            <br />
            <span className="gradient-accent bg-clip-text" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              tech, girl ✦
            </span>
          </h1>

          <p className="font-body text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "100ms" }}>
            Explore every IT career path — from backend engineering to AI research. Discover the skills, languages, and roadmap to land your dream job.
          </p>

          {/* Search */}
          <div
            className="relative max-w-md mx-auto animate-fade-up"
            style={{ animationDelay: "200ms" }}
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search roles or languages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card/90 backdrop-blur-sm border border-border rounded-full font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-card"
            />
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap justify-center gap-6 mt-10 animate-fade-up"
            style={{ animationDelay: "300ms" }}
          >
            {[
              { label: "Career Paths", value: "15+" },
              { label: "Languages Covered", value: "20+" },
              { label: "Tools & Frameworks", value: "80+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs font-body text-muted-foreground mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-background rounded-t-[50%]" />
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-body font-medium border transition-all duration-200 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-center text-sm font-body text-muted-foreground mb-8">
          {filtered.length} career path{filtered.length !== 1 ? "s" : ""} found
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
          <div className="text-center py-20 text-muted-foreground font-body">
            <p className="text-4xl mb-4">✦</p>
            <p>No careers match your search. Try a different query!</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-10 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="font-display text-lg text-foreground mb-1">
            Built for every IT girl 🌸
          </p>
          <p className="text-xs font-body text-muted-foreground">
            Your journey in tech starts with a single click
          </p>
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
