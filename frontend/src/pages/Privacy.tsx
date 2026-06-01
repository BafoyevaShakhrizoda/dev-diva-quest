import { Link } from "react-router-dom";
import { FileDown } from "lucide-react";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import { useI18n } from "@/i18n/I18nProvider";

const PRIVACY_SECTIONS = 12;
const PRIVACY_PDF = "/documents/Privacy_Policy_DevGirlzz.pdf";

const Privacy = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="border-b border-border">
        <div className="container mx-auto max-w-3xl px-4 py-14 md:py-20">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-primary">{t("privacy.badge")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{t("privacy.title")}</h1>
          <p className="mt-4 font-body text-sm text-muted-foreground">{t("privacy.intro")}</p>

          <a
            href={PRIVACY_PDF}
            download
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <FileDown className="h-4 w-4" />
            {t("privacy.downloadPdf")}
          </a>

          <div className="mt-10 space-y-8 font-body text-sm leading-relaxed text-muted-foreground [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground">
            {Array.from({ length: PRIVACY_SECTIONS }, (_, i) => i + 1).map((n) => (
              <section key={n}>
                <h2>{t(`privacy.s${n}t`)}</h2>
                <p className="mt-3 whitespace-pre-line">{t(`privacy.s${n}b`)}</p>
              </section>
            ))}
            <section>
              <h2>{t("privacy.contactTitle")}</h2>
              <p className="mt-3">
                {t("privacy.contactBodyBefore")}{" "}
                <a href="mailto:privacy@devgirlzz.com.uz" className="text-primary underline-offset-4 hover:underline">
                  privacy@devgirlzz.com.uz
                </a>
                . {t("privacy.contactBodyMid")}{" "}
                <a href="mailto:support@devgirlzz.com.uz" className="text-primary underline-offset-4 hover:underline">
                  support@devgirlzz.com.uz
                </a>
                .
              </p>
            </section>
          </div>

          <Link
            to="/dashboard"
            className="mt-12 inline-flex font-body text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("privacy.back")}
          </Link>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default Privacy;
