export const LANGS = ["ko", "en"] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = "ko";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

/** ko/en 두 벌을 함께 들고 다니는 필드. `pick()`으로 꺼내 쓴다. */
export type L10n<T = string> = Record<Lang, T>;

export function pick<T>(field: L10n<T>, lang: Lang): T {
  return field[lang];
}

export const LANG_LABEL: Record<Lang, string> = {
  ko: "KO",
  en: "EN",
};

/** html lang 속성용 BCP 47 태그 */
export const HTML_LANG: Record<Lang, string> = {
  ko: "ko-KR",
  en: "en",
};
