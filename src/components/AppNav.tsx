import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-bold text-foreground">IT Girl</span>
          <span className="text-primary text-lg">✦</span>
        </div>
        <nav className="flex items-center gap-1 flex-wrap">
          <AppNavLink to="/dashboard" emoji="✦">Dashboard</AppNavLink>
          <AppNavLink to="/careers" emoji="◈">Careers</AppNavLink>
          <AppNavLink to="/test" emoji="◉">Skill Test</AppNavLink>
          <AppNavLink to="/resources" emoji="◱">Resources</AppNavLink>
          <AppNavLink to="/cv" emoji="△">CV Builder</AppNavLink>
        </nav>
        <div className="flex items-center gap-2 ml-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted">
                <User size={12} className="text-muted-foreground" />
                <span className="text-xs font-body text-muted-foreground truncate max-w-[100px]">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Sign out"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNav;
