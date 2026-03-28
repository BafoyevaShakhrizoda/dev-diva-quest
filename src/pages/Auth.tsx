import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Eye, EyeOff, Sparkles } from "lucide-react";
import logo from "@/assets/devgirlzz-logo.png";
import { apiClient } from "@/integrations/api/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const inputCls =
    "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        const trimmed = fullName.trim();
        const parts = trimmed.split(/\s+/);
        const first_name = parts[0] || "";
        const last_name = parts.slice(1).join(" ") || "";
        const username =
          `${email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_")}_${Math.random().toString(36).slice(2, 7)}`;

        await apiClient.register({
          username,
          email,
          password,
          password_confirm: password,
          first_name,
          last_name,
        });
        setSuccess(
          "Account created. Check your inbox for a verification link, then sign in here."
        );
      } else {
        await apiClient.login(email, password);
        refreshUser();
        navigate("/dashboard");
      }
    } catch (err: unknown) {
      const e = err as { data?: Record<string, unknown>; message?: string };
      const data = e.data;
      let msg = e.message || "Something went wrong";
      if (data && typeof data === "object") {
        const firstKey = Object.keys(data)[0];
        const val = firstKey ? (data as Record<string, unknown>)[firstKey] : null;
        if (Array.isArray(val) && val[0]) msg = String(val[0]);
        else if (typeof val === "string") msg = val;
        else if (data.detail) msg = String(data.detail);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden gradient-primary flex-col items-center justify-center p-12">
        <div className="absolute top-20 left-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <img
              src={logo}
              alt="DevGirlzz"
              className="h-14 w-14 object-contain drop-shadow-md"
            />
            <span className="font-display text-4xl font-bold text-white tracking-tight">
              DevGirlzz
            </span>
          </div>
          <p className="text-white/85 font-body text-lg leading-relaxed max-w-sm">
            The professional platform for women in tech. Learn, grow, and build your dream IT career.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: "15+", label: "Career Paths" },
              { value: "3", label: "Skill Levels" },
              { value: "100+", label: "Questions" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20"
              >
                <div className="font-display text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/70 text-xs font-body mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-white/60 text-sm font-body">
            <Sparkles size={14} />
            <span>Built exclusively for IT women</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <img src={logo} alt="DevGirlzz" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold text-foreground">
              Dev<span className="text-gradient">Girlzz</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {mode === "login" ? "Welcome back" : "Join DevGirlzz"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {mode === "login"
                ? "Sign in to continue your journey in tech"
                : "Create your account — we will email you a link to verify before you sign in"}
            </p>
          </div>

          <div className="flex bg-secondary rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2 text-sm font-body font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-body font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-body font-semibold text-foreground mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-body font-semibold text-foreground mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 8 : 6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/8 border border-destructive/25 rounded-xl px-4 py-3">
                <p className="text-xs font-body text-destructive">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-primary/8 border border-primary/25 rounded-xl px-4 py-3">
                <p className="text-xs font-body text-primary">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-primary-foreground rounded-xl font-body font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity shadow-soft mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
