import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

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

  const inputCls =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSuccess("Check your email to confirm your account, then sign in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-foreground">IT Girl</span>
            <span className="text-primary text-lg">✦</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Hero badge */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-4 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-body text-muted-foreground tracking-wider uppercase">
                {mode === "login" ? "Welcome back" : "Join IT Girl"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              {mode === "login" ? "Sign In ◈" : "Create Account △"}
            </h1>
            <p className="font-body text-sm text-muted-foreground">
              {mode === "login"
                ? "Continue your journey in tech"
                : "Start your IT career journey today"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Shahrizoda Bafoyeva"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputCls}
              />
            </div>

            <div>
              <label className="block text-xs font-body font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
                <p className="text-xs font-body text-destructive">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2">
                <p className="text-xs font-body text-primary">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-full font-body font-medium text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-soft"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
                className="text-xs font-body text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === "login"
                  ? "Don't have an account? Register"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
