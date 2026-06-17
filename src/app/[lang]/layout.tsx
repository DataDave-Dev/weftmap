import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "@fontsource-variable/lexend";
import "../globals.css";

export const metadata: Metadata = {
  title: "Weftmap",
  description: "Paste code and get an interactive call graph.",
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang as Locale}>
      <body>
        <div className="grid-bg" aria-hidden="true" />
        <Header lang={lang} variant="light" />
        {children}
        <Footer
          lang={lang}
          tagline={t.tagline}
          license={t.license}
          contribute={t.contribute}
          product={t.footerProduct}
          resources={t.footerResources}
          footerNote={t.footerNote}
        />
      </body>
    </html>
  );
}
