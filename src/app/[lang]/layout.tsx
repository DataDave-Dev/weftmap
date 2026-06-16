import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";
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

  return (
    <html lang={lang as Locale}>
      <body>
        <div className="grid-bg" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
