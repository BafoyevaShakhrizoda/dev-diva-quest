import type { CareerCategory } from "@/data/careers";
import type { Locale } from "./translations";
import { translate } from "./translations";

export function categoryLabel(locale: Locale, id: CareerCategory | "all"): string {
  return translate(locale, `careers.cat.${id}`);
}

export function demandLabel(locale: Locale, demand: string): string {
  const keyMap: Record<string, string> = {
    High: "careers.demand.high",
    "Very High": "careers.demand.veryHigh",
    Growing: "careers.demand.growing",
  };
  const key = keyMap[demand];
  return key ? translate(locale, key) : demand;
}
