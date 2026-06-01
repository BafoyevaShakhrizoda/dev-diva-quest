import type { Locale } from "@/i18n/translations";

export function formatSalaryUzRange(min: number, max: number, locale: Locale): string {
  const tag = locale === "uz" ? "uz-UZ" : locale === "ru" ? "ru-RU" : "en-US";
  const nf = new Intl.NumberFormat(tag);
  return `${nf.format(min)} – ${nf.format(max)} UZS`;
}
