import { CareerPath } from "@/data/careers";
import { ArrowRight } from "lucide-react";

interface CareerCardProps {
  career: CareerPath;
  onClick: () => void;
  index: number;
}

const CareerCard = ({ career, onClick, index }: CareerCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-card rounded-2xl p-5 border border-border shadow-card hover:shadow-hover hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 animate-fade-up w-full"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: "both" }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-xl group-hover:bg-primary/15 transition-colors">
          {career.emoji}
        </div>
        <span className="text-[11px] font-body font-medium text-primary bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full">
          {career.demand}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base font-bold text-foreground mb-1.5 group-hover:text-primary transition-colors">
        {career.title}
      </h3>

      {/* Tagline */}
      <p className="text-xs font-body text-muted-foreground leading-relaxed mb-4 line-clamp-2">
        {career.tagline}
      </p>

      {/* Languages */}
      {career.languages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {career.languages.slice(0, 3).map((lang) => (
            <span
              key={lang.name}
              className="text-[11px] font-body font-semibold px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: lang.color + "15",
                color: lang.color,
                border: `1px solid ${lang.color}25`,
              }}
            >
              {lang.name}
            </span>
          ))}
          {career.languages.length > 3 && (
            <span className="text-[11px] font-body text-muted-foreground px-2 py-1">
              +{career.languages.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Salary */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div>
          <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wide">avg. salary</span>
          <div className="text-sm font-body font-bold text-foreground">{career.salary}</div>
        </div>
        <div className="w-7 h-7 rounded-full bg-secondary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
          <ArrowRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
};

export default CareerCard;
