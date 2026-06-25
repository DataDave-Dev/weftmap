import { locales } from "@/i18n/config";

export function getAlternates(path: string, currentLang: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://weftmap.com";

  // cleanPath should start with slash if path is not empty, otherwise empty string
  const cleanPath = path ? `/${path}` : "";

  const languages = locales.reduce((acc, locale) => {
    acc[locale] = `${baseUrl}/${locale}${cleanPath}`;
    return acc;
  }, {} as Record<string, string>);

  // Set default fallback language version to English
  languages["x-default"] = `${baseUrl}/en${cleanPath}`;

  return {
    canonical: `${baseUrl}/${currentLang}${cleanPath}`,
    languages,
  };
}
