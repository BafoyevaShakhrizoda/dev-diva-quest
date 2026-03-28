import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import AppNav from "@/components/AppNav";
import { apiClient } from "@/integrations/api/client";

const VerifyEmail = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = (await apiClient.verifyEmail(uid!, token!)) as {
          message?: string;
          error?: string;
        };
        if (response.message && !response.error) {
          setStatus("success");
          setMessage(response.message || "Your email has been verified. You can sign in.");
          setTimeout(() => navigate("/auth"), 3000);
        } else {
          setStatus("error");
          setMessage(response.error || "Verification failed.");
        }
      } catch (err: unknown) {
        const e = err as { data?: { error?: string }; message?: string };
        setStatus("error");
        setMessage(
          (e.data as { error?: string })?.error ||
            e.message ||
            "This link may be invalid or expired."
        );
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage("Invalid verification link.");
    }
  }, [uid, token, navigate]);

  const handleResendEmail = async () => {
    if (!resendEmail.trim()) {
      setMessage("Enter the email you registered with.");
      return;
    }
    setStatus("loading");
    setMessage("Sending…");
    try {
      const response = (await apiClient.resendVerification(resendEmail.trim())) as {
        message?: string;
        error?: string;
      };
      if (response.message) {
        setStatus("success");
        setMessage(response.message);
      } else {
        setStatus("error");
        setMessage(response.error || "Could not resend.");
      }
    } catch (err: unknown) {
      const e = err as { data?: { error?: string }; message?: string };
      setStatus("error");
      setMessage(
        (e.data as { error?: string })?.error || e.message || "Could not resend verification email."
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              {status === "loading" && (
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              )}
              {status === "success" && <CheckCircle className="w-10 h-10 text-green-500" />}
              {status === "error" && <XCircle className="w-10 h-10 text-red-500" />}
            </div>

            <h1 className="font-display text-2xl font-bold text-foreground mb-4">
              {status === "loading" && "Verifying your email…"}
              {status === "success" && "Done"}
              {status === "error" && "Verification issue"}
            </h1>

            <p className="font-body text-muted-foreground mb-8">{message}</p>

            <div className="space-y-4">
              {status === "success" && (
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-primary/90 transition-colors"
                >
                  Go to sign in
                </button>
              )}

              {status === "error" && (
                <>
                  <div className="text-left">
                    <label className="text-xs font-body text-muted-foreground">Email</label>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-body"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-primary/90 transition-colors"
                  >
                    Resend verification email
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="w-full bg-secondary text-foreground px-6 py-3 rounded-xl font-body font-medium hover:bg-secondary/80 transition-colors"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>

            {status === "error" && (
              <div className="mt-8 p-4 bg-muted rounded-xl text-left">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <ul className="font-body text-xs text-muted-foreground space-y-1">
                    <li>• Links expire after a period; register again if needed.</li>
                    <li>• Check spam or promotions folders.</li>
                    <li>• Ensure your deployment uses the same site URL as in the email link.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
