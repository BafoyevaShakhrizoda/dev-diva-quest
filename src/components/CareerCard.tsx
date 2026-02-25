import { CareerPath } from "@/data/careers";

interface CareerCardProps {
  career: CareerPath;
  onClick: () => void;
  index: number;
}

const CareerCard = ({ career, onClick, index }: CareerCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group text-left gradient-card rounded-2xl p-5 border border-border shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 animate-fade-up w-full"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl font-display text-primary group-hover:scale-110 transition-transform duration-300 inline-block">
          {career.emoji}
        </span>
        <span className="text-xs font-body text-muted-foreground bg-muted px-2 py-1 rounded-full border border-border">
          {career.demand}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
        {career.title}
      </h3>

      {/* Tagline */}
      <p className="text-xs font-body text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {career.tagline}
      </p>

      {/* Languages */}
      {career.languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {career.languages.slice(0, 3).map((lang) => (
            <span
              key={lang.name}
              className="text-[11px] font-body font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: lang.color + "18",
                color: lang.color,
              }}
            >
              {lang.name}
            </span>
          ))}
          {career.languages.length > 3 && (
            <span className="text-[11px] font-body text-muted-foreground px-2 py-0.5">
              +{career.languages.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Salary */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-xs font-body text-muted-foreground">avg. salary</span>
        <span className="text-xs font-body font-semibold text-foreground">{career.salary}</span>
      </div>
    </button>
  );
};

export default CareerCard;
