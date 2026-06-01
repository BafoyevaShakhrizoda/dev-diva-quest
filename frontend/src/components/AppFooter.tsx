import { Link } from "react-router-dom";
import { useI18n } from "@/i18n/I18nProvider";

const AppFooter = () => {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border bg-card/40">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        aria-hidden
      />
      <div className="container mx-auto max-w-3xl px-4 py-14 text-center md:py-16">
        <nav aria-label={t("footer.legal")} className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link
            to="/privacy"
            className="border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t("footer.privacy")}
          </Link>
          <Link
            to="/faq"
            className="border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t("footer.faq")}
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 border-b border-transparent text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            {t("footer.admin")}
            <span className="sr-only"> — staff login</span>
          </Link>
        </nav>

        <p className="mx-auto mt-8 max-w-md text-center text-[11px] leading-relaxed text-muted-foreground/90">
          {t("footer.note")}
        </p>

        <div className="mt-14 flex flex-col items-center gap-3 border-t border-border/70 pt-8">
          <p className="text-[12px] leading-relaxed text-muted-foreground">{t("footer.copyright", { year })}</p>
          <p className="text-[12px] text-muted-foreground">{t("footer.tagline")}</p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
