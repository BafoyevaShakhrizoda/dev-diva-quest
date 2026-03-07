import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import logo from "@/assets/devgirlzz-logo.png";

interface AppNavLinkProps {
  to: string;
  children: React.ReactNode;
}

const AppNavLink = ({ to, children }: AppNavLinkProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
      )}
    >
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
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          <img src={logo} alt="DevGirlzz Logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-xl font-bold text-foreground tracking-tight">
            Dev<span className="text-gradient">Girlzz</span>
          </span>
        </NavLink>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <AppNavLink to="/dashboard">Dashboard</AppNavLink>
          <AppNavLink to="/careers">Careers</AppNavLink>
          <AppNavLink to="/test">Skill Test</AppNavLink>
          <AppNavLink to="/resources">Resources</AppNavLink>
          <AppNavLink to="/cv">CV Builder</AppNavLink>
        </nav>

        {/* User area */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <User size={11} className="text-primary-foreground" />
                </div>
                <span className="text-xs font-body font-medium text-foreground truncate max-w-[100px]">
                  {user.email?.split("@")[0]}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-transparent hover:border-border"
                title="Sign out"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-body font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-soft"
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
