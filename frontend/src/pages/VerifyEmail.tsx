import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import AppNav from "@/components/AppNav";
import { apiClient } from "@/integrations/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";

const VerifyEmail = () => {
  const { t } = useI18n();
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = (await apiClient.verifyEmail(uid!, token!)) as {
          message?: string;
          error?: string;
        };
        if (response.message && !response.error) {
          setStatus("success");
          setMessage(response.message || t("verify.msgVerifiedDefault"));
          setTimeout(() => navigate("/auth"), 3500);
        } else {
          setStatus("error");
          setMessage(response.error || t("verify.msgFailedDefault"));
        }
      } catch (err: unknown) {
        const e = err as { data?: Record<string, unknown>; message?: string };
        const d = e.data;
        const fromApi =
          (d?.error != null && String(d.error)) || (d?.detail != null && String(d.detail));
        setStatus("error");
        setMessage(fromApi || e.message || t("verify.msgInvalidLink"));
      }
    };

    if (uid && token) {
      verifyEmail();
    } else {
      setStatus("error");
      setMessage(t("verify.msgInvalidLink"));
    }
  }, [uid, token, navigate, t]);

  const handleResendEmail = async () => {
    if (!resendEmail.trim()) {
      setMessage(t("verify.msgNeedEmail"));
      return;
    }
    setResendBusy(true);
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
        setMessage(response.error || t("verify.msgResendFail"));
      }
    } catch (err: unknown) {
      const e = err as { data?: { error?: string }; message?: string };
      setStatus("error");
      setMessage(
        (e.data && e.data.error && String(e.data.error)) ||
          e.message ||
          t("verify.msgResendFail"),
      );
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/30 via-background to-background">
      <AppNav />

      <div className="container mx-auto px-4 py-16 md:py-24">
        <Card className="mx-auto max-w-md border-border/80 shadow-card">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              {status === "loading" && (
                <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
              )}
              {status === "success" && (
                <CheckCircle className="h-10 w-10 text-emerald-600" aria-hidden />
              )}
              {status === "error" && <XCircle className="h-10 w-10 text-destructive" aria-hidden />}
            </div>
            <CardTitle className="font-display text-2xl">
              {status === "loading" && t("verify.loadingTitle")}
              {status === "success" && t("verify.successTitle")}
              {status === "error" && t("verify.errorTitle")}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {status === "success" && (
              <Button className="w-full rounded-full" size="lg" onClick={() => navigate("/auth")}>
                {t("verify.goSignIn")}
              </Button>
            )}

            {status === "error" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="resend-email">{t("verify.emailLabel")}</Label>
                  <Input
                    id="resend-email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder={t("verify.phEmail")}
                    className="rounded-xl"
                  />
                </div>
                <Button
                  className="w-full rounded-full"
                  size="lg"
                  onClick={handleResendEmail}
                  disabled={resendBusy}
                >
                  {resendBusy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.sending")}
                    </>
                  ) : (
                    t("verify.resend")
                  )}
                </Button>
                <Button variant="secondary" className="w-full rounded-full" asChild>
                  <Link to="/auth">{t("verify.backSignIn")}</Link>
                </Button>
              </>
            )}

            {status === "error" && (
              <div className="rounded-xl border border-border bg-muted/50 p-4 text-left">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• {t("verify.hint1")}</li>
                    <li>• {t("verify.hint2")}</li>
                    <li>
                      • {t("verify.hint3")}{" "}
                      <code className="rounded bg-muted px-1">FRONTEND_URL</code>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;
