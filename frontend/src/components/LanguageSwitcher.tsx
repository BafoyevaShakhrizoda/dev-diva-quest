import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";
import { localeLabels } from "@/i18n/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const locales: Locale[] = ["en", "ru", "uz"];

const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { locale, setLocale } = useI18n();

  return (
    <div className={`flex items-center gap-1.5 ${className ?? ""}`}>
      <Globe className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
        <SelectTrigger className="h-9 w-[128px] rounded-full border-border text-xs" aria-label="Language">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((l) => (
            <SelectItem key={l} value={l} className="text-sm">
              {localeLabels[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
