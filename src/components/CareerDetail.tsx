import { X } from "lucide-react";
import { CareerPath } from "@/data/careers";

interface CareerDetailProps {
  career: CareerPath;
  onClose: () => void;
}

const demandColors: Record<string, string> = {
  "Very High": "bg-rose text-primary-foreground",
  "High": "bg-sand text-foreground",
  "Growing": "bg-accent text-foreground",
};

const CareerDetail = ({ career, onClose }: CareerDetailProps) => {
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
            <span className="text-3xl font-display text-primary">{career.emoji}</span>
            <div>
              <h2 className="font-display text-xl text-foreground">{career.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-body font-medium px-2 py-0.5 rounded-full ${demandColors[career.demand]}`}>
                  {career.demand} Demand
                </span>
                <span className="text-sm text-muted-foreground font-body">{career.salary}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Tagline */}
          <p className="font-display text-lg italic text-primary">{career.tagline}</p>

          {/* Description */}
          <p className="font-body text-muted-foreground leading-relaxed">{career.description}</p>

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
        </div>
      </div>
    </div>
  );
};

export default CareerDetail;
