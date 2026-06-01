import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Menu } from "lucide-react";
import logo from "@/assets/devgirlzz-logo.png";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { formatUserDisplayName } from "@/lib/userDisplayName";
import { useI18n } from "@/i18n/I18nProvider";

interface AppNavLinkProps {
  to: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}

const AppNavLink = ({ to, children, onNavigate }: AppNavLinkProps) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </NavLink>
  );
};

const AppNav = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  const navItems = useMemo(
    () =>
      [
        { to: "/dashboard", label: t("nav.dashboard") },
        { to: "/test", label: t("nav.skills") },
        { to: "/cv", label: t("nav.cv") },
        { to: "/careers", label: t("nav.careers") },
        { to: "/jobs", label: t("nav.jobs") },
        { to: "/resources", label: t("nav.resources") },
      ] as const,
    [t],
  );

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
    navigate("/auth");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 shadow-sm backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/dashboard" className="group flex items-center gap-2.5">
          <img src={logo} alt="DevGirlzz Logo" className="h-8 w-8 object-contain" />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Dev<span className="text-gradient">Girlzz</span>
          </span>
        </NavLink>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {navItems.map((item) => (
            <AppNavLink key={item.to} to={item.to}>
              {item.label}
            </AppNavLink>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[min(100%,320px)] flex-col gap-6 pt-10">
              <SheetHeader className="text-left">
                <SheetTitle className="font-display">{t("nav.menu")}</SheetTitle>
              </SheetHeader>
              <LanguageSwitcher />
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navItems.map((item) => (
                  <AppNavLink key={item.to} to={item.to} onNavigate={closeMobile}>
                    {item.label}
                  </AppNavLink>
                ))}
              </nav>
              <div className="mt-auto border-t border-border pt-4">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      onClick={closeMobile}
                      className="flex items-center gap-2 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm font-medium"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                    <Button variant="outline" className="w-full justify-start gap-2 rounded-xl" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full rounded-full" asChild onClick={closeMobile}>
                    <Link to="/auth">{t("nav.signIn")}</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {user ? (
            <>
              <Link
                to="/profile"
                className="hidden min-w-0 max-w-[min(140px,28vw)] items-center gap-2 rounded-full border border-border bg-secondary px-2 py-1.5 transition-colors hover:border-primary/30 hover:bg-primary/5 sm:flex md:max-w-[180px] md:px-3"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  <User size={11} className="text-primary-foreground" />
                </div>
                <span className="min-w-0 truncate text-xs font-medium text-foreground">
                  {formatUserDisplayName(user)}
                </span>
              </Link>
              {/* Always show in navbar (narrow viewports hid sign-out behind overflow when bundled with md:hidden sheet + profile). */}
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-secondary md:py-1.5"
                aria-label={t("nav.signOut")}
                title={t("nav.signOut")}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                <span className="hidden md:inline truncate">{t("nav.signOut")}</span>
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className="hidden items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 sm:flex"
            >
              {t("nav.signIn")}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppNav;
