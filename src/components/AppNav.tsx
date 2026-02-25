import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppNavLinkProps {
  to: string;
  emoji?: string;
  children: React.ReactNode;
}

const AppNavLink = ({ to, emoji, children }: AppNavLinkProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {emoji && <span>{emoji}</span>}
      {children}
    </NavLink>
  );
};

const AppNav = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-foreground">IT Girl</span>
          <span className="text-primary text-lg">✦</span>
        </div>
        <nav className="flex items-center gap-1 flex-wrap">
          <AppNavLink to="/" emoji="◈">Careers</AppNavLink>
          <AppNavLink to="/dashboard" emoji="✦">Dashboard</AppNavLink>
          <AppNavLink to="/test" emoji="◉">Skill Test</AppNavLink>
          <AppNavLink to="/resources" emoji="◱">Resources</AppNavLink>
          <AppNavLink to="/cv" emoji="△">CV Builder</AppNavLink>
        </nav>
      </div>
    </header>
  );
};

export default AppNav;
