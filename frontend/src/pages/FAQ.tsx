import { useMemo } from "react";
import { Link } from "react-router-dom";
import AppNav from "@/components/AppNav";
import AppFooter from "@/components/AppFooter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/i18n/I18nProvider";

const FAQ = () => {
  const { t } = useI18n();

  const faqItems = useMemo(
    () =>
      ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((n) => ({
        q: t(`faq.q${n}`),
        a: t(`faq.a${n}`),
      })),
    [t],
  );

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="border-b border-border">
        <div className="container mx-auto max-w-2xl px-4 py-14 md:py-20">
          <p className="font-body text-xs font-semibold uppercase tracking-wider text-primary">{t("faq.badge")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">{t("faq.title")}</h1>
          <p className="mt-4 font-body text-sm text-muted-foreground">{t("faq.sub")}</p>

          <Accordion type="single" collapsible className="mt-10 w-full space-y-2">
            {faqItems.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="rounded-xl border border-border px-4">
                <AccordionTrigger className="text-left font-body text-sm font-medium text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 font-body text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p className="mt-12 font-body text-sm text-muted-foreground">
            {t("faq.footerBefore")}{" "}
            <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
              {t("faq.privacyLink")}
            </Link>{" "}
            {t("faq.footerAfter")}
          </p>

          <Link
            to="/dashboard"
            className="mt-6 inline-flex font-body text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("faq.back")}
          </Link>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default FAQ;
